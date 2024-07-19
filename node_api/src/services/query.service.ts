import Env from "@/services/env.service";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { AliasEntity, TTProperty, UIProperty } from "@im-library/interfaces";
import { EclSearchRequest, Query, QueryRequest, SearchResponse, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, QUERY, SHACL } from "@im-library/vocabulary";
import { GraphdbService, sanitise } from "@/services/graphdb.service";
import EntityService from "./entity.service";
import { describeQuery, getUnnamedObjects } from "@im-library/helpers/QueryDescriptor";
import { generateMatchIds } from "@im-library/helpers/QueryBuilder";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import IMQtoSQL from "@/logic/IMQtoSQL";

export default class QueryService {
  axios: any;
  entityService: EntityService;
  private graph: GraphdbService;

  constructor(axios: any) {
    this.axios = axios;
    this.graph = GraphdbService.imRepo();
    this.entityService = new EntityService(axios);
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

  public async getQuery(query: QueryRequest): Promise<Query> {
    return await this.axios.post(Env.API + "api/query/public/getQuery", query);
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

  public async isAllowablePropertySuggestionBoolFocus(focus: any, propertyIri: string) {
    let query;
    if (focus.ecl) query = (await this.axios.post(Env.API + "api/ecl/public/queryFromEcl", focus.ecl)).data;
    if (query) {
      const eclSearchRequest = { eclQuery: query, includeLegacy: false, limit: 1000, statusFilter: [{ "@id": IM.ACTIVE }] } as EclSearchRequest;
      const results = (await this.axios.post(Env.API + "api/ecl/public/eclSearch", eclSearchRequest)).data;
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
            valueIriList: results.entities.map((e: any) => {
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

  public async validateSelectionWithQuery(iri: string, queryRequest: QueryRequest) {
    const queryResponse = await this.queryIM(queryRequest);
    return (
      isObjectHasKeys(queryResponse, ["entities"]) &&
      isArrayHasLength(queryResponse.entities) &&
      queryResponse.entities.some((entity: any) => entity["@id"] === iri)
    );
  }
}
