import Env from "@/services/env.service";
import EclService from "./ecl.service";
import axios from "axios";
import { buildDetails } from "@/builders/entity/detailsBuilder";
import { EclSearchRequest, ITextQuery, PropertyDisplay, QueryObject, TTBundle, TTIriRef, ContextMap } from "@im-library/interfaces";
import { eclToIMQ } from "@im-library/helpers/Ecl/EclToIMQ";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { buildTextQuery } from "@im-library/helpers/TextQueryBuilder";
import EntityRepository from "@/repositories/entityRepository";

export default class EntityService {
  axios: any;
  eclService: EclService;
  entityRepository: EntityRepository;

  constructor(axios: any) {
    this.axios = axios;
    this.eclService = new EclService(axios);
    this.entityRepository = new EntityRepository();
  }

  public async getPartialEntity(iri: string, predicates: string[]): Promise<any> {
    return await this.axios.get(Env.API + "api/entity/public/partial", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  }

  public async getBundleByPredicateExclusions(iri: string, predicates: string[]): Promise<TTBundle> {
    return (
      await this.axios.get(Env.API + "api/entity/public/bundleByPredicateExclusions", {
        params: { iri: iri, predicates: predicates.join(",") }
      })
    ).data;
  }

  public async getPartialEntities(typeIris: string[], predicates: string[]): Promise<any[]> {
    const promises: Promise<any>[] = [];
    typeIris.forEach(iri => {
      promises.push(this.getPartialEntity(iri, predicates));
    });
    return await Promise.all(promises);
  }

  public async getDistillation(refs: TTIriRef[]): Promise<TTIriRef[]> {
    const response = await this.axios.post(Env.API + "api/entity/public/distillation", refs);
    return response.data;
  }

  public async getDetailsDisplay(iri: string): Promise<any[]> {
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
  }

  public async loadMoreDetailsDisplay(iri: string, predicate: string, pageIndex: string, pageSize: string) {
    const response = await this.getPartialAndTotalCount(iri, predicate, parseInt(pageIndex), parseInt(pageSize));
    const entity = {} as any;
    entity[predicate] = response.result;
    const bundle = { entity: entity, predicates: [] } as TTBundle;
    return buildDetails(bundle);
  }

  public async getPredicates(iri: string): Promise<string[]> {
    return (
      await this.axios.get(Env.API + "api/entity/public/predicates", {
        params: {
          iri: iri
        }
      })
    ).data;
  }

  async getPartialAndTotalCount(iri: string, predicate: string, pageIndex: number, pageSize: number): Promise<any> {
    return (
      await this.axios.get(Env.API + "api/entity/public/partialAndTotalCount", {
        params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize }
      })
    ).data;
  }

  async getQueryDefinitionDisplayByIri(iri: string): Promise<ITextQuery[]> {
    const entity = (await this.getPartialEntity(iri, [IM.DEFINITION])).data;
    if (!entity[IM.DEFINITION]) return [] as ITextQuery[];
    return buildTextQuery(JSON.parse(entity[IM.DEFINITION]));
  }

  async getPropertiesDisplay(iri: string): Promise<PropertyDisplay[]> {
    const entity = (await this.getPartialEntity(iri, [SHACL.PROPERTY])).data;
    const propertyList = [] as PropertyDisplay[];
    if (isObjectHasKeys(entity, [SHACL.PROPERTY]) && isArrayHasLength(entity[SHACL.PROPERTY])) {
      for (const ttproperty of entity[SHACL.PROPERTY]) {
        const cardinality = `${ttproperty[SHACL.MINCOUNT] || 0} : ${ttproperty[SHACL.MAXCOUNT] || "*"}`;
        const type = ttproperty[SHACL.CLASS] || ttproperty[SHACL.NODE] || ttproperty[SHACL.DATATYPE] || [];
        const group = ttproperty?.[SHACL.GROUP]?.[0];
        const property = {
          order: ttproperty[SHACL.ORDER],
          property: ttproperty[SHACL.PATH][0],
          type: isArrayHasLength(type) ? type[0] : "",
          cardinality: cardinality
        } as PropertyDisplay;
        if (group) property.group = group;
        propertyList.push(property);
      }
    }

    return propertyList;
  }

  async isValidPropertyBoolFocus(focus: any, propertyIri: string) {
    let query;
    if (focus.ecl) query = eclToIMQ(focus.ecl);
    const eclSearchRequest = { eclQuery: query, includeLegacy: false, limit: 1000, statusFilter: [{ "@id": IM.ACTIVE }] } as EclSearchRequest;
    const results = await this.eclService.eclSearch(eclSearchRequest);
    let found = false;
    let counter = 0;
    if (isArrayHasLength(results)) {
      while (!found && counter < results.length) {
        const conceptIri = results[counter]["@id"];
        const result = (await axios.get(Env.API + "api/entity/public/isValidProperty", { params: { entity: conceptIri, property: propertyIri } })).data;
        if (result) found = result;
        counter++;
      }
    }
    return found;
  }

  async getSuperiorPropertiesBoolFocusPaged(focus: any, pageIndex?: number, pageSize?: number, filters?: string[]) {
    let query;
    let superiors = { result: [], totalCount: 0 };
    if (focus.ecl) query = eclToIMQ(focus.ecl);
    if (query) {
      const eclSearchRequest = { eclQuery: query, includeLegacy: false, limit: 1000, statusFilter: [{ "@id": IM.ACTIVE }] } as EclSearchRequest;
      const results = await this.eclService.eclSearch(eclSearchRequest);
      if (isArrayHasLength(results)) {
        superiors = (
          await this.axios.get(Env.API + "api/entity/public/superiorPropertiesBoolFocusPaged", {
            params: {
              conceptIris: results.map((result: any) => result["@id"]).join(","),
              pageIndex: pageIndex,
              pageSize: pageSize,
              schemeFilters: filters?.join(",")
            }
          })
        ).data;
      }
    }
    return superiors;
  }

  async getConceptContextMaps(iri: string): Promise<ContextMap[]> {
    return await this.entityRepository.getConceptContextMaps(iri);
  }
}
