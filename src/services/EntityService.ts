import { IM, RDFS } from "@/vocabulary";
import { EntityReferenceNode, FiltersAsIris, Namespace, FilterOptions, ValidatedEntity } from "@/interfaces";
import { TTIriRef, SearchResultSummary, DownloadByQueryOptions, Pageable, EntityValidationRequest } from "@/interfaces/AutoGen";
import Env from "./Env";
import axios from "axios";
import type { TreeNode } from "primevue/treenode";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { buildDetails } from "@/helpers/DetailsBuilder";
import { OrganizationChartNode } from "primevue/organizationchart";
import { TTBundle, TTEntity } from "@/interfaces/ExtendedAutoGen";
const API_URL = Env.API + "api/entity";

const EntityService = {
  async getPartialEntity(iri: string, predicates: string[]): Promise<TTEntity> {
    return axios.get(API_URL + "/public/partial", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  },

  async getFullEntity(iri: string, includeInactiveTermCodes: boolean = false): Promise<TTEntity> {
    return axios.get(API_URL + "/fullEntity", {
      params: {
        iri: iri,
        includeInactiveTermCodes: includeInactiveTermCodes
      }
    });
  },

  async getPartialEntityBundle(iri: string, predicates: string[]): Promise<TTBundle> {
    return axios.get(API_URL + "/public/partialBundle", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  },

  async iriExists(iri: string): Promise<boolean> {
    return axios.get(API_URL + "/public/iriExists", { params: { iri: iri } });
  },

  async getFolderPath(iri: string): Promise<TTIriRef[]> {
    return axios.get(API_URL + "/public/folderPath", {
      params: { iri: iri }
    });
  },

  async getEntityParents(iri: string, filters?: FiltersAsIris): Promise<EntityReferenceNode[]> {
    return axios.get(API_URL + "/public/parents", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") }
    });
  },

  async getEntityChildren(iri: string, filters?: FiltersAsIris, controller?: AbortController): Promise<EntityReferenceNode[]> {
    return axios.get(API_URL + "/public/children", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getPagedChildren(
    iri: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController,
    typeFilter?: string[] | undefined
  ): Promise<{ totalCount: number; currentPage: number; pageSize: number; result: EntityReferenceNode[] }> {
    return axios.get(API_URL + "/public/childrenPaged", {
      params: { iri: iri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(","), typeFilter: typeFilter?.join(",") },
      signal: controller?.signal
    });
  },

  async getFilterOptions(): Promise<FilterOptions> {
    return axios.get(API_URL + "/public/filterOptions");
  },

  async getFilterDefaultOptions(): Promise<FilterOptions> {
    return axios.get(API_URL + "/public/filterDefaults");
  },

  async getCoreSchemes(): Promise<string[]> {
    const coreSchemesChildren = (await this.getEntityChildren(IM.CORE_SCHEMES)) ?? [];
    return coreSchemesChildren.map(child => child["@id"]);
  },

  async getEntityUsages(iri: string, pageIndex: number, pageSize: number): Promise<TTIriRef[]> {
    return axios.get(API_URL + "/public/usages", {
      params: {
        iri: iri,
        page: pageIndex,
        size: pageSize
      }
    });
  },

  async getUsagesTotalRecords(iri: string): Promise<number> {
    return axios.get(API_URL + "/public/usagesTotalRecords", {
      params: {
        iri: iri
      }
    });
  },

  async getEntitySummary(iri: string): Promise<SearchResultSummary> {
    return axios.get(API_URL + "/public/summary", {
      params: { iri: iri }
    });
  },

  async getNamespaces(): Promise<Namespace[]> {
    return axios.get(API_URL + "/public/namespaces");
  },

  async getPartialEntities(typeIris: string[], predicates: string[]): Promise<TTEntity[]> {
    return axios.post(API_URL + "/public/partials", { iris: [...new Set(typeIris)].join(","), predicates: [...new Set(predicates)].join(",") });
  },

  async getPathBetweenNodes(descendant: string, ancestor: string): Promise<TTIriRef[]> {
    return axios.get(API_URL + "/public/shortestParentHierarchy", {
      params: { descendant: descendant, ancestor: ancestor }
    });
  },

  async getNames(iris: string[]): Promise<TTIriRef[]> {
    return axios.post(API_URL + "/public/getNames", iris);
  },

  async getEntityAsEntityReferenceNode(iri: string): Promise<EntityReferenceNode> {
    return axios.get(API_URL + "/public/asEntityReferenceNode", { params: { iri: iri } });
  },

  async getPartialAndTotalCount(
    iri: string,
    predicate: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<Pageable<TTIriRef>> {
    return axios.get(API_URL + "/public/partialAndTotalCount", {
      params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getEntityByPredicateExclusions(iri: string, predicates: string[]): Promise<TTEntity> {
    return axios.get(API_URL + "/public/entityByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(",") }
    });
  },

  async getBundleByPredicateExclusions(iri: string, predicates: string[]): Promise<TTBundle> {
    return axios.get(API_URL + "/public/bundleByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(",") }
    });
  },

  async createEntity(entity: TTEntity): Promise<TTEntity> {
    return axios.post(API_URL + "/create", entity);
  },

  async updateEntity(entity: TTEntity): Promise<TTEntity> {
    return axios.post(API_URL + "/update", entity);
  },

  async getValidatedEntitiesBySnomedCodes(codes: string[]): Promise<ValidatedEntity[]> {
    return axios.post(API_URL + "/public/validatedEntity", codes);
  },

  async getEntityDetailsDisplay(iri: string): Promise<TreeNode[]> {
    const response: TTBundle = await axios.get(API_URL + "/public/detailsDisplay", { params: { iri: iri } });
    return buildDetails(response);
  },

  async loadMoreDetailsDisplay(iri: string, predicate: string, pageIndex: number, pageSize: number): Promise<TreeNode[]> {
    const response: TTBundle = await axios.get(API_URL + "/public/detailsDisplay/loadMore", {
      params: { iri: iri, predicate: predicate, pageIndex: pageIndex, pageSize: pageSize }
    });
    return buildDetails(response);
  },

  async downloadEntity(iri: string) {
    return axios.get(API_URL + "/public/downloadEntity", { params: { iri: iri }, responseType: "blob", raw: true });
  },

  async downloadSearchResults(downloadSettings: DownloadByQueryOptions) {
    return axios.post(API_URL + "/public/downloadSearchResults", downloadSettings, { responseType: "blob", raw: true });
  },

  async getName(iri: string): Promise<string | undefined> {
    const result = await EntityService.getPartialEntity(iri, [RDFS.LABEL]);
    if (isObjectHasKeys(result, [RDFS.LABEL])) return result[RDFS.LABEL];
  },

  async checkValidation(validationIri: string, data: EntityValidationRequest): Promise<{ valid: boolean; message: string | undefined }> {
    return axios.post(API_URL + "/public/validate", { validationIri: validationIri, entity: data });
  },

  async getSchemes(): Promise<{ [x: string]: Namespace }> {
    return axios.get(API_URL + "/public/schemes");
  },

  async getEntityGraph(iri: string): Promise<OrganizationChartNode> {
    return axios.get(API_URL + "/public/graph", { params: { iri: iri } });
  },

  async getProvHistory(iri: string): Promise<TTIriRef[]> {
    return axios.get(API_URL + "/public/history", {
      params: { iri: iri }
    });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(EntityService);

export default EntityService;
