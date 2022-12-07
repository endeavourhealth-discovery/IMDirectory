import Env from "@/services/env.service";
import { QueryRequest } from "im-library/interfaces";
import { Query, TTAlias } from "im-library/interfaces/AutoGen";
import { IM, RDFS } from "im-library/vocabulary";

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

  public async getAllowableRangeSuggestions(iri: string, searchTerm?: string) {
    const allowableRangesQuery = {
      query: {
        "@id": "http://endhealth.info/im#Query_AllowableRanges"
      },
      argument: {
        this: iri
      }
    } as QueryRequest;
    const subtypesQuery = {
      query: {
        name: "All subtypes of an entity, active only",
        from: [] as any[],
        select: [
          {
            property: {
              "@id": "http://endhealth.info/im#code"
            }
          },
          {
            property: {
              "@id": "http://www.w3.org/2000/01/rdf-schema#label"
            }
          }
        ],
        activeOnly: true
      }
    } as QueryRequest;
    let suggestions = [] as any[];
    try {
      const allowableRanges = await this.queryIM(allowableRangesQuery);
      if (allowableRanges.entities) {
        for (const entity of allowableRanges.entities) {
          const from = {
            includeSubtypes: true,
            "@id": entity["@id"]
          };
          subtypesQuery.query.from.push(from as TTAlias);
        }
        if (searchTerm) {
          subtypesQuery.textSearch = searchTerm;
        }
        suggestions = (await this.queryIM(subtypesQuery)).entities;
        suggestions = this.convertTTEntitiesToTTIriRefs(suggestions);
      }
      return suggestions;
    } catch (error) {
      return suggestions;
    }
  }

  public async getAllowablePropertySuggestions(iri: string, searchTerm?: string) {
    const queryRequest = {
      query: {
        "@id": "http://endhealth.info/im#Query_AllowableProperties"
      },
      argument: {
        this: iri
      }
    } as QueryRequest;

    if (searchTerm) {
      queryRequest.textSearch = searchTerm;
    }

    let suggestions = [] as any[];
    try {
      suggestions = (await this.queryIM(queryRequest)).entities;
      return this.convertTTEntitiesToTTIriRefs(suggestions);
    } catch (error) {
      return suggestions;
    }
  }

  convertTTEntitiesToTTIriRefs(ttEntities: any[]) {
    return ttEntities.map(ttEntity => this.convertTTEntityToTTIriRef(ttEntity));
  }

  private convertTTEntityToTTIriRef(ttEntity: any) {
    return { "@id": ttEntity["@id"], name: ttEntity[RDFS.LABEL] };
  }
}
