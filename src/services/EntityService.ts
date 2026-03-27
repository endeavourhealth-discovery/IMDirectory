import { IM, RDFS } from "vue-library/enums";
import { FiltersAsIris, Namespace, FilterOptions, ValidatedEntity } from "@/interfaces";
import {
  ExtendedEntityReferenceNode,
  ExtendedTTEntity,
  TTBundle,
  TTIriRef,
  SearchResultSummary,
  DownloadByQueryOptions,
  Pageable,
  EntityValidationRequest,
  EditRequest
} from "vue-library/interfaces";
import Env from "./Env";
import axios from "axios";
import type { TreeNode } from "primevue/treenode";
import { isObjectHasKeys } from "vue-library/helpers";
import { buildDetails } from "@/helpers/DetailsBuilder";
import { OrganizationChartNode } from "primevue/organizationchart";

const API_URL = Env.API + "api/entity";

const EntityService = {
  // ============================ PUBLIC ============================
  async getSchemes(): Promise<{ [x: string]: Namespace }> {
    return await axios.get(API_URL + "/public/schemes");
  },

  async getNamespaces(): Promise<Namespace[]> {
    return await axios.get(API_URL + "/public/namespaces");
  },

  async getFilterOptions(): Promise<FilterOptions> {
    return await axios.get(API_URL + "/public/filterOptions");
  },

  async getFilterDefaultOptions(): Promise<FilterOptions> {
    return await axios.get(API_URL + "/public/filterDefaults");
  },

  // ============================ PROTECTED ============================

  async getPartialEntity(iri: string, predicates: string[]): Promise<ExtendedTTEntity> {
    return await axios.get(API_URL + "/protected/partial", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  },

  async getPartialEntities(typeIris: string[], predicates: string[]): Promise<ExtendedTTEntity[]> {
    return await axios.post(API_URL + "/protected/partials", { iris: [...new Set(typeIris)].join(","), predicates: [...new Set(predicates)].join(",") });
  },

  async getFullEntity(iri: string, includeInactiveTermCodes: boolean = false): Promise<ExtendedTTEntity> {
    return await axios.get(API_URL + "/protected/fullEntity", {
      params: {
        iri: iri,
        includeInactiveTermCodes: includeInactiveTermCodes
      }
    });
  },

  async getEntityTypes(iri: string): Promise<string[]> {
    return await axios.get(API_URL + "/protected/entityTypes", {
      params: {
        iri: iri
      }
    });
  },

  async getPartialEntityBundle(iri: string, predicates: string[]): Promise<TTBundle> {
    return await axios.get(API_URL + "/protected/partialBundle", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  },

  async getEntityChildren(iri: string, filters?: FiltersAsIris, controller?: AbortController): Promise<ExtendedEntityReferenceNode[]> {
    return await axios.get(API_URL + "/protected/children", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getEntityAsEntityReferenceNode(iri: string): Promise<ExtendedEntityReferenceNode> {
    return await axios.get(API_URL + "/protected/asEntityReferenceNode", { params: { iri: iri } });
  },

  async getAsEntityReferenceNodes(iris: string[]): Promise<ExtendedEntityReferenceNode[]> {
    return await axios.get(API_URL + "/protected/asEntityReferenceNodes", { params: { iris: iris.join(",") } });
  },

  async getPagedChildren(
    iri: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController,
    typeFilter?: string[]
  ): Promise<{ totalCount: number; currentPage: number; pageSize: number; result: ExtendedTTEntity[] }> {
    return await axios.get(API_URL + "/protected/childrenPaged", {
      params: { iri: iri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(","), typeFilter: typeFilter?.join(",") },
      signal: controller?.signal
    });
  },

  async getPartialAndTotalCount(
    iri: string,
    predicate: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<Pageable<TTIriRef>> {
    return await axios.get(API_URL + "/protected/partialAndTotalCount", {
      params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async downloadEntity(iri: string) {
    return await axios.get(API_URL + "/protected/downloadEntity", { params: { iri: iri }, responseType: "blob", raw: true });
  },

  async getEntityParents(iri: string, filters?: FiltersAsIris): Promise<ExtendedEntityReferenceNode[]> {
    return await axios.get(API_URL + "/protected/parents", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") }
    });
  },

  async getEntityUsages(iri: string, pageIndex: number, pageSize: number): Promise<ExtendedTTEntity[]> {
    return await axios.get(API_URL + "/protected/usages", {
      params: {
        iri: iri,
        page: pageIndex,
        size: pageSize
      }
    });
  },

  async getUsagesTotalRecords(iri: string): Promise<number> {
    return await axios.get(API_URL + "/protected/usagesTotalRecords", {
      params: {
        iri: iri
      }
    });
  },

  async entityExists(iri: string): Promise<boolean> {
    return await axios.get(API_URL + "/protected/entityExists", { params: { iri: iri } });
  },

  async iriExists(iri: string): Promise<boolean> {
    return await axios.get(API_URL + "/protected/iriExists", { params: { iri: iri } });
  },

  async getEntitySummary(iri: string): Promise<SearchResultSummary> {
    return await axios.get(API_URL + "/protected/summary", {
      params: { iri: iri }
    });
  },

  async downloadSearchResults(downloadSettings: DownloadByQueryOptions) {
    return await axios.post(API_URL + "/protected/downloadSearchResults", downloadSettings, { responseType: "blob", raw: true });
  },

  async getFolderPath(iri: string): Promise<TTIriRef[]> {
    return await axios.get(API_URL + "/protected/folderPath", {
      params: { iri: iri }
    });
  },

  async getPathBetweenNodes(descendant: string, ancestor: string): Promise<TTIriRef[]> {
    return await axios.get(API_URL + "/protected/shortestParentHierarchy", {
      params: { descendant: descendant, ancestor: ancestor }
    });
  },

  async getEntityByPredicateExclusions(iri: string, predicates: string[]): Promise<ExtendedTTEntity> {
    return await axios.get(API_URL + "/protected/entityByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(",") }
    });
  },

  async getBundleByPredicateExclusions(iri: string, predicates: string[], graph?: string): Promise<TTBundle> {
    return await axios.get(API_URL + "/protected/bundleByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(","), graph: graph }
    });
  },

  async getValidatedEntitiesBySnomedCodes(codes: string[]): Promise<ValidatedEntity[]> {
    return await axios.post(API_URL + "/protected/validatedEntity", codes);
  },

  async getEntityDetailsDisplay(iri: string): Promise<TreeNode[]> {
    const response: TTBundle = await axios.get(API_URL + "/protected/detailsDisplay", { params: { iri: iri } });
    return buildDetails(response);
  },

  async loadMoreDetailsDisplay(iri: string, predicate: string, pageIndex: number, pageSize: number): Promise<TreeNode[]> {
    const response: TTBundle = await axios.get(API_URL + "/protected/detailsDisplay/loadMore", {
      params: { iri: iri, predicate: predicate, pageIndex: pageIndex, pageSize: pageSize }
    });
    return buildDetails(response);
  },

  async checkValidation(validationIri: string, data: EntityValidationRequest): Promise<{ valid: boolean; message: string | undefined }> {
    return await axios.post(API_URL + "/protected/validate", { validationIri: validationIri, entity: data });
  },

  async getEntityGraph(iri: string): Promise<OrganizationChartNode> {
    return await axios.get(API_URL + "/protected/graph", { params: { iri: iri } });
  },

  async getProvHistory(iri: string): Promise<ExtendedTTEntity[]> {
    return await axios.get(API_URL + "/protected/history", {
      params: { iri: iri }
    });
  },

  async getAllowableChildTypes(iri: string): Promise<ExtendedTTEntity[]> {
    return await axios.get(API_URL + "/protected/allowableChildTypes", { params: { iri: iri } });
  },

  async getChildEntities(iri: string): Promise<string[]> {
    return await axios.get(API_URL + "/protected/childIris", {
      params: { iri: iri }
    });
  },

  // ========================== PRIVATE ==========================

  async createEntity(editRequest: EditRequest): Promise<ExtendedTTEntity> {
    return await axios.post(API_URL + "/private/create", editRequest);
  },

  async updateEntity(editRequest: EditRequest): Promise<ExtendedTTEntity> {
    return await axios.post(API_URL + "/private/update", editRequest);
  },
  // ========================== HELPERS ==========================

  async getCoreSchemes(): Promise<string[]> {
    const coreSchemesChildren = (await this.getEntityChildren(IM.ECL_BUILDER_SCHEMES)) ?? [];
    return coreSchemesChildren.map(child => child.iri);
  },

  async getName(iri: string): Promise<string | undefined> {
    const result = await EntityService.getPartialEntity(iri, [RDFS.LABEL]);
    if (isObjectHasKeys(result, [RDFS.LABEL])) return result[RDFS.LABEL];
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(EntityService);

export default EntityService;
