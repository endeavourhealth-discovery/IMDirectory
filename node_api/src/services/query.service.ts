import Env from "@/services/env.service";
import { eclToIMQ } from "@im-library/helpers";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { AliasEntity, EclSearchRequest, QueryResponse, QueryQueueItem } from "@im-library/interfaces";
import { Query, QueryRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import EclService from "./ecl.service";
import { GraphdbService, sanitise } from "@/services/graphdb.service";
import EntityService from "./entity.service";
import { describeQuery, getUnnamedObjects } from "@im-library/helpers/QueryDescriptor";
import { generateMatchIds } from "@im-library/helpers/QueryBuilder";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import IMQtoSQL from "@/logic/IMQtoSQL";
import { DataTypeOIDs, Pool, Connection, Maybe } from "postgresql-client";
import { v4 as uuid } from "uuid";

export default class QueryService {
  axios: any;
  eclService: EclService;
  entityService: EntityService;
  private graph: GraphdbService;
  private dbPool: Pool;

  constructor(axios: any) {
    this.axios = axios;
    this.eclService = new EclService(axios);
    this.graph = GraphdbService.imRepo();
    this.entityService = new EntityService(axios);
    this.dbPool = new Pool();
  }

  public async queryIM(query: QueryRequest, controller?: AbortController): Promise<QueryResponse> {
    const response = await this.axios.post(Env.API + "api/query/public/queryIM", query);
    return response.data;
  }

  public async getAllowableRangeSuggestions(iri: string, searchTerm?: string): Promise<AliasEntity[]> {
    const allowableRangesQuery = {
      query: {
        "@id": IM.query.ALLOWABLE_RANGES
      },
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": iri
          }
        }
      ]
    } as QueryRequest;

    const subtypesQuery = {
      query: {
        "@id": IM.query.GET_ISAS
      },
      argument: [
        {
          parameter: "this",
          valueIriList: [] as TTIriRef[]
        }
      ]
    } as QueryRequest;

    let suggestions = [] as AliasEntity[];
    const allowableRanges = await this.queryIM(allowableRangesQuery);
    if (allowableRanges.entities) {
      subtypesQuery.argument![0].valueIriList = allowableRanges.entities.map((entity: any) => {
        return { "@id": entity["@id"] };
      });

      if (searchTerm) {
        subtypesQuery.textSearch = searchTerm;
      }
      suggestions = (await this.queryIM(subtypesQuery)).entities;
      this.convertTTEntitiesToAlias(suggestions);
    }
    return suggestions;
  }

  public async getAllowablePropertySuggestions(iri: string, searchTerm?: string): Promise<AliasEntity[]> {
    const queryRequest = {
      query: {
        "@id": IM.query.ALLOWABLE_PROPERTIES
      },
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": iri
          }
        }
      ]
    } as QueryRequest;

    if (searchTerm) {
      queryRequest.textSearch = searchTerm;
    }

    let suggestions = [] as AliasEntity[];
    const result = await this.queryIM(queryRequest);
    if (isObjectHasKeys(result, ["entities"])) suggestions = result.entities;
    this.convertTTEntitiesToAlias(suggestions);
    return suggestions;
  }

  public async searchProperties(searchTerm: string): Promise<AliasEntity[]> {
    const queryRequest = {
      query: {
        "@id": IM.query.SEARCH_PROPERTIES
      },
      textSearch: searchTerm
    } as QueryRequest;

    let properties = [] as AliasEntity[];
    const result = await this.queryIM(queryRequest);
    if (isObjectHasKeys(result, ["entities"])) properties = result.entities;
    this.convertTTEntitiesToAlias(properties);
    return properties;
  }

  public async getAllowablePropertySuggestionsBoolFocus(focus: any, searchTerm?: string): Promise<AliasEntity[]> {
    let query;
    let suggestions = [] as AliasEntity[];
    if (focus.ecl) query = eclToIMQ(focus.ecl);
    if (query) {
      const eclSearchRequest = { eclQuery: query, includeLegacy: false, limit: 1000, statusFilter: [{ "@id": IM.ACTIVE }] } as EclSearchRequest;
      const results = await this.eclService.eclSearch(eclSearchRequest);
      if (isArrayHasLength(results)) {
        for (const result of results) {
          const queryRequest = {
            query: {
              "@id": IM.query.ALLOWABLE_PROPERTIES
            },
            argument: [
              {
                parameter: "this",
                valueIri: {
                  "@id": result["@id"]
                }
              }
            ]
          } as QueryRequest;

          if (searchTerm) {
            queryRequest.textSearch = searchTerm;
          }
          const queryResults = (await this.queryIM(queryRequest)).entities;
          this.convertTTEntitiesToAlias(queryResults);
          suggestions = suggestions.concat(queryRequest);
        }
      }
    }
    return suggestions;
  }

  convertTTEntitiesToAlias(ttEntities: any[]) {
    ttEntities.forEach(ttEntity => entityToAliasEntity(ttEntity));
  }

  public async getAllowableChildTypes(iri: string) {
    const queryRequest = {
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": iri
          }
        }
      ],
      query: {
        "@id": IM.query.ALLOWABLE_CHILD_TYPES
      }
    } as any as QueryRequest;

    const response = await this.queryIM(queryRequest);

    if (!isObjectHasKeys(response)) return [];
    return response.entities;
  }

  async getPropertyRange(propIri: string): Promise<any> {
    const isTrue = '"true"^^http://www.w3.org/2001/XMLSchema#boolean';
    const queryRequest = {
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": propIri
          }
        }
      ],
      query: {
        "@id": IM.query.ALLOWABLE_RANGES
      }
    } as any as QueryRequest;

    const response = await this.queryIM(queryRequest);

    if (isObjectHasKeys(response, ["entities"]) && response.entities.length !== 0) {
      return response.entities;
    } else {
      const propType = await this.checkPropertyType(propIri);
      if (propType.objectProperty.id === isTrue) {
        queryRequest.query = { "@id": IM.query.OBJECT_PROPERTY_RANGE_SUGGESTIONS } as any;
        const suggestions = await this.queryIM(queryRequest);
        suggestions.entities.push({
          "@id": IM.CONCEPT,
          "http://www.w3.org/2000/01/rdf-schema#label": "Terminology concept"
        });
        return suggestions.entities;
      } else if (propType.dataProperty.id === isTrue) {
        queryRequest.query = { "@id": IM.query.DATA_PROPERTY_RANGE_SUGGESTIONS } as any;
        const dataTypes = await this.queryIM(queryRequest);
        if (isObjectHasKeys(dataTypes, ["entities"]) && dataTypes.entities.length !== 0) {
          return dataTypes.entities;
        }
      } else return [];
    }
  }

  public async checkPropertyType(propIri: string) {
    const query =
      "SELECT ?objectProperty ?dataProperty " +
      "WHERE {" +
      "bind(exists{?propIri ?isA  ?objProp} as ?objectProperty)" +
      "bind(exists{?propIri ?isA ?dataProp} as ?dataProperty)" +
      "} ";

    const rs = await this.graph.execute(query, {
      propIri: sanitise(propIri),
      isA: sanitise(IM.IS_A),
      objProp: sanitise(IM.DATAMODEL_OBJECTPROPERTY),
      dataProp: sanitise(IM.DATAMODEL_DATAPROPERTY)
    });

    if (isArrayHasLength(rs)) {
      return rs[0];
    }
  }

  public async isFunctionProperty(propIri: string) {
    const isTrue = '"true"^^http://www.w3.org/2001/XMLSchema#boolean';
    const query = "SELECT ?functionProperty " + "WHERE {" + "bind(exists{?propIri ?isA  ?funcProp} as ?functionProperty)" + "} ";

    const rs = await this.graph.execute(query, {
      propIri: sanitise(propIri),
      isA: sanitise(IM.IS_A),
      funcProp: sanitise(IM.DATAMODEL_FUNCTIONPROPERTY)
    });

    if (isArrayHasLength(rs)) {
      return rs[0].functionProperty.value;
    }
  }

  public async getQueryDisplay(queryIri: string) {
    const entityResponse = await this.entityService.getPartialEntity(queryIri, [IM.DEFINITION]);
    if (!isObjectHasKeys(entityResponse, ["data"]) || !isObjectHasKeys(entityResponse.data, [IM.DEFINITION])) {
      return {};
    }
    const query = JSON.parse(entityResponse.data[IM.DEFINITION]);
    if (query.query) {
      for (const a in query.query) {
        if (!query.query[a].match) {
          query.query[a].return = [];
        }
      }
    }

    const labeledQuery = await this.getLabeledQuery(query);
    const queryWithMatchIds = generateMatchIds(labeledQuery);
    return await this.generateQueryDescriptions(queryWithMatchIds);
  }

  public async getLabeledQuery(query: Query) {
    const sparqlStart = "SELECT ?s ?o {" + " ?s rdfs:label ?o " + "VALUES ?s { ";
    let sparqlBody = "";
    const sparqlEnd = "} }";

    const unnamedObjects = getUnnamedObjects(query);
    for (const iri of Object.keys(unnamedObjects)) {
      sparqlBody += "<" + iri + "> ";
    }
    const completeQuery = sparqlStart + sparqlBody + sparqlEnd;
    const iriToNameMap = new Map<string, string>();

    const rs = await this.graph.execute(completeQuery);

    if (isArrayHasLength(rs))
      for (const r of rs)
        if (isArrayHasLength(Object.keys(r)))
          if (isObjectHasKeys(r, ["s", "o"])) {
            if (r.s.id && r.o.id) iriToNameMap.set(r.s.id, r.o.id.replaceAll('"', ""));
          }

    for (const iri of Object.keys(unnamedObjects)) {
      for (const unnamedObject of unnamedObjects[iri]) {
        unnamedObject.name = iriToNameMap.get(iri) ?? getNameFromRef(unnamedObject);
      }
    }

    return query;
  }

  public async generateQueryDescriptions(query: Query): Promise<Query> {
    return describeQuery(query);
  }

  public async getDataModelProperty(dataModelIri: string, propertyIri: string) {
    const queryRequest = {
      query: { "@id": IM.query.DM_PROPERTY },
      argument: [
        {
          parameter: "myDataModel",
          valueIri: {
            "@id": dataModelIri
          }
        },
        {
          parameter: "myProperty",
          valueIri: {
            "@id": propertyIri
          }
        }
      ]
    } as any as QueryRequest;
    const results = await this.queryIM(queryRequest);
    if (isObjectHasKeys(results, ["entities"]) && results.entities.length !== 0) {
      return results.entities;
    } else return [];
  }

  public async generateQuerySQL(queryIri: string): Promise<string> {
    const entityResponse = await this.entityService.getPartialEntity(queryIri, [IM.DEFINITION]);
    if (!isObjectHasKeys(entityResponse, ["data"]) || !isObjectHasKeys(entityResponse.data, [IM.DEFINITION])) {
      return "";
    }
    const query = JSON.parse(entityResponse.data[IM.DEFINITION]);
    return IMQtoSQL(query);
  }

  public async generateQuerySQLfromQuery(query: Query) {
    return IMQtoSQL(query);
  }

  public async validateSelectionWithQuery(iri: string, queryRequest: QueryRequest) {
    const queryResponse = await this.queryIM(queryRequest);
    return (
      isObjectHasKeys(queryResponse, ["entities"]) &&
      isArrayHasLength(queryResponse.entities) &&
      queryResponse.entities.some((entity: any) => entity["@id"] === iri)
    );
  }

  public async queueQuery(queryIri: string, user: string) {
    const queryId = uuid();
    const conn = await this.dbPool.acquire();
    const pid = conn.processID;

    await this.initialiseQueue(conn, queryId, queryIri, user, pid);

    let sql = await this.generateQuerySQL(queryIri);
    sql = sql?.replaceAll("$referenceDate", "NOW()");
    sql = 'CREATE TABLE "qry_' + queryId + '" AS ' + sql;

    conn
      .query(sql)
      .then(async () => {
        await this.updateQueryQueue(conn, queryId, "Finished");
      })
      .catch(async (error: any) => {
        console.log("QUERY ERROR!");
        console.log(error);
        await this.updateQueryQueue(conn, queryId, "Error: " + error);
      })
      .finally(async () => {
        await conn.close();
      }); // Run the actual query

    return queryId;
  }

  private async initialiseQueue(conn: Connection, queryId: string, queryIri: string, user: string, pid: Maybe<number>) {
    const stmt = await conn.prepare(
      "INSERT INTO query_queue(id, iri, user_id, queued, started, pid, status) VALUES ($1, $2, $3, NOW(), NOW(), $4, 'Running')",
      {
        paramTypes: [DataTypeOIDs.uuid, DataTypeOIDs.varchar, DataTypeOIDs.uuid, DataTypeOIDs.int4]
      }
    );
    try {
      await stmt.execute({ params: [queryId, queryIri, user, pid] });
    } finally {
      await stmt.close();
    }
  }

  private async updateQueryQueue(conn: Connection, id: string, status: string, killed: boolean = false) {
    const sql = killed
      ? "UPDATE query_queue SET killed = NOW(), status = $1 WHERE id = $2"
      : "UPDATE query_queue SET finished = NOW(), status = $1 WHERE id = $2";
    const stmt = await conn.prepare(sql, {
      paramTypes: [DataTypeOIDs.text, DataTypeOIDs.uuid]
    });
    try {
      await stmt.execute({ params: [status, id] });
    } finally {
      await stmt.close();
    }
  }

  public async listQueries(user: string) {
    const conn = await this.dbPool.acquire();
    try {
      const stmt = await conn.prepare(
        "SELECT id, iri, queued, started, finished, killed, status, p.pid FROM query_queue q LEFT JOIN pg_stat_activity p ON p.pid = q.pid WHERE user_id = $1 ORDER BY queued DESC",
        {
          paramTypes: [DataTypeOIDs.uuid]
        }
      );
      try {
        const rs = await stmt.execute({ params: [user] });
        const rows: any[] | undefined = rs.rows;
        return rows?.map(
          r =>
            ({
              id: r[0],
              iri: r[1],
              queued: new Date(r[2]).toLocaleString(),
              started: r[3] ? new Date(r[3]).toLocaleString() : undefined,
              finished: r[4] ? new Date(r[4]).toLocaleString() : undefined,
              killed: r[5] ? new Date(r[5]).toLocaleString() : undefined,
              status: r[6] == "Killed" && r[7] ? "Killing..." : r[6],
              pid: r[7]
            }) as QueryQueueItem
        );
      } finally {
        await stmt.close();
      }
    } finally {
      await conn.close();
    }
  }

  public async killQuery(query_id: string, user: string) {
    const conn = await this.dbPool.acquire();
    try {
      const pid = await this.getQueryQueuePid(conn, query_id, user);
      console.log("Kill PID");
      console.log(pid);
      if (pid) {
        await conn.execute("SELECT pg_terminate_backend(" + pid + ")");
        await this.updateQueryQueue(conn, query_id, "Killed", true);
      }
    } finally {
      await conn.close();
    }
  }

  private async getQueryQueuePid(conn: Connection, query_id: string, user: string) {
    const stmt = await conn.prepare("SELECT q.pid FROM query_queue q JOIN pg_stat_activity p ON p.pid = q.pid WHERE user_id = $1 AND id = $2", {
      paramTypes: [DataTypeOIDs.uuid, DataTypeOIDs.uuid]
    });
    try {
      const rs = await stmt.execute({ params: [user, query_id] });
      console.log("QueuePid");
      console.log(rs);
      if (rs?.rows?.length == 1) return rs.rows[0];
    } finally {
      await stmt.close();
    }
    return null;
  }

  public async deleteFromQueue(query_id: string, user: string) {
    const conn = await this.dbPool.acquire();
    try {
      const stmt = await conn.prepare(
        "DELETE FROM query_queue USING query_queue AS q LEFT JOIN pg_stat_activity AS p ON p.pid = q.pid WHERE q.pid = query_queue.pid AND q.user_id = $1 AND q.id = $2 AND p.pid IS NULL",
        {
          paramTypes: [DataTypeOIDs.uuid, DataTypeOIDs.uuid]
        }
      );
      try {
        const rs = await stmt.execute({ params: [user, query_id] });
        return rs?.rowsAffected == 1;
      } finally {
        await stmt.close();
      }
    } finally {
      conn.close();
    }
  }
}
