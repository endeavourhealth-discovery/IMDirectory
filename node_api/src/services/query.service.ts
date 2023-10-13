import Env from "@/services/env.service";
import { eclToIMQ } from "@im-library/helpers";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { AliasEntity, EclSearchRequest } from "@im-library/interfaces";
import { Query, QueryRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import EclService from "./ecl.service";
import { GraphdbService, sanitise } from "@/services/graphdb.service";
import EntityService from "./entity.service";
import { describeQuery, getUnnamedObjects } from "@im-library/helpers/QueryDescriptor";
import { generateMatchIds } from "@im-library/helpers/QueryBuilder";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import IMQtoSQL from "@/logic/IMQtoSQL";

export default class QueryService {
  axios: any;
  eclService: EclService;
  entityService: EntityService;
  private graph: GraphdbService;

  constructor(axios: any) {
    this.axios = axios;
    this.eclService = new EclService(axios);
    this.graph = GraphdbService.imRepo();
    this.entityService = new EntityService(axios);
  }

  public async queryIM(query: QueryRequest, controller?: AbortController) {
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

  public async generateQuerySQL(queryIri: string) {
    const entityResponse = await this.entityService.getPartialEntity(queryIri, [IM.DEFINITION]);
    if (!isObjectHasKeys(entityResponse, ["data"]) || !isObjectHasKeys(entityResponse.data, [IM.DEFINITION])) {
      return {};
    }
    const query = JSON.parse(entityResponse.data[IM.DEFINITION]);
    return IMQtoSQL(query);
  }

  public async generateQuerySQLfromQuery(query: Query) {
    return IMQtoSQL(query);
  }
}
