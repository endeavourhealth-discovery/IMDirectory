import Env from "@/services/env.service";
import axios from "axios";
import { buildDetails } from "@/builders/entity/detailsBuilder";
import { PropertyDisplay, TTBundle, EntityReferenceNode, FiltersAsIris, ValidatedEntity } from "@im-library/interfaces";
import { IM, RDF, RDFS, SHACL, SNOMED } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { EclSearchRequest, TTIriRef, Concept, TTEntity } from "@im-library/interfaces/AutoGen";
import { byName } from "@im-library/helpers/Sorters";

export default class EntityService {
  axios: any;

  constructor(axios: any) {
    this.axios = axios;
  }

  public async getPartialEntity(iri: string, predicates: string[]): Promise<any> {
    return await this.axios.get(Env.API + "api/entity/public/partial", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  }

  public async getEntityChildren(iri: string, filters?: FiltersAsIris, controller?: AbortController): Promise<EntityReferenceNode[]> {
    return (
      await this.axios.get(Env.API + "api/entity/public/children", {
        params: { iri: iri, schemeIris: filters?.schemes.join(",") },
        signal: controller?.signal
      })
    ).data;
  }

  public async getBundleByPredicateExclusions(iri: string, predicates: string[]): Promise<TTBundle> {
    return (
      await this.axios.get(Env.API + "api/entity/public/bundleByPredicateExclusions", {
        params: { iri: iri, predicates: predicates.join(",") }
      })
    ).data;
  }

  public async getPartialEntities(typeIris: string[], predicates: string[]): Promise<any[]> {
    return axios.get(Env.API + +"api/entity/public/partials", { params: { iris: typeIris.join(","), predicates: predicates.join(",") } });
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
        { name: "Load more", "@id": IM.LOAD_MORE, totalCount: partialAndCount.totalCount as number }
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

  async getPropertiesDisplay(iri: string): Promise<PropertyDisplay[]> {
    const entity = (await this.getPartialEntity(iri, [SHACL.PROPERTY])).data;
    const propertyList = [] as PropertyDisplay[];
    if (isObjectHasKeys(entity, [SHACL.PROPERTY]) && isArrayHasLength(entity[SHACL.PROPERTY])) {
      for (const ttproperty of entity[SHACL.PROPERTY]) {
        const cardinality = `${ttproperty[SHACL.MINCOUNT] || 0} : ${ttproperty[SHACL.MAXCOUNT] || "*"}`;
        if (isObjectHasKeys(ttproperty, [SHACL.OR])) {
          const property = {
            order: ttproperty[SHACL.ORDER],
            property: [] as TTIriRef[],
            type: [] as TTIriRef[],
            cardinality: cardinality,
            isOr: true
          };
          for (const orProperty of ttproperty[SHACL.OR]) {
            const type = orProperty[SHACL.CLASS] || orProperty[SHACL.NODE] || orProperty[SHACL.DATATYPE] || [];
            const name = `${orProperty[SHACL.PATH]?.[0].name}  (${
              isArrayHasLength(type) ? (type[0].name ? type[0].name : type[0]["@id"].slice(type[0]["@id"].indexOf("#") + 1)) : ""
            })`;
            property.property.push({ "@id": orProperty[SHACL.PATH]?.[0]["@id"], name: name });
            property.type.push(isArrayHasLength(type) ? type[0] : {});
          }
          propertyList.push(property);
        } else {
          const type = ttproperty[SHACL.CLASS] || ttproperty[SHACL.NODE] || ttproperty[SHACL.DATATYPE] || [];
          const group = ttproperty?.[SHACL.GROUP]?.[0];
          const name = `${ttproperty[SHACL.PATH]?.[0].name}  (${isArrayHasLength(type) ? (type[0].name ? type[0].name : type[0]["@id"]) : ""})`;
          const property = {
            order: ttproperty[SHACL.ORDER],
            property: [{ "@id": ttproperty[SHACL.PATH]?.[0]["@id"], name: name }],
            type: [isArrayHasLength(type) ? type[0] : ""],
            cardinality: cardinality,
            isOr: false
          } as PropertyDisplay;
          if (group) {
            property.group = group;
          }
          propertyList.push(property);
        }
      }
    }

    return propertyList;
  }

  async getSetDiff(setIriA: string, setIriB: string) {
    let membersA: Concept[] = [];
    let membersB: Concept[] = [];
    if (setIriA) membersA = await this.getFullyExpandedSetMembers(setIriA, false, false);
    if (setIriB) membersB = await this.getFullyExpandedSetMembers(setIriB, false, false);
    const membersMap = new Map<string, Concept>();
    const diff = { membersA: [] as Concept[], sharedMembers: [] as Concept[], membersB: [] as Concept[] };

    for (const member of membersA) {
      member.name = member.name + " | " + member.code;
      membersMap.set(member["@id"]!, member);
    }

    for (const member of membersB) {
      member.name = member.name + " | " + member.code;
      if (membersMap.has(member["@id"]!)) {
        diff.sharedMembers.push(member);
        membersMap.delete(member["@id"]!);
      } else {
        diff.membersB.push(member);
      }
    }

    diff.membersA = Array.from(membersMap, ([iri, member]) => member).sort(byName);
    diff.membersB.sort(byName);
    diff.sharedMembers.sort(byName);
    return diff;
  }

  async getFullyExpandedSetMembers(iri: string, legacy: boolean, includeSubsets: boolean): Promise<Concept[]> {
    return (
      await axios.get(Env.API + "api/entity/public/expandedMembers", {
        params: {
          iri: iri,
          legacy: legacy,
          includeSubsets: includeSubsets
        }
      })
    ).data;
  }
}
