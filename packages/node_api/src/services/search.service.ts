import { Request, Response } from "express";
import Env from "@/services/env.service";
import EntityService from "@/services/entity.service";
import { isObjectHasKeys } from "im-library/helpers/DataTypeCheckers";
import { IM, RDFS } from "im-library/vocabulary";
import { TTIriRef } from "im-library/interfaces";

export default class SearchService {
  axios: any;
  private entityService: EntityService;

  constructor(axios: any) {
    this.axios = axios;
    this.entityService = new EntityService(axios);
  }

  async findEntitiesBySnomedCodes(codes: string[]) {
    const iris = codes.map(code => "http://snomed.info/sct#" + code);
    const result = await this.entityService.getPartialEntities(iris, [RDFS.LABEL, IM.CODE]);
    return result.map(resolved => resolved.data);
  }

  async findValidatedEntitiesBySnomedCodes(codes: string[]) {
    const entities = await this.findEntitiesBySnomedCodes(codes);
    const needed = await this.entityService.getDistillation(entities as TTIriRef[]);
    const response = [] as any[];
    for (const entity of entities) {
      const isInvalid = isObjectHasKeys(entity, ["@id"]) && !isObjectHasKeys(entity, [RDFS.LABEL, IM.CODE]);
      const index = needed.findIndex(neededEntity => neededEntity["@id"] === entity["@id"]);
      const isIncluded = response.some(added => entity["@id"] === added["@id"]);
      if (isInvalid) {
        entity.statusCode = "Invalid";
        entity[RDFS.LABEL] = "Not an entity";
      } else if (index !== -1) {
        needed.splice(index, 1);
        entity.statusCode = "Valid";
      } else {
        entity.statusCode = "Child";
      }
      if (isIncluded) {
        entity.statusCode = "Duplicate";
      }
      entity[IM.CODE] = (entity["@id"] as string).split("#")[1];
      response.push(entity);
    }

    return response;
  }

  buildCodeKeyQuery(searchRequest: any): any {
    return this.wrapBoolQuery({
      filter: this.getFilters(searchRequest),
      should: [
        {
          term: {
            code: {
              value: searchRequest.termFilter,
              boost: 2
            }
          }
        },
        {
          term: {
            key: {
              value: searchRequest.termFilter.toLowerCase(),
              boost: 1
            }
          }
        }
      ],
      minimum_should_match: 1
    });
  }

  buildSimpleTermCodeMatch(searchRequest: any): any {
    // Fix prefixes if contains ":"

    return this.wrapBoolQuery({
      filter: this.getFilters(searchRequest),
      should: [
        {
          match_phrase: {
            "termCode.term": {
              query: searchRequest.termFilter,
              boost: 1.5
            }
          }
        },
        {
          match_phrase_prefix: {
            "termCode.term": {
              query: searchRequest.termFilter,
              boost: 0.5
            }
          }
        },
        {
          term: {
            code: {
              value: searchRequest.termFilter,
              boost: 2
            }
          }
        },
        {
          term: {
            iri: {
              value: searchRequest.termFilter,
              boost: 2
            }
          }
        }
      ],
      minimum_should_match: 1
    });
  }

  buildSimpleTermMatch(searchRequest: any): any {
    return this.wrapBoolQuery({
      filter: this.getFilters(searchRequest),
      should: [
        {
          match_phrase: {
            "termCode.term": {
              query: searchRequest.termFilter,
              boost: 1.5
            }
          }
        },
        {
          match_phrase_prefix: {
            "termCode.term": {
              query: searchRequest.termFilter,
              boost: 0.5
            }
          }
        }
      ],
      minimum_should_match: 1
    });
  }

  buildMultiWordMatch(searchRequest: any): any {
    const musts: any[] = [];

    const words: string[] = searchRequest.termFilter.split(" ");

    for (let i = 0; i < words.length; i++) {
      musts.push({
        match_phrase: {
          "termCode.term": {
            query: words[i],
            boost: i == 0 ? 4 : 1
          }
        }
      });
    }

    return this.wrapBoolQuery({
      filter: this.getFilters(searchRequest),
      must: musts,
      minimum_should_match: 1
    });
  }

  private wrapBoolQuery(boolQuery: any): any {
    return {
      size: 100,
      query: {
        function_score: {
          query: {
            bool: boolQuery
          },
          functions: [
            {
              filter: {
                match_all: {
                  boost: 1
                }
              },
              field_value_factor: {
                field: "weighting",
                factor: 0.5,
                missing: 1
              }
            }
          ]
        }
      }
    };
  }

  private getFilters(searchRequest: any): any {
    const filter: any = [];
    if (searchRequest?.schemeFilter?.length > 0) filter.push(this.getFilter("scheme.@id", searchRequest.schemeFilter));

    if (searchRequest?.statusFilter?.length > 0) filter.push(this.getFilter("status.@id", searchRequest.statusFilter));

    if (searchRequest?.typeFilter?.length > 0) filter.push(this.getFilter("entityType.@id", searchRequest.typeFilter));

    return filter;
  }

  private getFilter(key: string, values: string[]) {
    const result: any = { terms: {} };
    result.terms[key] = values;
    return result;
  }

  async getEntities(qry: any) {
    const osRes: any = await this.axios.post(Env.OPENSEARCH_URL as string, qry, {
      headers: { Authorization: "Basic " + Env.OPENSEARCH_AUTH, "Content-Type": "application/json" }
    });

    return osRes.data.hits.hits
      .map((h: any) => h._source)
      .map((s: any) => ({
        iri: s.iri,
        name: s.name,
        code: s.code,
        scheme: s.scheme,
        status: s.status,
        entityType: s.entityType,
        match: s.name
      }));
  }
}
