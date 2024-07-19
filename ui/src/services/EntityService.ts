import { IM } from "@im-library/vocabulary";
import {
  EntityReferenceNode,
  FiltersAsIris,
  TTBundle,
  TermCode,
  Namespace,
  ExportValueSet,
  FilterOptions,
  PropertyDisplay,
  SetDiffObject
} from "@im-library/interfaces";
import { TTIriRef, SearchRequest, SearchResponse, SearchResultSummary, DownloadOptions } from "@im-library/interfaces/AutoGen";
import Env from "./Env";
import axios from "axios";
import { TreeNode } from "primevue/treenode";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { OrganizationChartNode } from "primevue/organizationchart";
const api = Env.API;

const EntityService = {
  async getFullyExpandedSetMembers(iri: string, legacy: boolean, includeSubsets: boolean): Promise<TTIriRef[]> {
    return axios.get(api + "api/entity/public/expandedMembers", {
      params: {
        iri: iri,
        legacy: legacy,
        includeSubsets: includeSubsets
      }
    });
  },

  async getSubsets(iri: string): Promise<TTIriRef[]> {
    return axios.get(api + "api/entity/public/subsets", {
      params: {
        iri: iri
      }
    });
  },

  async getSetComparison(iriA?: string, iriB?: string): Promise<SetDiffObject> {
    return axios.get(Env.VITE_NODE_API + "node_api/entity/public/setDiff", {
      params: {
        setIriA: iriA,
        setIriB: iriB
      }
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
    schemes: string[],
    raw?: boolean
  ): Promise<any> {
    return axios.get(api + "api/entity/public/setExport", {
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
      responseType: "blob",
      raw: raw
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

  async getFullEntity(iri: string, includeInactiveTermCodes: boolean = false): Promise<any> {
    return axios.get(api + "api/entity/fullEntity", {
      params: {
        iri: iri,
        includeInactiveTermCodes: includeInactiveTermCodes
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

  async getPagedChildren(
    iri: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<{ totalCount: number; currentPage: number; pageSize: number; result: EntityReferenceNode[] }> {
    return axios.get(api + "api/entity/public/childrenPaged", {
      params: { iri: iri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getFilterOptions(): Promise<FilterOptions> {
    let schemeOptions: TTIriRef[] = [];
    const schemeResults = await this.getEntityChildren(IM.GRAPH);
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

  async getEntitySummary(iri: string): Promise<SearchResultSummary> {
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

  async getValidatedEntitiesBySnomedCodes(codes: string[]): Promise<any[]> {
    return axios.post(Env.VITE_NODE_API + "node_api/entity/public/validatedEntity", codes);
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

  async getSuperiorPropertiesPaged(
    conceptIri: string,
    pageIndex?: number,
    pageSize?: number,
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
    pageIndex?: number,
    pageSize?: number,
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
    pageIndex?: number,
    pageSize?: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<{ result: any[]; totalCount: number }> {
    return axios.get(Env.API + "api/entity/public/superiorPropertyValuesPaged", {
      params: { propertyIri: propertyIri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getContextMaps(conceptIri: string): Promise<any[]> {
    return axios.get(Env.VITE_NODE_API + "node_api/entity/public/conceptContextMaps", {
      params: { iri: conceptIri }
    });
  },

  async updateSubsetsFromSuper(entity: any) {
    return axios.post(Env.API + "api/entity/updateSubsetsFromSuper", entity);
  },

  async getDataModelsFromProperty(propIri: string): Promise<TTIriRef[]> {
    return axios.get(Env.API + "api/entity/public/dataModels", {
      params: {
        propIri: propIri
      }
    });
  },

  async downloadSearchResults(downloadSettings: DownloadOptions) {
    return axios.post(Env.API + "api/entity/public/downloadSearchResults", downloadSettings, { responseType: "blob", raw: true });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(EntityService);

export default EntityService;
