import { IM, RDFS } from "@endeavour/vue-library/enums";
import { isObjectHasKeys, parseApiResponse, parseArray } from "@endeavour/vue-library/helpers";
import {
  ExtendedEntityReferenceNode,
  ExtendedEntityReferenceNodeSchema,
  FiltersAsIris,
  PageableEntityReferenceNode,
  PageableEntityReferenceNodeSchema,
  PageableTTIriRef,
  PageableTTIriRefSchema,
  SearchResultSummary,
  SearchResultSummarySchema,
  TTEntity,
  TTEntitySchema,
  TTIriRef,
  TTIriRefSchema
} from "@endeavour/vue-library/models";

import { OrganizationChartNode } from "primevue/organizationchart";
import type { TreeNode } from "primevue/treenode";
import z from "zod";

import { buildDetails } from "@/helpers/DetailsBuilder";
import {
  DownloadByQueryOptions,
  EditRequest,
  EntityValidationRequest,
  FilterOptions,
  FilterOptionsSchema,
  Namespace,
  NamespaceSchema,
  TTBundle,
  TTBundleSchema,
  ValidatedEntity,
  ValidatedEntitySchema
} from "@/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/entity";

const EntityService = {
  // ============================ PUBLIC ============================
  async getSchemes(): Promise<Namespace[]> {
    const result = await api.get(API_URL + "/public/schemes");
    return parseApiResponse(result, z.array(NamespaceSchema));
  },

  async getNamespaces(): Promise<Namespace[]> {
    const result = await api.get(API_URL + "/public/namespaces");
    return parseApiResponse(result, z.array(NamespaceSchema));
  },

  async getFilterOptions(): Promise<FilterOptions> {
    const result = await api.get(API_URL + "/public/filterOptions");
    return parseApiResponse(result, FilterOptionsSchema);
  },

  async getFilterDefaultOptions(): Promise<FilterOptions> {
    const result = await api.get(API_URL + "/public/filterDefaults");
    return parseApiResponse(result, FilterOptionsSchema);
  },

  // ============================ PROTECTED ============================

  async getPartialEntity(iri: string, predicates: string[]): Promise<TTEntity> {
    const result = await api.get(API_URL + "/protected/partial", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
    return parseApiResponse(result, TTEntitySchema);
  },

  async getPartialEntities(typeIris: string[], predicates: string[]): Promise<TTEntity[]> {
    const result = await api.post(API_URL + "/protected/partials", { iris: [...new Set(typeIris)].join(","), predicates: [...new Set(predicates)].join(",") });
    return parseApiResponse(result, z.array(TTEntitySchema));
  },

  async getFullEntity(iri: string, includeInactiveTermCodes: boolean = false): Promise<TTEntity> {
    const result = await api.get(API_URL + "/protected/fullEntity", {
      params: {
        iri: iri,
        includeInactiveTermCodes: includeInactiveTermCodes
      }
    });
    return parseApiResponse(result, TTEntitySchema);
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
    return parseApiResponse(result, TTBundleSchema);
  },

  async getEntityChildren(iri: string, filters?: FiltersAsIris, controller?: AbortController): Promise<ExtendedEntityReferenceNode[]> {
    const result = await api.get(API_URL + "/protected/children", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
    return parseApiResponse(result, z.array(ExtendedEntityReferenceNodeSchema));
  },

  async getEntityAsEntityReferenceNode(iri: string): Promise<ExtendedEntityReferenceNode> {
    const result = await api.get(API_URL + "/protected/asEntityReferenceNode", { params: { iri: iri } });
    return parseApiResponse(result, ExtendedEntityReferenceNodeSchema);
  },

  async getAsEntityReferenceNodes(iris: string[]): Promise<ExtendedEntityReferenceNode[]> {
    const result = await api.get(API_URL + "/protected/asEntityReferenceNodes", { params: { iris: iris.join(",") } });
    return parseApiResponse(result, z.array(ExtendedEntityReferenceNodeSchema));
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
    return parseApiResponse(result, PageableEntityReferenceNodeSchema);
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
    return parseApiResponse(result, PageableTTIriRefSchema);
  },

  async downloadEntity(iri: string): Promise<Blob> {
    return await api.get(API_URL + "/protected/downloadEntity", { params: { iri: iri }, responseType: "blob", raw: true });
  },

  async getEntityParents(iri: string, filters?: FiltersAsIris): Promise<ExtendedEntityReferenceNode[]> {
    const result = await api.get(API_URL + "/protected/parents", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") }
    });
    return parseApiResponse(result, z.array(ExtendedEntityReferenceNodeSchema));
  },

  async getEntityUsages(iri: string, pageIndex: number, pageSize: number): Promise<TTEntity[]> {
    const result = await api.get(API_URL + "/protected/usages", {
      params: {
        iri: iri,
        page: pageIndex,
        size: pageSize
      }
    });
    return parseApiResponse(result, z.array(TTEntitySchema));
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
    return parseApiResponse(result, SearchResultSummarySchema);
  },

  async downloadSearchResults(downloadSettings: DownloadByQueryOptions): Promise<Blob> {
    return api.post(API_URL + "/protected/downloadSearchResults", downloadSettings, { responseType: "blob", raw: true });
  },

  async getFolderPath(iri: string): Promise<TTIriRef[]> {
    const result = await api.get(API_URL + "/protected/folderPath", {
      params: { iri: iri }
    });
    return parseApiResponse(result, z.array(TTIriRefSchema));
  },

  async getPathBetweenNodes(descendant: string, ancestor: string): Promise<TTIriRef[]> {
    const result = await api.get(API_URL + "/protected/shortestParentHierarchy", {
      params: { descendant: descendant, ancestor: ancestor }
    });
    return parseApiResponse(result, z.array(TTIriRefSchema));
  },

  async getEntityByPredicateExclusions(iri: string, predicates: string[]): Promise<TTEntity> {
    const result = await api.get(API_URL + "/protected/entityByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(",") }
    });
    return parseApiResponse(result, TTEntitySchema);
  },

  async getBundleByPredicateExclusions(iri: string, predicates: string[], graph?: string): Promise<TTBundle> {
    const result = await api.get(API_URL + "/protected/bundleByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(","), graph: graph }
    });
    return parseApiResponse(result, TTBundleSchema);
  },

  async getValidatedEntitiesBySnomedCodes(codes: string[]): Promise<ValidatedEntity[]> {
    const result = await api.post(API_URL + "/protected/validatedEntity", codes);
    return parseApiResponse(result, z.array(ValidatedEntitySchema));
  },

  async getEntityDetailsDisplay(iri: string): Promise<TreeNode[]> {
    const response = await api.get(API_URL + "/protected/detailsDisplay", { params: { iri: iri } });
    return buildDetails(parseApiResponse(response, TTBundleSchema));
  },

  async loadMoreDetailsDisplay(iri: string, predicate: string, pageIndex: number, pageSize: number): Promise<TreeNode[]> {
    const response = await api.get(API_URL + "/protected/detailsDisplay/loadMore", {
      params: { iri: iri, predicate: predicate, pageIndex: pageIndex, pageSize: pageSize }
    });
    return buildDetails(parseApiResponse(response, TTBundleSchema));
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
    return parseApiResponse(result, z.array(TTEntitySchema));
  },

  async getAllowableChildTypes(iri: string): Promise<TTEntity[]> {
    const result = await api.get(API_URL + "/protected/allowableChildTypes", { params: { iri: iri } });
    return parseApiResponse(result, z.array(TTEntitySchema));
  },

  async getChildEntities(iri: string): Promise<string[]> {
    return await api.get(API_URL + "/protected/childIris", {
      params: { iri: iri }
    });
  },

  // ========================== PRIVATE ==========================

  async createEntity(editRequest: EditRequest): Promise<TTEntity> {
    const result = await api.post(API_URL + "/private/create", editRequest);
    return parseApiResponse(result, TTEntitySchema);
  },

  async updateEntity(editRequest: EditRequest): Promise<TTEntity> {
    const result = await api.post(API_URL + "/private/update", editRequest);
    return parseApiResponse(result, TTEntitySchema);
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
