import { IM, RDFS, SHACL } from "@im-library/vocabulary";
import { EntityReferenceNode, FiltersAsIris, TTBundle, TermCode, Namespace, FilterOptions, PropertyDisplay, SetDiffObject } from "@im-library/interfaces";
import { TTIriRef, SearchResultSummary, DownloadByQueryOptions, DownloadEntityOptions } from "@im-library/interfaces/AutoGen";
import Env from "./Env";
import axios from "axios";
import { TreeNode } from "primevue/treenode";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { OrganizationChartNode } from "primevue/organizationchart";
import { buildDetails } from "@/helpers/detailsBuilder";
const API_URL = Env.API + "api/entity";

const EntityService = {
  async getPartialEntity(iri: string, predicates: string[]): Promise<any> {
    return axios.get(API_URL + "/public/partial", {
      params: {
        iri: iri,
        predicates: predicates.join(",")
      }
    });
  },

  async getFullEntity(iri: string, includeInactiveTermCodes: boolean = false): Promise<any> {
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

  async getDefinitionBundle(iri: string): Promise<TTBundle> {
    return axios.get(API_URL + "/public/inferredBundle", {
      params: {
        iri: iri
      }
    });
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
    controller?: AbortController
  ): Promise<{ totalCount: number; currentPage: number; pageSize: number; result: EntityReferenceNode[] }> {
    return axios.get(API_URL + "/public/childrenPaged", {
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

  async getEntityGraph(iri: string): Promise<OrganizationChartNode> {
    return axios.get(API_URL + "/public/graph", { params: { iri: iri } });
  },

  async getEntitySummary(iri: string): Promise<SearchResultSummary> {
    return axios.get(API_URL + "/public/summary", {
      params: { iri: iri }
    });
  },

  async getNamespaces(): Promise<Namespace[]> {
    return axios.get(API_URL + "/public/namespaces");
  },

  async getPartialEntities(typeIris: string[], predicates: string[]): Promise<any[]> {
    return axios.get(API_URL + "/public/partials", { params: { iris: typeIris.join(","), predicates: predicates.join(",") } });
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
  ): Promise<any> {
    return axios.get(API_URL + "/public/partialAndTotalCount", {
      params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
      signal: controller?.signal
    });
  },

  async getEntityByPredicateExclusions(iri: string, predicates: string[]): Promise<any> {
    return axios.get(API_URL + "/public/entityByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(",") }
    });
  },

  async getBundleByPredicateExclusions(iri: string, predicates: string[]): Promise<TTBundle> {
    return axios.get(API_URL + "/public/bundleByPredicateExclusions", {
      params: { iri: iri, predicates: predicates.join(",") }
    });
  },

  async createEntity(entity: any): Promise<any> {
    return axios.post(API_URL + "/create", entity);
  },

  async updateEntity(entity: any): Promise<any> {
    return axios.post(API_URL + "/update", entity);
  },

  async getValidatedEntitiesBySnomedCodes(codes: string[]): Promise<any[]> {
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

  async getPropertiesDisplay(iri: string): Promise<PropertyDisplay[]> {
    return axios.get(API_URL + "/public/propertiesDisplay", {
      params: { iri: iri }
    });
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

  async checkValidation(validationIri: string, data: any): Promise<{ isValid: boolean; message: string | undefined }> {
    return axios.post(API_URL + "/public/validate", { validationIri: validationIri, entity: data });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(EntityService);

export default EntityService;
