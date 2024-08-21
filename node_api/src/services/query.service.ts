import Env from "@/services/env.service";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { EclSearchRequest, Query, QueryRequest, SearchResponse, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, QUERY } from "@im-library/vocabulary";
import { GraphdbService } from "@/services/graphdb.service";
import EntityService from "./entity.service";

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
      const propType = (await this.axios.get(Env.API + "entity/public/checkPropertyType", { iri: propIri })).data;
      if (propType === IM.DATAMODEL_OBJECTPROPERTY) {
        queryRequest.query = { "@id": QUERY.OBJECT_PROPERTY_RANGE_SUGGESTIONS } as any;
        const suggestions = await this.queryIM(queryRequest);
        suggestions.entities.push({
          "@id": IM.CONCEPT,
          "http://www.w3.org/2000/01/rdf-schema#label": "Terminology concept"
        });
        return suggestions.entities;
      } else if (propType === IM.DATAMODEL_DATAPROPERTY) {
        queryRequest.query = { "@id": QUERY.DATA_PROPERTY_RANGE_SUGGESTIONS } as any;
        const dataTypes = await this.queryIM(queryRequest);
        if (isObjectHasKeys(dataTypes, ["entities"]) && dataTypes.entities.length !== 0) {
          return dataTypes.entities;
        }
      } else return [];
    }
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
