import Env from "@/services/env.service";
import {buildDetails} from "@/builders/entity/detailsBuilder";
import {buildQueryDisplayFromQuery} from "@/builders/query/displayBuilder";
import {buildQueryObjectFromQuery} from "@/builders/query/objectBuilder";
import {PropertyDisplay, QueryDisplay, QueryObject, TTBundle, TTIriRef} from "@im-library/interfaces";
import {IM, RDF, RDFS, SHACL} from "@im-library/vocabulary";
import {isArrayHasLength, isObjectHasKeys} from "@im-library/helpers/DataTypeCheckers";
import EntityRepository from "@/repositories/entityRepository";

export default class EntityService {
  axios: any;

  private entityRepository: EntityRepository;

  constructor(axios: any) {
    this.entityRepository = new EntityRepository();
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

  async getPropertiesDisplay(iri: string): Promise<PropertyDisplay[]> {
    const entity = (await this.getPartialEntity(iri, [SHACL.PROPERTY])).data;
    const propertyList = [] as PropertyDisplay[];
    if (isObjectHasKeys(entity, [SHACL.PROPERTY]) && isArrayHasLength(entity[SHACL.PROPERTY])) {
      for (const ttproperty of entity[SHACL.PROPERTY]) {
        const cardinality = `${ttproperty[SHACL.MINCOUNT] || 0} : ${ttproperty[SHACL.MAXCOUNT] || "*"}`;
        const type = ttproperty[SHACL.CLASS] || ttproperty[SHACL.NODE] || ttproperty[SHACL.DATATYPE];
        const group = ttproperty?.[SHACL.GROUP]?.[0];
        const property = {
          order: ttproperty[SHACL.ORDER],
          property: ttproperty[SHACL.PATH][0],
          type: type[0],
          cardinality: cardinality
        } as PropertyDisplay;
        if (group) property.group = group;
        propertyList.push(property);
      }
    }

    return propertyList;
  }

  async getPropertyType(modelIri: string, propIri: string): Promise<any> {
    const data = await this.entityRepository.getPropertyType(modelIri, propIri);
    if(data[0] && data[0].type) {
      return [{
        "@id": data[0].type?.value,
        "http://www.w3.org/2000/01/rdf-schema#label": data[0].tname.value
      }];
    }
    return [];
  }

  async getPropertyRange(propIri: string): Promise<any> {
    const isTrue = '"true"^^http://www.w3.org/2001/XMLSchema#boolean';
    const data = (await this.entityRepository.getPropertyRange(propIri))[0];
    if(data.type) {
      return [{
        "@id": data.type.value,
        "http://www.w3.org/2000/01/rdf-schema#label": data.name.value
      }];
    } else if(data.objectProperty.id === isTrue) {
      const results = [{
        "@id": "http://endhealth.info/im#Concept",
        "http://www.w3.org/2000/01/rdf-schema#label": "Terminology concept"
      }];
      const suggestions = await this.entityRepository.getRangeSuggestionsForObjectProperty(propIri)
      suggestions.map((d: any) => {
       results.push({
          "@id": d.type.value,
          "http://www.w3.org/2000/01/rdf-schema#label": d.name.value
        });
      });
      return results;
    } else if(data.dataProperty.id === isTrue) {
      const dataTypes =  await this.entityRepository.getDataTypes();
      return dataTypes.map((d: any) => {
        return {
          "@id": d.datatype.value,
          "http://www.w3.org/2000/01/rdf-schema#label": d.datatypeName ? d.datatypeName.value : d.datatype.value
        };
      });
    }
    return {};
  }
}
