import Env from "@/services/env.service";
import axios from "axios";
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
