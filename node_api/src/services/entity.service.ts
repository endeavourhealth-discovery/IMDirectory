import Env from "@/services/env.service";
import { buildDetails } from "@/builders/entity/detailsBuilder";
import { buildQueryDisplayFromQuery } from "@/builders/query/displayBuilder";
import { buildQueryObjectFromQuery } from "@/builders/query/objectBuilder";
import { QueryDisplay, QueryObject, TTBundle, TTIriRef } from "@im-library/interfaces";
import { IM, RDF, RDFS } from "@im-library/vocabulary";

export default class EntityService {
  axios: any;

  constructor(axios: any) {
    this.axios = axios;
  }

  public async getPartialEntity(iri: string, predicates: string[]): Promise<any> {
    try {
      return await this.axios.get(Env.API + "api/entity/public/partial", {
        params: {
          iri: iri,
          predicates: predicates.join(",")
        }
      });
    } catch (error) {
      return {} as any;
    }
  }

  public async getBundleByPredicateExclusions(iri: string, predicates: string[]): Promise<TTBundle> {
    try {
      return (
        await this.axios.get(Env.API + "api/entity/public/bundleByPredicateExclusions", {
          params: { iri: iri, predicates: predicates.join(",") }
        })
      ).data;
    } catch (error) {
      return {} as TTBundle;
    }
  }

  public async getPartialEntities(typeIris: string[], predicates: string[]): Promise<any[]> {
    const promises: Promise<any>[] = [];
    typeIris.forEach(iri => {
      promises.push(this.getPartialEntity(iri, predicates));
    });
    try {
      return await Promise.all(promises);
    } catch (error) {
      return [];
    }
  }

  public async getDistillation(refs: TTIriRef[]): Promise<TTIriRef[]> {
    try {
      const response = await this.axios.post(Env.API + "api/entity/public/distillation", refs);
      return response.data;
    } catch (error) {
      return [] as TTIriRef[];
    }
  }

  public async getDetailsDisplay(iri: string): Promise<any[]> {
    try {
      const excludedPredicates = [IM.CODE, RDFS.LABEL, IM.HAS_STATUS, RDFS.COMMENT];
      const entityPredicates = await this.getPredicates(iri);
      let response: TTBundle = {} as TTBundle;
      let types: TTIriRef[] = [] as TTIriRef[];
      if (entityPredicates.includes(IM.HAS_MEMBER)) {
        response = await this.getBundleByPredicateExclusions(iri, excludedPredicates.concat([IM.HAS_MEMBER]));
        const partialAndCount = await this.getPartialAndTotalCount(iri, IM.HAS_MEMBER, 1, 10);
        response.entity[IM.HAS_MEMBER] = (partialAndCount.result as any[]).concat([
          { name: "Load more", "@id": IM.NAMESPACE + "loadMore", totalCount: partialAndCount.totalCount as number }
        ]);
        response.predicates[IM.HAS_MEMBER] = "has member";
      } else {
        response = await this.getBundleByPredicateExclusions(iri, excludedPredicates);
      }
      types = response.entity[RDF.TYPE];
      delete response.entity[RDF.TYPE];
      return buildDetails(response, types);
    } catch (error) {
      return [] as any[];
    }
  }

  public async loadMoreDetailsDisplay(iri: string, predicate: string, pageIndex: string, pageSize: string) {
    try {
      const response = await this.getPartialAndTotalCount(iri, predicate, parseInt(pageIndex), parseInt(pageSize));
      const entity = {} as any;
      entity[predicate] = response.result;
      const bundle = { entity: entity, predicates: [] } as TTBundle;
      return buildDetails(bundle);
    } catch (error) {
      return [] as any[];
    }
  }

  public async getPredicates(iri: string): Promise<string[]> {
    try {
      return (
        await this.axios.get(Env.API + "api/entity/public/predicates", {
          params: {
            iri: iri
          }
        })
      ).data;
    } catch (error) {
      return [] as string[];
    }
  }

  async getPartialAndTotalCount(iri: string, predicate: string, pageIndex: number, pageSize: number): Promise<any> {
    try {
      return (
        await this.axios.get(Env.API + "api/entity/public/partialAndTotalCount", {
          params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize }
        })
      ).data;
    } catch (error) {
      return {} as any;
    }
  }

  async getQueryDefinitionDisplayByIri(iri: string): Promise<QueryDisplay> {
    const entity = (await this.getPartialEntity(iri, [IM.DEFINITION])).data;
    if (!entity[IM.DEFINITION]) return {} as QueryDisplay;
    return buildQueryDisplayFromQuery(JSON.parse(entity[IM.DEFINITION]));
  }

  async getQueryObjectByIri(iri: string) {
    const entity = (await this.getPartialEntity(iri, [IM.DEFINITION])).data;
    if (!entity[IM.DEFINITION]) return {} as QueryObject;
    return buildQueryObjectFromQuery(JSON.parse(entity[IM.DEFINITION]));
  }
}
