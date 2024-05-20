import Env from "@/services/env.service";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { AliasEntity, EclSearchRequest, QueryResponse, QueryQueueItem, IMQSQL } from "@im-library/interfaces";
import { AliasEntity, EclSearchRequest, TTProperty, UIProperty } from "@im-library/interfaces";
import { Query, QueryRequest, SearchResponse, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, QUERY, SHACL } from "@im-library/vocabulary";
import EclService from "./ecl.service";
import { GraphdbService, sanitise } from "@/services/graphdb.service";
import EntityService from "./entity.service";
import { describeQuery, getUnnamedObjects } from "@im-library/helpers/QueryDescriptor";
import { generateMatchIds } from "@im-library/helpers/QueryBuilder";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import IMQtoSQL from "@/logic/IMQtoSQL";
import { DataTypeOIDs, Pool, Connection, Maybe } from "postgresql-client";
import { v4 as uuid } from "uuid";
import { SqlQuery } from "@/model/sql/SqlQuery";

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

  public async queryIM(query: QueryRequest, controller?: AbortController): Promise<any> {
    const response = await this.axios.post(Env.API + "api/query/public/queryIM", query);
    return response.data;
  }

  public async queryIMSearch(queryRequest: QueryRequest, controller?: AbortController): Promise<SearchResponse> {
    const response = await this.axios.post(Env.API + "api/query/public/queryIMSearch", queryRequest, { controller: controller?.signal });
    return response.data;
  }

  public async askQueryIM(query: QueryRequest): Promise<boolean> {
    const response = await this.axios.post(Env.API + "api/query/public/askQueryIM", query);
    return response.data;
  }

  public async getAllByType(iri: string): Promise<TTIriRef[]> {
    const response = await this.axios.get(Env.API + "api/query/public/allByType", {
      params: {
        iri: iri
      }
    });
    return response.data;
  }

  public async getQuery(query: QueryRequest): Promise<Query> {
    return await this.axios.post(Env.API + "api/query/public/getQuery", query);
  }

  public async getAllowableRangeSuggestions(iri: string, searchTerm?: string): Promise<SearchResponse> {
    const allowableRangesQuery: QueryRequest = {
      query: {
        "@id": QUERY.ALLOWABLE_RANGE_SUGGESTIONS
      },
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": iri
          }
        }
      ],
      textSearch: searchTerm
    };

    return await this.queryIMSearch(allowableRangesQuery);
  }

  public async isAllowableRangeSuggestion(propertyIri: string, rangeIri: string): Promise<boolean> {
    const allowableRangesQuery: QueryRequest = {
      query: {
        "@id": QUERY.ALLOWABLE_RANGE_SUGGESTIONS
      },
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": propertyIri
          }
        }
      ],
      askIri: rangeIri
    };

    return this.askQueryIM(allowableRangesQuery);
  }

  public async getAllowablePropertySuggestions(iri: string, searchTerm?: string, page?: number, size?: number): Promise<SearchResponse> {
    const queryRequest: QueryRequest = {
      query: {
        "@id": QUERY.ALLOWABLE_PROPERTIES
      },
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": iri
          }
        }
      ]
    };

    if (searchTerm) {
      queryRequest.textSearch = searchTerm;
    }

    if (page && size) {
      queryRequest.page = { pageNumber: page, pageSize: size };
    }

    return await this.queryIMSearch(queryRequest);
  }

  public async isAllowablePropertySuggestion(conceptIri: string, propertyIri: string): Promise<boolean> {
    const queryRequest: QueryRequest = {
      query: {
        "@id": QUERY.ALLOWABLE_PROPERTIES
      },
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": conceptIri
          }
        }
      ],
      askIri: propertyIri
    };

    return await this.askQueryIM(queryRequest);
  }

  public async searchProperties(searchTerm: string): Promise<SearchResponse> {
    const queryRequest: QueryRequest = {
      query: {
        "@id": QUERY.SEARCH_PROPERTIES
      },
      textSearch: searchTerm
    };

    return await this.queryIMSearch(queryRequest);
  }

  public async getAllowablePropertySuggestionsBoolFocus(focus: any, searchTerm?: string, page?: number, size?: number): Promise<SearchResponse> {
    let query;
    if (focus.ecl) query = (await this.axios.post(Env.API + "api/ecl/public/queryFromEcl", focus.ecl)).data;
    if (query) {
      const queryRequest: QueryRequest = {
        query: {
          "@id": QUERY.ALLOWABLE_PROPERTIES
        }
      };
      const eclSearchRequest: EclSearchRequest = { eclQuery: query, includeLegacy: false, limit: 1000, statusFilter: [{ "@id": IM.ACTIVE }] };
      const results = await this.eclService.eclSearch(eclSearchRequest);
      if (results.entities?.length)
        queryRequest.argument = [
          {
            parameter: "this",
            valueIriList: results.entities.map(e => {
              return { "@id": e.iri };
            })
          }
        ];
      queryRequest.textSearch = searchTerm;
      if (page && size) queryRequest.page = { pageNumber: page, pageSize: size };
      return await this.queryIMSearch(queryRequest);
    }
    return {} as SearchResponse;
  }

  public async isAllowablePropertySuggestionBoolFocus(focus: any, propertyIri: string) {
    let query;
    if (focus.ecl) query = (await this.axios.post(Env.API + "api/ecl/public/queryFromEcl", focus.ecl)).data;
    if (query) {
      const eclSearchRequest = { eclQuery: query, includeLegacy: false, limit: 1000, statusFilter: [{ "@id": IM.ACTIVE }] } as EclSearchRequest;
      const results = await this.eclService.eclSearch(eclSearchRequest);
      const queryRequest = {
        query: {
          "@id": QUERY.ALLOWABLE_PROPERTIES
        },
        askIri: propertyIri
      } as QueryRequest;
      if (results.entities?.length)
        queryRequest.argument = [
          {
            parameter: "this",
            valueIriList: results.entities.map(e => {
              return { "@id": e.iri };
            })
          }
        ];
      return await this.askQueryIM(queryRequest);
    }
    return false;
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
        "@id": QUERY.ALLOWABLE_CHILD_TYPES
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
        "@id": QUERY.ALLOWABLE_RANGES
      }
    } as any as QueryRequest;

    const response = await this.queryIM(queryRequest);

    if (isObjectHasKeys(response, ["entities"]) && response.entities.length !== 0) {
      return response.entities;
    } else {
      const propType = await this.checkPropertyType(propIri);
      if (propType.objectProperty.id === isTrue) {
        queryRequest.query = { "@id": QUERY.OBJECT_PROPERTY_RANGE_SUGGESTIONS } as any;
        const suggestions = await this.queryIM(queryRequest);
        suggestions.entities.push({
          "@id": IM.CONCEPT,
          "http://www.w3.org/2000/01/rdf-schema#label": "Terminology concept"
        });
        return suggestions.entities;
      } else if (propType.dataProperty.id === isTrue) {
        queryRequest.query = { "@id": QUERY.DATA_PROPERTY_RANGE_SUGGESTIONS } as any;
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

  public async getQueryDisplay(queryIri: string, includeLogicDesc: boolean) {
    const entityResponse = await this.entityService.getPartialEntity(queryIri, [IM.DEFINITION]);
    if (!isObjectHasKeys(entityResponse, ["data"]) || !isObjectHasKeys(entityResponse.data, [IM.DEFINITION])) {
      return {};
    }
    const query = JSON.parse(entityResponse.data[IM.DEFINITION]);
    return await this.getQueryDisplayFromQuery(query, includeLogicDesc);
  }

  public async getQueryDisplayFromQuery(query: Query, includeLogicDesc: boolean) {
    const labeledQuery = await this.getLabeledQuery(query);
    const queryWithMatchIds = generateMatchIds(labeledQuery);
    return await this.generateQueryDescriptions(queryWithMatchIds, includeLogicDesc);
  }

  public async getLabeledQuery(query: Query) {
    const sparqlStart = "SELECT ?s ?o {" + " ?s rdfs:label ?o " + "VALUES ?s { ";
    let sparqlBody = "";
    const sparqlEnd = "} }";

    const unnamedObjects = getUnnamedObjects(query);
    for (const iri of Object.keys(unnamedObjects)) {
      if (!iri.includes(" ")) sparqlBody += "<" + iri + "> ";
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

  public async generateQueryDescriptions(query: Query, includeLogicDesc: boolean): Promise<Query> {
    return describeQuery(query, includeLogicDesc);
  }

  public async getDataModelProperty(dataModelIri: string, propertyIri: string): Promise<UIProperty | undefined> {
    const queryRequest = {
      query: { "@id": QUERY.DM_PROPERTY },
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
    if (isObjectHasKeys(results, ["entities"]) && isArrayHasLength(results.entities)) {
      const ttproperty: any = results.entities[0];
      const uiProperty = {} as UIProperty;
      if (ttproperty[SHACL.MAXCOUNT]) uiProperty.maxCount = ttproperty[SHACL.MAXCOUNT];
      if (ttproperty[SHACL.MINCOUNT]) uiProperty.minCount = ttproperty[SHACL.MINCOUNT];
      if (isArrayHasLength(ttproperty[SHACL.CLASS])) {
        uiProperty.propertyType = "class";
        uiProperty.valueType = ttproperty[SHACL.CLASS]![0]["@id"];
      }
      if (isArrayHasLength(ttproperty[SHACL.DATATYPE])) {
        uiProperty.propertyType = "datatype";
        uiProperty.valueType = ttproperty[SHACL.DATATYPE]![0]["@id"];
      }
      if (isArrayHasLength(ttproperty[SHACL.NODE])) {
        uiProperty.propertyType = "node";
        uiProperty.valueType = ttproperty[SHACL.NODE]![0]["@id"];
      }
      uiProperty.propertyName = getNameFromRef({ "@id": propertyIri });
      return uiProperty;
    } else return undefined;
  }

  public async generateQuerySQL(queryIri: string, alias?: string): Promise<string> {
    const query = await this.getQueryDefinition(queryIri);
    return this.generateQuerySQLFromQuery(query, alias);
  }

  public async generateQuerySQLFromQuery(query: Query, alias?: string): Promise<string> {
    const imqsql = await this.generateIMQSQLFromQuery(query, alias);

    let sql = alias ? "CREATE TABLE qry_" + alias + " AS\nWITH " : "WITH ";

    if (imqsql.queries) {
      for (const dep of [...imqsql.queries.values()].reverse()) {
        sql += dep.alias + " AS (\nWITH " + dep.sql + "\n),\n";
      }
    }

    sql += imqsql.sql;

    return sql;
  }

  private async getQueryDefinition(queryIri: string): Promise<Query> {
    const entityResponse = await this.entityService.getPartialEntity(queryIri, [IM.DEFINITION]);

    if (!isObjectHasKeys(entityResponse, ["data"]) || !isObjectHasKeys(entityResponse.data, [IM.DEFINITION]))
      throw new Error("Query does not have a definition [" + queryIri + "]");

    const query: Query = JSON.parse(entityResponse.data[IM.DEFINITION]);

    if (!query) throw new Error("Query contains a blank definition [" + queryIri + "]");

    return query;
  }

  private async generateIMQSQLFromQuery(query: Query, alias?: string): Promise<IMQSQL> {
    const result = IMQtoSQL(query, alias);

    if (result.queries) {
      let notGenerated = [...result.queries.values()].find(q => !q.sql);
      while (notGenerated) {
        const definition = await this.getQueryDefinition(notGenerated.iri);
        const depResult = await this.generateIMQSQLFromQuery(definition, notGenerated.alias);
        notGenerated.sql = depResult.sql;

        for (const subdep of depResult.queries.values()) {
          const x = result.queries.get(subdep.iri);
          if (x) {
            result.queries.delete(x.iri);
            result.queries.set(x.iri, x);
          }
        }

        notGenerated = [...result.queries.values()].find(q => !q.sql);
      }
    }

    return result;
  }

  public async validateSelectionWithQuery(iri: string, queryRequest: QueryRequest) {
    const queryResponse = await this.queryIM(queryRequest);
    return (
      isObjectHasKeys(queryResponse, ["entities"]) &&
      isArrayHasLength(queryResponse.entities) &&
      queryResponse.entities.some((entity: any) => entity["@id"] === iri)
    );
  }

  public async queueQuery(queryIri: string, name: string, modelIri: string, user: string) {
    const queueId = uuid().replaceAll("-", "");
    const conn = await this.dbPool.acquire();
    const pid = conn.processID;

    await this.initialiseQueue(queueId, queryIri, name, modelIri, user, pid);

    let sql = await this.generateQuerySQL(queryIri);
    sql = sql?.replaceAll("$referenceDate", "NOW()");
    sql = "CREATE TABLE qry_" + queueId + " AS " + sql;

    conn
      .query(sql)
      .then(async result => {
        // await this.updateQueryQueue(queryId, "Finished: " + result.rowsAffected + " rows");
        await this.updateQueryQueue(queueId, "Finished");
      })
      .catch(async (error: any) => {
        await this.updateQueryQueue(queueId, "Error: " + error);
      })
      .finally(async () => {
        await conn.close();
      });

    return queueId;
  }

  private async initialiseQueue(queueId: string, queryIri: string, name: string, modelIri: string, user: string, pid: Maybe<number>) {
    const conn = await this.dbPool.acquire();

    try {
      const stmt = await conn.prepare(
        "INSERT INTO query_queue(id, iri, name, base_type, user_id, queued, started, pid, status) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, 'Running')",
        {
          paramTypes: [DataTypeOIDs.uuid, DataTypeOIDs.varchar, DataTypeOIDs.varchar, DataTypeOIDs.varchar, DataTypeOIDs.uuid, DataTypeOIDs.int4]
        }
      );

      try {
        await stmt.execute({ params: [queueId, queryIri, name, modelIri, user, pid] });
      } finally {
        await stmt.close();
      }
    } finally {
      await conn.close();
    }
  }

  private async updateQueryQueue(queueId: string, status: string, stopped: boolean = false) {
    const conn = await this.dbPool.acquire();
    try {
      const sql = stopped
        ? "UPDATE query_queue SET stopped = NOW(), status = $1 WHERE id = $2"
        : "UPDATE query_queue SET finished = NOW(), status = $1 WHERE id = $2";
      const stmt = await conn.prepare(sql, {
        paramTypes: [DataTypeOIDs.text, DataTypeOIDs.uuid]
      });
      try {
        await stmt.execute({ params: [status, queueId] });
      } finally {
        await stmt.close();
      }
    } finally {
      await conn.close();
    }
  }

  public async listQueries(user: string) {
    const conn = await this.dbPool.acquire();
    try {
      const stmt = await conn.prepare(
        "SELECT id, iri, name, queued, started, finished, stopped, status, p.pid, base_type FROM query_queue q LEFT JOIN pg_stat_activity p ON p.pid = q.pid WHERE user_id = $1 ORDER BY queued DESC",
        {
          paramTypes: [DataTypeOIDs.uuid]
        }
      );
      try {
        const rs = await stmt.execute({ params: [user] });
        const rows: any[] | undefined = rs.rows;
        return rows?.map(r => {
          const q = new Date(r[3]);
          const s = r[4] ? new Date(r[4]) : undefined;
          const f = r[5] ? new Date(r[5]) : undefined;
          const k = r[6] ? new Date(r[6]) : undefined;

          const t = s ? (f ? this.dateTimeDiff(s, f) : k ? this.dateTimeDiff(s, k) : undefined) : undefined;

          return {
            id: r[0],
            iri: r[1],
            name: r[2],
            queued: q.toLocaleString(),
            started: s?.toLocaleString(),
            finished: f?.toLocaleString(),
            stopped: k?.toLocaleString(),
            time: t?.toLocaleString(),
            status: r[7] == "Stopped" && r[8] ? "Stopping..." : r[7],
            pid: r[8],
            baseType: r[9]
          } as QueryQueueItem;
        });
      } finally {
        await stmt.close();
      }
    } finally {
      await conn.close();
    }
  }

  private dateTimeDiff(datePast: Date, dateFuture: Date): string {
    let millis = dateFuture.getTime() - datePast.getTime();
    let seconds = Math.floor(millis / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    hours = hours - days * 24;
    minutes = minutes - days * 24 * 60 - hours * 60;
    seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;
    millis = millis - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000 - minutes * 60 * 1000 - seconds * 1000;

    let result = days == 0 ? "" : days + " days, ";
    result += (hours < 10 ? "0" + hours : hours) + ":";
    result += (minutes < 10 ? "0" + minutes : minutes) + ":";
    result += (seconds < 10 ? "0" + seconds : seconds) + ".";
    if (millis < 10) result += "00" + millis;
    else result += millis < 100 ? "0" + millis : millis;

    return result;
  }

  public async stopQuery(queueId: string, user: string) {
    const conn = await this.dbPool.acquire();
    try {
      const pid = await this.getQueryQueuePid(conn, queueId, user);
      if (pid) {
        await conn.execute("SELECT pg_terminate_backend(" + pid + ")");
        await this.updateQueryQueue(queueId, "Stopped", true);
      }
    } finally {
      await conn.close();
    }
  }

  private async getQueryQueuePid(conn: Connection, queueId: string, user: string) {
    const stmt = await conn.prepare("SELECT q.pid FROM query_queue q JOIN pg_stat_activity p ON p.pid = q.pid WHERE user_id = $1 AND id = $2", {
      paramTypes: [DataTypeOIDs.uuid, DataTypeOIDs.uuid]
    });
    try {
      const rs = await stmt.execute({ params: [user, queueId] });
      if (rs?.rows?.length == 1) return rs.rows[0];
    } finally {
      await stmt.close();
    }
    return null;
  }

  public async deleteFromQueue(queueId: string, user: string) {
    const conn = await this.dbPool.acquire();
    try {
      await conn.execute('DROP TABLE IF EXISTS "qry_' + queueId + '"');

      let stmt = await conn.prepare("DELETE FROM query_queue WHERE user_id = $1 AND id = $2", {
        paramTypes: [DataTypeOIDs.uuid, DataTypeOIDs.uuid]
      });
      try {
        const rs = await stmt.execute({ params: [user, queueId] });
        return rs?.rowsAffected == 1;
      } finally {
        await stmt.close();
      }
    } finally {
      await conn.close();
    }
  }

  public async getResultData(queueId: string, user: string, page: number, size: number) {
    const conn = await this.dbPool.acquire();

    try {
      await this.checkQueryIsUsers(conn, queueId, user);
      const rs = await conn.query("SELECT * FROM qry_" + queueId.replaceAll("-", "") + " LIMIT " + size + " OFFSET " + (page - 1) * size);
      if (!rs.rows) return [];

      const result = rs.rows.map((r: any[]) => ({ id: r[0], json: r[1] }));

      return result;
    } finally {
      await conn.close();
    }
  }

  public async getGraphData(queueId: string, user: string, groupIris: string[], calc: string, calcField?: string) {
    const conn = await this.dbPool.acquire();
    const tbl = "qry_" + queueId.replaceAll("-", "");

    try {
      await this.checkQueryIsUsers(conn, queueId, user);

      const qry = SqlQuery.create("http://endhealth.info/im#Patient", "", tbl);
      const grpFields = groupIris.map(gi => qry.getFieldName(gi));
      const sql =
        "SELECT " +
        grpFields.join(", ") +
        ", COUNT(1)\n" +
        "FROM " +
        tbl +
        "\n" +
        "GROUP BY " +
        grpFields.join(", ") +
        "\nORDER BY " +
        grpFields.join(" ASC, ") +
        " ASC";

      const result = (await conn.execute(sql))?.results?.[0]?.rows;

      return result;
    } finally {
      await conn.close();
    }
  }

  private async checkQueryIsUsers(conn: Connection, queueId: string, user: string) {
    const stmt = await conn.prepare("SELECT 1 FROM query_queue WHERE user_id = $1 AND id = $2", {
      paramTypes: [DataTypeOIDs.uuid, DataTypeOIDs.uuid]
    });

    try {
      const rs = await stmt.execute({ params: [user, queueId] });

      if (rs?.rowsAffected == 0) throw new Error("Queue item does not belong to user!");
    } finally {
      await stmt.close();
    }
  }
}
