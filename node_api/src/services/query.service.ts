import Env from "@/services/env.service";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { AliasEntity } from "@im-library/interfaces";
import { From, QueryRequest, TTAlias, TTIriRef } from "@im-library/interfaces/AutoGen";
import { Console } from "console";

export default class QueryService {
  axios: any;

  constructor(axios: any) {
    this.axios = axios;
  }

  public async queryIM(query: QueryRequest, controller?: AbortController) {
    try {
      const response = await this.axios.post(Env.API + "api/query/public/queryIM", query);
      return response.data;
    } catch (error) {
      return {} as any;
    }
  }

  public async getAllowableRangeSuggestions(iri: string, searchTerm?: string): Promise<AliasEntity[]> {
    const allowableRangesQuery = {
      query: {
        "@id": "http://endhealth.info/im#Query_AllowableRanges"
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
        "@id": "http://endhealth.info/im#Query_GetIsas"
      },
      argument: [
        {
          parameter: "this",
          valueIriList: [] as TTIriRef[]
        }
      ]
    } as QueryRequest;

    let suggestions = [] as AliasEntity[];
    try {
      const allowableRanges = await this.queryIM(allowableRangesQuery);
      if (allowableRanges.entities) {
        subtypesQuery.argument[0].valueIriList = allowableRanges.entities.map((entity: any) => {
          return { "@id": entity["@id"] };
        });

        if (searchTerm) {
          subtypesQuery.textSearch = searchTerm;
        }
        suggestions = (await this.queryIM(subtypesQuery)).entities;
        this.convertTTEntitiesToAlias(suggestions);
      }
      return suggestions;
    } catch (error) {
      return suggestions;
    }
  }

  public async getAllowablePropertySuggestions(iri: string, searchTerm?: string): Promise<AliasEntity[]> {
    const queryRequest = {
      query: {
        "@id": "http://endhealth.info/im#Query_AllowableProperties"
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
    try {
      suggestions = (await this.queryIM(queryRequest)).entities;
      this.convertTTEntitiesToAlias(suggestions);
      return suggestions;
    } catch (error) {
      return suggestions;
    }
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
        "@id": "http://endhealth.info/im#AllowableChildTypes"
      }
    } as any as QueryRequest;

    const response = await this.queryIM(queryRequest);

    if (!isObjectHasKeys(response)) return [];
    return response.entities;
  }
}
