import Env from "@/services/env.service";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { EclSearchRequest, Query, QueryRequest, SearchResponse } from "@im-library/interfaces/AutoGen";
import { IM, QUERY } from "@im-library/vocabulary";
import EntityService from "./entity.service";

import IMQtoSQL from "@/logic/IMQtoSQL";

export default class QueryService {
  axios: any;
  entityService: EntityService;

  constructor(axios: any) {
    this.axios = axios;
    this.entityService = new EntityService(axios);
  }

  public async queryIM(query: QueryRequest, controller?: AbortController): Promise<any> {
    const response = await this.axios.post(Env.API + "api/query/public/queryIM", query);
    return response.data;
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
