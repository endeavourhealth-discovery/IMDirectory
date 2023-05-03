import Env from "@/services/env.service";
import { eclToIMQ } from "@im-library/helpers";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { AliasEntity, EclSearchRequest } from "@im-library/interfaces";
import { QueryRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, QUERY, RDFS } from "@im-library/vocabulary";
import EclService from "./ecl.service";

export default class QueryService {
  axios: any;
  eclService: EclService;

  constructor(axios: any) {
    this.axios = axios;
    this.eclService = new EclService(axios);
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
        "@id": QUERY.ALLOWABLE_RANGES
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
        "@id": QUERY.GET_ISAS
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
              "@id": QUERY.ALLOWABLE_PROPERTIES
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
          try {
            const queryResults = (await this.queryIM(queryRequest)).entities;
            this.convertTTEntitiesToAlias(queryResults);
            suggestions = suggestions.concat(queryRequest);
          } catch (error) {}
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
        "@id": QUERY.PROPERTY_RANGE
      }
    } as any as QueryRequest;

    const response = await this.queryIM(queryRequest);

    if (isObjectHasKeys(response, ["entities"]) && isObjectHasKeys(response.entities[0], [RDFS.RANGE])) {
      return response.entities[0][RDFS.RANGE];
    } else {
      queryRequest.query = { "@id": QUERY.OBJECT_PROPERTY_RANGE_SUGGESTIONS } as any;
      const suggestions = await this.queryIM(queryRequest);
      if (isObjectHasKeys(suggestions, ["entities"])) {
        suggestions.entities.push({
          "@id": "http://endhealth.info/im#Concept",
          "http://www.w3.org/2000/01/rdf-schema#label": "Terminology concept"
        });
        return suggestions.entities;
      } else {
        const request = { query: { "@id": QUERY.DATA_PROPERTY_RANGE_SUGGESTIONS } } as QueryRequest;
        const dataTypes = await this.queryIM(request);
        if (isObjectHasKeys(dataTypes, ["entities"]) && dataTypes.entities.length !== 0) {
          return dataTypes.entities;
        } else return [];
      }
    }
  }
}
