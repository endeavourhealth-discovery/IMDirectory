import Env from "@/services/env.service";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { AliasEntity } from "@im-library/interfaces";
import { From, QueryRequest, TTAlias } from "@im-library/models/AutoGen";

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
        name: "All subtypes of an entity, active only",
        from: {
          bool: "or",
          from: [] as any[]
        },
        select: [
          {
            "@id": "http://endhealth.info/im#code"
          },
          {
            "@id": "http://www.w3.org/2000/01/rdf-schema#label"
          }
        ],
        limit: 100,
        activeOnly: true
      }
    } as QueryRequest;
    let suggestions = [] as AliasEntity[];
    try {
      const allowableRanges = await this.queryIM(allowableRangesQuery);
      if (allowableRanges.entities) {
        for (const entity of allowableRanges.entities) {
          const from = {
            includeSubtypes: true,
            "@id": entity["@id"]
          } as From;
          subtypesQuery.query.from.from.push(from);
        }
        // TODO add searchTerm
        // if (searchTerm) {
        //   subtypesQuery.textSearch = searchTerm;
        // }
        JSON.stringify(subtypesQuery);
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
    } as any as QueryRequest;

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
