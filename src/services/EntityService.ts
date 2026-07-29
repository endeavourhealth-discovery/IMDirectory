import { IM, RDFS } from "@endeavour/vue-library/enums";
import { isObjectHasKeys, parseArray } from "@endeavour/vue-library/helpers";
import {
  DownloadByQueryOptions,
  EditRequest,
  EntityValidationRequest,
  ExtendedEntityReferenceNode,
  ExtendedEntityReferenceNodeSchema,
  FilterOptions,
  FilterOptionsSchema,
  FiltersAsIris,
  Namespace,
  NamespaceSchema,
  PageableEntityReferenceNode,
  PageableEntityReferenceNodeSchema,
  PageableTTIriRef,
  PageableTTIriRefSchema,
  SearchResultSummary,
  SearchResultSummarySchema,
  TTBundle,
  TTBundleSchema,
  TTEntity,
  TTEntitySchema,
  TTIriRef,
  TTIriRefSchema,
  ValidatedEntity,
  ValidatedEntitySchema
} from "@endeavour/vue-library/models";

import { OrganizationChartNode } from "primevue/organizationchart";
import type { TreeNode } from "primevue/treenode";

import { buildDetails } from "@/helpers/DetailsBuilder";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/entity";

const EntityService = {
  // ============================ PUBLIC ============================
  async getSchemes(): Promise<Namespace[]> {
    const result = await api.get(API_URL + "/public/schemes");
    return parseArray(result, NamespaceSchema);
  },

  async getNamespaces(): Promise<Namespace[]> {
    const result = await api.get(API_URL + "/public/namespaces");
    return parseArray(result, NamespaceSchema);
  },

  async getFilterOptions(): Promise<FilterOptions> {
    const result = await api.get(API_URL + "/public/filterOptions");
    return FilterOptionsSchema.parse(result);
  },

  async getFilterDefaultOptions(): Promise<FilterOptions> {
    const result = await api.get(API_URL + "/public/filterDefaults");
    return FilterOptionsSchema.parse(result);
  },

  // ============================ PROTECTED ============================

  async getPartialEntity(iri: string, predicates: string[]): Promise<TTEntity> {
    const result = await api.get(API_URL + "/protected/partial", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
    return TTEntitySchema.parse(result);
  },

  async getPartialEntities(typeIris: string[], predicates: string[]): Promise<TTEntity[]> {
    const result = await api.post(API_URL + "/protected/partials", { iris: [...new Set(typeIris)].join(","), predicates: [...new Set(predicates)].join(",") });
    return parseArray(result, TTEntitySchema);
  },

  async getFullEntity(iri: string, includeInactiveTermCodes: boolean = false): Promise<TTEntity> {
    const result = await api.get(API_URL + "/protected/fullEntity", {
      params: {
        iri: iri,
        includeInactiveTermCodes: includeInactiveTermCodes
      }
    });
    return TTEntitySchema.parse(result);
  },

  async getEntityTypes(iri: string): Promise<string[]> {
    return await api.get(API_URL + "/protected/entityTypes", {
      params: {
        iri: iri
      }
    });
  },

  async getPartialEntityBundle(iri: string, predicates: string[]): Promise<TTBundle> {
    const result = await api.get(API_URL + "/protected/partialBundle", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
    return TTBundleSchema.parse(result);
  },

  async getEntityChildren(iri: string, filters?: FiltersAsIris, controller?: AbortController): Promise<ExtendedEntityReferenceNode[]> {
    const result = await api.get(API_URL + "/protected/children", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
    return parseArray(result, ExtendedEntityReferenceNodeSchema);
  },

  async getEntityAsEntityReferenceNode(iri: string): Promise<ExtendedEntityReferenceNode> {
    const result = await api.get(API_URL + "/protected/asEntityReferenceNode", { params: { iri: iri } });
    return ExtendedEntityReferenceNodeSchema.parse(result);
  },

  async getAsEntityReferenceNodes(iris: string[]): Promise<ExtendedEntityReferenceNode[]> {
    const result = await api.get(API_URL + "/protected/asEntityReferenceNodes", { params: { iris: iris.join(",") } });
    return parseArray(result, ExtendedEntityReferenceNodeSchema);
  },

  async getPagedChildren(
    iri: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController,
    typeFilter?: string[]
  ): Promise<PageableEntityReferenceNode> {
    const result = await api.get(API_URL + "/protected/childrenPaged", {
      params: { iri: iri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(","), typeFilter: typeFilter?.join(",") },
      signal: controller?.signal
    });
    return PageableEntityReferenceNodeSchema.parse(result);
  },

  async getPartialAndTotalCount(
    iri: string,
    predicate: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<PageableTTIriRef> {
    const result = await api.get(API_URL + "/protected/partialAndTotalCount", {
      params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
    return PageableTTIriRefSchema.parse(result);
  },

  async downloadEntity(iri: string): Promise<Blob> {
    return await api.get(API_URL + "/protected/downloadEntity", { params: { iri: iri }, responseType: "blob", raw: true });
  },

  async getEntityParents(iri: string, filters?: FiltersAsIris): Promise<ExtendedEntityReferenceNode[]> {
    const result = await api.get(API_URL + "/protected/parents", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") }
    });
    return parseArray(result, ExtendedEntityReferenceNodeSchema);
  },

  async getEntityUsages(iri: string, pageIndex: number, pageSize: number): Promise<TTEntity[]> {
    const result = await api.get(API_URL + "/protected/usages", {
      params: {
        iri: iri,
        page: pageIndex,
        size: pageSize
      }
    });
    return parseArray(result, TTEntitySchema);
  },

  async getUsagesTotalRecords(iri: string): Promise<number> {
    return await api.get(API_URL + "/protected/usagesTotalRecords", {
      params: {
        iri: iri
      }
    });
  },

  async entityExists(iri: string): Promise<boolean> {
    return await api.get(API_URL + "/protected/entityExists", { params: { iri: iri } });
  },

  async iriExists(iri: string): Promise<boolean> {
    return await api.get(API_URL + "/protected/iriExists", { params: { iri: iri } });
  },

  async getEntitySummary(iri: string): Promise<SearchResultSummary> {
    const result = await api.get(API_URL + "/protected/summary", {
      params: { iri: iri }
    });
    return SearchResultSummarySchema.parse(result);
  },

  async downloadSearchResults(downloadSettings: DownloadByQueryOptions): Promise<Blob> {
    return api.post(API_URL + "/protected/downloadSearchResults", downloadSettings, { responseType: "blob", raw: true });
  },

  async getFolderPath(iri: string): Promise<TTIriRef[]> {
    const result = await api.get(API_URL + "/protected/folderPath", {
      params: { iri: iri }
    });
    return parseArray(result, TTIriRefSchema);
  },

  async getPathBetweenNodes(descendant: string, ancestor: string): Promise<TTIriRef[]> {
    const result = await api.get(API_URL + "/protected/shortestParentHierarchy", {
      params: { descendant: descendant, ancestor: ancestor }
    });
    return parseArray(result, TTIriRefSchema);
  },

  async getEntityByPredicateExclusions(iri: string, predicates: string[]): Promise<TTEntity> {
    const result = await api.get(API_URL + "/protected/entityByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(",") }
    });
    return TTEntitySchema.parse(result);
  },

  async getBundleByPredicateExclusions(iri: string, predicates: string[], graph?: string): Promise<TTBundle> {
    const result = await api.get(API_URL + "/protected/bundleByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(","), graph: graph }
    });
    return TTBundleSchema.parse(result);
  },

  async getValidatedEntitiesBySnomedCodes(codes: string[]): Promise<ValidatedEntity[]> {
    const result = await api.post(API_URL + "/protected/validatedEntity", codes);
    return parseArray(result, ValidatedEntitySchema);
  },

  async getEntityDetailsDisplay(iri: string): Promise<TreeNode[]> {
    const response = await api.get(API_URL + "/protected/detailsDisplay", { params: { iri: iri } });
    return buildDetails(TTBundleSchema.parse(response));
  },

  async loadMoreDetailsDisplay(iri: string, predicate: string, pageIndex: number, pageSize: number): Promise<TreeNode[]> {
    const response = await api.get(API_URL + "/protected/detailsDisplay/loadMore", {
      params: { iri: iri, predicate: predicate, pageIndex: pageIndex, pageSize: pageSize }
    });
    return buildDetails(TTBundleSchema.parse(response));
  },

  async checkValidation(validationIri: string, data: EntityValidationRequest): Promise<{ valid: boolean; message: string | undefined }> {
    return await api.post(API_URL + "/protected/validate", { validationIri: validationIri, entity: data });
  },

  async getEntityGraph(iri: string): Promise<OrganizationChartNode> {
    return await api.get(API_URL + "/protected/graph", { params: { iri: iri } });
  },

  async getProvHistory(iri: string): Promise<TTEntity[]> {
    const result = await api.get(API_URL + "/protected/history", {
      params: { iri: iri }
    });
    return parseArray(result, TTEntitySchema);
  },

  async getAllowableChildTypes(iri: string): Promise<TTEntity[]> {
    const result = await api.get(API_URL + "/protected/allowableChildTypes", { params: { iri: iri } });
    return parseArray(result, TTEntitySchema);
  },

  async getChildEntities(iri: string): Promise<string[]> {
    return await api.get(API_URL + "/protected/childIris", {
      params: { iri: iri }
    });
  },

  // ========================== PRIVATE ==========================

  async createEntity(editRequest: EditRequest): Promise<TTEntity> {
    const result = await api.post(API_URL + "/private/create", editRequest);
    return TTEntitySchema.parse(result);
  },

  async updateEntity(editRequest: EditRequest): Promise<TTEntity> {
    const result = await api.post(API_URL + "/private/update", editRequest);
    return TTEntitySchema.parse(result);
  },
  // ========================== HELPERS ==========================

  async getCoreSchemes(): Promise<string[]> {
    const coreSchemesChildren = (await this.getEntityChildren(IM.ECL_BUILDER_SCHEMES)) ?? [];
    return coreSchemesChildren.map(child => child.iri);
  },

  async getName(iri: string): Promise<string | undefined> {
    const result = await EntityService.getPartialEntity(iri, [RDFS.LABEL]);
    if (isObjectHasKeys(result, [RDFS.LABEL]) && typeof result[RDFS.LABEL] === "string") return result[RDFS.LABEL];
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(EntityService);

export default EntityService;
