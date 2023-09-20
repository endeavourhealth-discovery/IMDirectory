import { IM } from "@im-library/vocabulary";
import {
  EntityReferenceNode,
  FiltersAsIris,
  TTBundle,
  TermCode,
  Namespace,
  ExportValueSet,
  ConceptSummary,
  FilterOptions,
  PropertyDisplay
} from "@im-library/interfaces";
import { TTIriRef, SearchRequest } from "@im-library/interfaces/AutoGen";
import Env from "./Env";
import axios from "axios";
import { TreeNode } from "primevue/tree";
import { SortDirection } from "@im-library/enums";
import { isArrayHasLength, isObject } from "@im-library/helpers/DataTypeCheckers";
import { OrganizationChartNode } from "primevue/organizationchart";
const api = Env.API;

const EntityService = {
  async downloadConcept(iri: string, format: string): Promise<any> {
    return axios.get(api + "api/entity/public/exportConcept", {
      params: {
        iri: iri,
        format: format
      },
      responseType: "blob"
    });
  },

  async getFullExportSet(
    iri: string,
    definition: boolean,
    core: boolean,
    legacy: boolean,
    includeSubsets: boolean,
    ownRow: boolean,
    im1id: boolean,
    format: string,
    schemes: string[]
  ): Promise<any> {
    const client = axios.create({
      baseURL: api,
      timeout: 0
    });

    return client.get("api/entity/public/setExport", {
      params: {
        iri: iri,
        definition: definition,
        core: core,
        legacy: legacy,
        includeSubsets: includeSubsets,
        ownRow: ownRow,
        im1id: im1id,
        format: format,
        schemes: schemes.join(",")
      },
      responseType: "blob"
    });
  },

  async getMatchedFrom(iri: string): Promise<any[]> {
    return axios.get(api + "api/entity/public/matchedFrom", {
      params: {
        iri: iri
      }
    });
  },

  async getMatchedTo(iri: string): Promise<any[]> {
    return axios.get(api + "api/entity/public/matchedTo", {
      params: {
        iri: iri
      }
    });
  },

  async getPartialEntity(iri: string, predicates: string[]): Promise<any> {
    return axios.get(api + "api/entity/public/partial", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  },

  async getFullEntity(iri: string): Promise<any> {
    return axios.get(api + "api/entity/fullEntity", {
      params: {
        iri: iri
      }
    });
  },

  async getPartialEntityBundle(iri: string, predicates: string[]): Promise<TTBundle> {
    return axios.get(api + "api/entity/public/partialBundle", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  },

  async iriExists(iri: string): Promise<boolean> {
    return axios.get(api + "api/entity/public/iriExists", { params: { iri: iri } });
  },

  async getDefinitionBundle(iri: string): Promise<TTBundle> {
    return axios.get(api + "api/entity/public/inferredBundle", {
      params: {
        iri: iri
      }
    });
  },

  async getInferredAsString(iri: string): Promise<string> {
    return axios.get(api + "api/entity/public/inferredAsString", {
      params: {
        iri: iri
      }
    });
  },

  async advancedSearch(request: SearchRequest, controller?: AbortController): Promise<ConceptSummary[]> {
    return axios.post(api + "api/entity/public/search", request, {
      signal: controller?.signal
    });
  },

  async getFolderPath(iri: string): Promise<TTIriRef[]> {
    return axios.get(api + "api/entity/public/folderPath", {
      params: { iri: iri }
    });
  },

  async getEntityParents(iri: string, filters?: FiltersAsIris): Promise<EntityReferenceNode[]> {
    return axios.get(api + "api/entity/public/parents", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") }
    });
  },

  async getEntityChildren(iri: string, filters?: FiltersAsIris, controller?: AbortController): Promise<EntityReferenceNode[]> {
    return axios.get(api + "api/entity/public/children", {
      params: { iri: iri, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getPagedChildren(iri: string, pageIndex: number, pageSize: number, filters?: FiltersAsIris, controller?: AbortController): Promise<any> {
    return axios.get(api + "api/entity/public/childrenPaged", {
      params: { iri: iri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getFilterOptions(): Promise<FilterOptions> {
    let schemeOptions: TTIriRef[] = [];
    const schemeResults = await this.getEntityChildren(IM.NAMESPACE + "Graph");
    if (isArrayHasLength(schemeResults)) {
      schemeOptions = schemeResults.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      });
    }

    let statusOptions: TTIriRef[] = [];
    const statusResults = await this.getEntityChildren(IM.STATUS);
    if (isArrayHasLength(statusResults)) {
      statusOptions = statusResults.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      });
    }

    let typeOptions: TTIriRef[] = [];
    const typeResults = await this.getEntityChildren(IM.NAMESPACE + "TypeFilterOptions");
    if (isArrayHasLength(typeResults)) {
      typeOptions = typeResults.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      });
    }

    let sortFieldOptions: TTIriRef[] = [];
    const sortFieldResults = await this.getEntityChildren(IM.NAMESPACE + "SortFieldFilterOptions");
    if (isArrayHasLength(sortFieldResults)) {
      sortFieldOptions = sortFieldResults.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      });
    }

    let sortDirectionOptions: TTIriRef[] = [];
    const sortDirectionResults = await this.getEntityChildren(IM.NAMESPACE + "SortDirectionFilterOptions");
    if (isArrayHasLength(sortDirectionResults)) {
      sortDirectionOptions = sortDirectionResults.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      });
    }

    return {
      status: statusOptions,
      schemes: schemeOptions,
      types: typeOptions,
      sortFields: sortFieldOptions,
      sortDirections: sortDirectionOptions
    } as FilterOptions;
  },

  async getFilterDefaultOptions(): Promise<FilterOptions> {
    const schemeDefaultOptions = (await this.getEntityChildren(IM.NAMESPACE + "SchemeFilterDefaultOptions")) ?? [];
    const statusDefaultOptions = (await this.getEntityChildren(IM.NAMESPACE + "StatusFilterDefaultOptions")) ?? [];
    const typeDefaultOptions = (await this.getEntityChildren(IM.NAMESPACE + "TypeFilterDefaultOptions")) ?? [];
    const sortDefaultFieldOptions = (await this.getEntityChildren(IM.NAMESPACE + "SortFieldFilterDefaultOptions")) ?? [];
    const sortDefaultDirectionOptions = (await this.getEntityChildren(IM.NAMESPACE + "SortDirectionFilterDefaultOptions")) ?? [];

    return {
      status: statusDefaultOptions.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      }),
      schemes: schemeDefaultOptions.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      }),
      types: typeDefaultOptions.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      }),
      sortFields: sortDefaultFieldOptions.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      }),
      sortDirections: sortDefaultDirectionOptions.map(option => {
        return { "@id": option["@id"], name: option.name } as TTIriRef;
      })
    } as FilterOptions;
  },

  async getEntityUsages(iri: string, pageIndex: number, pageSize: number): Promise<TTIriRef[]> {
    return axios.get(api + "api/entity/public/usages", {
      params: {
        iri: iri,
        page: pageIndex,
        size: pageSize
      }
    });
  },

  async getUsagesTotalRecords(iri: string): Promise<number> {
    return axios.get(api + "api/entity/public/usagesTotalRecords", {
      params: {
        iri: iri
      }
    });
  },

  async getEntityGraph(iri: string): Promise<OrganizationChartNode> {
    return axios.get(api + "api/entity/public/graph", { params: { iri: iri } });
  },

  async getEntityTermCodes(iri: string, includeInactive?: boolean): Promise<TermCode[]> {
    return axios.get(Env.API + "api/entity/public/termCode", {
      params: { iri: iri, includeInactive: includeInactive }
    });
  },

  async getEntitySummary(iri: string): Promise<ConceptSummary> {
    return axios.get(api + "api/entity/public/summary", {
      params: { iri: iri }
    });
  },

  async getNamespaces(): Promise<Namespace[]> {
    return axios.get(api + "api/entity/public/namespaces");
  },

  async getPartialEntities(typeIris: string[], predicates: string[]): Promise<any[]> {
    return axios.get(api + "api/entity/public/partials", { params: { iris: typeIris.join(","), predicates: predicates.join(",") } });
  },

  async getPathBetweenNodes(descendant: string, ancestor: string): Promise<TTIriRef[]> {
    return axios.get(api + "api/entity/public/shortestParentHierarchy", {
      params: { descendant: descendant, ancestor: ancestor }
    });
  },

  async getNames(iris: string[]): Promise<TTIriRef[]> {
    return axios.post(api + "api/entity/public/getNames", iris);
  },

  async saveMapping(mappings: Map<string, string[]>): Promise<any[]> {
    return axios.post(api + "api/entity/mapping", mappings);
  },

  async removeTaskAction(taskIri: string, removedActionIri: string): Promise<any> {
    return axios.delete(api + "api/entity/task/action", {
      params: {
        taskIri: taskIri,
        removedActionIri: removedActionIri
      }
    });
  },

  async addTaskAction(entityIri: string, taskIri: string): Promise<any> {
    return axios.post(api + "api/entity/task/action", null, { params: { entityIri: entityIri, taskIri: taskIri } });
  },

  async getTaskActions(taskIri: string): Promise<any> {
    return axios.get(api + "api/entity/task/action", { params: { taskIri: taskIri } });
  },

  async getUnmapped(term?: string, status?: string[], scheme?: string[], type?: string[], usage?: number, limit?: number): Promise<any[]> {
    return axios.get(api + "api/entity/public/unmapped", {
      params: {
        term: term,
        status: status?.join(","),
        scheme: scheme?.join(","),
        type: type?.join(","),
        usage: usage,
        limit: limit
      }
    });
  },

  async getPredefinedList(listPath: string): Promise<TTIriRef[]> {
    return axios.get(api + "api/entity/public/" + listPath);
  },

  async getMappingSuggestions(request: SearchRequest, controller: AbortController): Promise<ConceptSummary[]> {
    return axios.post(api + "api/entity/public/search", request, {
      signal: controller.signal
    });
  },

  async getEntityAsEntityReferenceNode(iri: string): Promise<EntityReferenceNode> {
    return axios.get(api + "api/entity/public/asEntityReferenceNode", { params: { iri: iri } });
  },

  async getPartialAndTotalCount(
    iri: string,
    predicate: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<any> {
    return axios.get(api + "api/entity/public/partialAndTotalCount", {
      params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getHasMember(iri: string, predicate: string, pageIndex: number, pageSize: number, filters?: FiltersAsIris, controller?: AbortController): Promise<any> {
    return axios.get(api + "api/entity/public/hasMember", {
      params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getEntityByPredicateExclusions(iri: string, predicates: string[]): Promise<any> {
    return axios.get(api + "api/entity/public/entityByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(",") }
    });
  },

  async getBundleByPredicateExclusions(iri: string, predicates: string[]): Promise<TTBundle> {
    return axios.get(api + "api/entity/public/bundleByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(",") }
    });
  },

  async createEntity(entity: any): Promise<any> {
    return axios.post(api + "api/entity/create", entity);
  },

  async updateEntity(entity: any): Promise<any> {
    return axios.post(api + "api/entity/update", entity);
  },

  async getEntityMembers(iri: string, expandMembers?: boolean, expandSubsets?: boolean, limit?: number, withHyperlinks?: boolean): Promise<ExportValueSet> {
    return axios.get(Env.API + "api/entity/public/members", {
      params: {
        iri: iri,
        expandMembers: expandMembers,
        expandSubsets: expandSubsets,
        limit: limit,
        withHyperlinks: withHyperlinks
      }
    });
  },

  async getValidatedEntitiesBySnomedCodes(codes: string[]): Promise<any[]> {
    return axios.post(Env.VITE_NODE_API + "node_api/public/search/validatedEntity", codes);
  },

  async getEntityDetailsDisplay(iri: string): Promise<TreeNode[]> {
    return axios.get(Env.VITE_NODE_API + "node_api/entity/public/detailsDisplay", { params: { iri: iri } });
  },

  async loadMoreDetailsDisplay(iri: string, predicate: string, pageIndex: number, pageSize: number): Promise<TreeNode[]> {
    return axios.get(Env.VITE_NODE_API + "node_api/entity/public/detailsDisplay/loadMore", {
      params: { iri: iri, predicate: predicate, pageIndex: pageIndex, pageSize: pageSize }
    });
  },

  async getPropertiesDisplay(iri: string): Promise<PropertyDisplay[]> {
    return axios.get(Env.VITE_NODE_API + "node_api/entity/public/propertiesDisplay", {
      params: { iri: iri }
    });
  },

  async isValidProperty(entityIri: string, propertyIri: string): Promise<boolean> {
    return axios.get(Env.API + "api/entity/public/isValidProperty", { params: { entity: entityIri, property: propertyIri } });
  },

  async isValidPropertyBoolFocus(focus: any, propertyIri: string): Promise<boolean> {
    return axios.post(Env.VITE_NODE_API + "node_api/entity/public/isValidPropertyBoolFocus", { focus: focus, propertyIri: propertyIri });
  },

  async isValidPropertyValue(propertyIri: string, valueIri: string): Promise<boolean> {
    return axios.get(Env.API + "api/entity/public/isValidPropertyValue", { params: { property: propertyIri, value: valueIri } });
  },

  async getSuperiorPropertiesPaged(
    conceptIri: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<{ result: any[]; totalCount: number }> {
    return axios.get(Env.API + "api/entity/public/superiorPropertiesPaged", {
      params: { conceptIri: conceptIri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getSuperiorPropertiesBoolFocusPaged(
    focus: any,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<{ result: any[]; totalCount: number }> {
    return axios.post(
      Env.VITE_NODE_API + "node_api/entity/public/superiorPropertiesBoolFocusPaged",
      { focus: focus, pageIndex: pageIndex, pageSize: pageSize, filters: filters },
      { signal: controller?.signal }
    );
  },

  async getSuperiorPropertyValuesPaged(
    propertyIri: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<{ result: any[]; totalCount: number }> {
    return axios.get(Env.API + "api/entity/public/superiorPropertyValuesPaged", {
      params: { propertyIri: propertyIri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async simpleSearch(searchTerm: string, filterOptions: FilterOptions, abortController: AbortController): Promise<ConceptSummary[]> {
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchTerm;
    searchRequest.page = 1;
    searchRequest.size = 100;
    searchRequest.sortDirection = SortDirection.DESC;
    searchRequest.sortField = "weighting";
    searchRequest.schemeFilter = filterOptions.schemes.map(scheme => scheme["@id"]);
    searchRequest.typeFilter = filterOptions.types.map(type => type["@id"]);
    searchRequest.statusFilter = filterOptions.status.map(status => status["@id"]);
    if (!isObject(abortController)) {
      abortController.abort();
    }

    abortController = new AbortController();
    return EntityService.advancedSearch(searchRequest, abortController);
  },

  async hasPredicates(subjectIri: string, predicateIris: string[]) {
    return axios.get(api + "api/entity/public/hasPredicates", {
      params: { subjectIri: subjectIri, predicateIris: predicateIris.join(",") }
    });
  },

  async getContextMaps(conceptIri: string): Promise<any[]> {
    return axios.get(Env.VITE_NODE_API + "node_api/entity/public/conceptContextMaps", {
      params: { iri: conceptIri }
    });
  },

  async getAllByType(conceptTypeIri: string): Promise<TTIriRef[]> {
    return axios.get(Env.API + "api/query/public/allByType", {
      params: { iri: conceptTypeIri }
    });
  },

  async getAllQueries(): Promise<TTIriRef[]> {
    return axios.get(Env.API + "api/query/public/allQueries");
  },

  async getQueriesByReturnType(returnTypeIri: string): Promise<TTIriRef[]> {
    return axios.get(Env.API + "api/query/public/allQueries", {
      params: { iri: returnTypeIri }
    });
  },

  async getPropertyOptions(dataModelIri: string, dataTypeIri: string, key: string): Promise<TreeNode> {
    return axios.get(Env.VITE_NODE_API + "node_api/entity/public/propertyOptions", {
      params: { dataModelIri: dataModelIri, dataTypeIri: dataTypeIri, key: key }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(EntityService);

export default EntityService;
