import { EntityTypes } from "../../../../im_library/src/config";
import {
  EntityReferenceNode,
  FiltersAsIris,
  TTBundle,
  TTIriRef,
  GraphData,
  TermCode,
  Namespace,
  DataModelProperty,
  ExportValueSet,
  SearchRequest,
  ConceptSummary
} from "../../../../im_library/src/interfaces";
import { IM, RDFS } from "../../../../im_library/src/vocabulary";
import Env from "./Env";
import axios from "axios";
const api = Env.API;

const EntityService = {
  async downloadConcept(iri: string, format: string): Promise<any> {
    try {
      return await axios.get(api + "api/entity/public/exportConcept", {
        params: {
          iri: iri,
          format: format
        },
        responseType: "blob"
      });
    } catch (error) {
      return {} as any;
    }
  },

  async getFullExportSet(iri: string, core: boolean, legacy: boolean, flat: boolean): Promise<any> {
    const client = axios.create({
      baseURL: api,
      timeout: 0
    });

    return client.get("api/entity/public/setExport", {
      params: {
        iri: iri,
        core: core,
        legacy: legacy,
        flat: flat
      },
      responseType: "blob"
    });
  },

  async getMatchedFrom(iri: string): Promise<any[]> {
    try {
      return await axios.get(api + "api/entity/public/matchedFrom", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return [] as any[];
    }
  },

  async getMatchedTo(iri: string): Promise<any[]> {
    try {
      return await axios.get(api + "api/entity/public/matchedTo", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return [] as any[];
    }
  },

  async getPartialEntity(iri: string, predicates: string[]): Promise<any> {
    try {
      return await axios.get(api + "api/entity/public/partial", {
        params: {
          iri: iri,
          predicates: predicates.join(",")
        }
      });
    } catch (error) {
      return {} as any;
    }
  },

  async getFullEntity(iri: string): Promise<any> {
    try {
      return await axios.get(api + "api/entity/fullEntity", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return {} as any;
    }
  },

  async getPartialEntityBundle(iri: string, predicates: string[]): Promise<TTBundle> {
    try {
      return await axios.get(api + "api/entity/public/partialBundle", {
        params: {
          iri: iri,
          predicates: predicates.join(",")
        }
      });
    } catch (error) {
      return {} as TTBundle;
    }
  },

  async iriExists(iri: string): Promise<boolean> {
    try {
      return await axios.get(api + "api/entity/public/iriExists", { params: { iri: iri } });
    } catch (error) {
      return false;
    }
  },

  async getDefinitionBundle(iri: string): Promise<TTBundle> {
    try {
      return await axios.get(api + "api/entity/public/inferredBundle", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return {} as TTBundle;
    }
  },

  async getInferredAsString(iri: string): Promise<string> {
    try {
      return await axios.get(api + "api/entity/public/inferredAsString", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return "";
    }
  },

  async advancedSearch(request: SearchRequest, controller: AbortController): Promise<ConceptSummary[]> {
    try {
      return await axios.post(api + "api/entity/public/search", request, {
        signal: controller.signal
      });
    } catch (error) {
      return [] as ConceptSummary[];
    }
  },

  async getFolderPath(iri: string): Promise<TTIriRef[]> {
    try {
      return await axios.get(api + "api/entity/public/folderPath", {
        params: { iri: iri }
      });
    } catch (error) {
      return [] as TTIriRef[];
    }
  },

  async getEntityParents(iri: string, filters?: FiltersAsIris): Promise<EntityReferenceNode[]> {
    try {
      return await axios.get(api + "api/entity/public/parents", {
        params: { iri: iri, schemeIris: filters?.schemes.join(",") }
      });
    } catch (error) {
      return [] as EntityReferenceNode[];
    }
  },

  async getEntityChildren(iri: string, filters?: FiltersAsIris, controller?: AbortController): Promise<EntityReferenceNode[]> {
    try {
      return await axios.get(api + "api/entity/public/children", {
        params: { iri: iri, schemeIris: filters?.schemes.join(",") },
        signal: controller?.signal
      });
    } catch (error) {
      return [] as EntityReferenceNode[];
    }
  },

  async getPagedChildren(iri: string, pageIndex: number, pageSize: number, filters?: FiltersAsIris, controller?: AbortController): Promise<any> {
    try {
      return await axios.get(api + "api/entity/public/childrenPaged", {
        params: { iri: iri, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
        signal: controller?.signal
      });
    } catch (error) {
      return { result: [], totalCount: 0 } as any;
    }
  },

  async getFilterOptions(): Promise<any> {
    try {
      const schemeOptions = await this.getNamespaces();
      const statusOptions = await this.getEntityChildren(IM.STATUS);
      const typeOptions = (await this.getPartialEntities(EntityTypes, [RDFS.LABEL])).map(typeOption => {
        return { "@id": typeOption["@id"], name: typeOption[RDFS.LABEL] };
      });

      return { status: statusOptions, schemes: schemeOptions, types: typeOptions };
    } catch (error) {
      return {} as any;
    }
  },

  async getEntityUsages(iri: string, pageIndex: number, pageSize: number): Promise<TTIriRef[]> {
    try {
      return await axios.get(api + "api/entity/public/usages", {
        params: {
          iri: iri,
          page: pageIndex,
          size: pageSize
        }
      });
    } catch (error) {
      return [] as TTIriRef[];
    }
  },

  async getUsagesTotalRecords(iri: string): Promise<number> {
    try {
      return await axios.get(api + "api/entity/public/usagesTotalRecords", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return 0;
    }
  },

  async getEntityGraph(iri: string): Promise<GraphData> {
    try {
      return await axios.get(api + "api/entity/public/graph", { params: { iri: iri } });
    } catch (error) {
      return {} as GraphData;
    }
  },

  async getEntityTermCodes(iri: string): Promise<TermCode[]> {
    try {
      return await axios.get(Env.API + "api/entity/public/termCode", {
        params: { iri: iri }
      });
    } catch (error) {
      return {} as TermCode[];
    }
  },

  async getEntitySummary(iri: string): Promise<ConceptSummary> {
    try {
      return await axios.get(api + "api/entity/public/summary", {
        params: { iri: iri }
      });
    } catch (error) {
      return {} as ConceptSummary;
    }
  },

  async getNamespaces(): Promise<Namespace[]> {
    try {
      return await axios.get(api + "api/entity/public/namespaces");
    } catch (error) {
      return [] as Namespace[];
    }
  },

  async getEcl(bundle: TTBundle): Promise<string> {
    try {
      return await axios.post(api + "api/entity/public/ecl", bundle);
    } catch (error) {
      return "";
    }
  },

  async getPartialEntities(typeIris: string[], predicates: string[]) {
    const promises: Promise<any>[] = [];
    typeIris.forEach(iri => {
      promises.push(this.getPartialEntity(iri, predicates));
    });
    try {
      return await Promise.all(promises);
    } catch (error) {
      return [];
    }
  },

  async getPathBetweenNodes(descendant: string, ancestor: string): Promise<TTIriRef[]> {
    try {
      return await axios.get(api + "api/entity/public/shortestParentHierarchy", {
        params: { descendant: descendant, ancestor: ancestor }
      });
    } catch (error) {
      return [];
    }
  },

  async getNames(iris: string[]): Promise<TTIriRef[]> {
    try {
      return await axios.post(api + "api/entity/public/getNames", iris);
    } catch (error) {
      return [];
    }
  },

  async saveMapping(mappings: Map<string, string[]>): Promise<any[]> {
    try {
      return await axios.post(api + "api/entity/mapping", mappings);
    } catch (error) {
      return [] as any[];
    }
  },

  async removeTaskAction(taskIri: string, removedActionIri: string): Promise<any> {
    try {
      return await axios.delete(api + "api/entity/task/action", {
        params: {
          taskIri: taskIri,
          removedActionIri: removedActionIri
        }
      });
    } catch (error) {
      return {} as any;
    }
  },

  async addTaskAction(entityIri: string, taskIri: string): Promise<any> {
    try {
      return await axios.post(api + "api/entity/task/action", null, { params: { entityIri: entityIri, taskIri: taskIri } });
    } catch (error) {
      return {} as any;
    }
  },

  async getTaskActions(taskIri: string): Promise<any> {
    try {
      return await axios.get(api + "api/entity/task/action", { params: { taskIri: taskIri } });
    } catch (error) {
      return {} as any;
    }
  },

  async getUnmapped(term?: string, status?: string[], scheme?: string[], type?: string[], usage?: number, limit?: number): Promise<any[]> {
    try {
      return await axios.get(api + "api/entity/public/unmapped", {
        params: {
          term: term,
          status: status?.join(","),
          scheme: scheme?.join(","),
          type: type?.join(","),
          usage: usage,
          limit: limit
        }
      });
    } catch (error) {
      return [] as any[];
    }
  },

  async getPredefinedList(listPath: string): Promise<TTIriRef[]> {
    try {
      return await axios.get(api + "api/entity/public/" + listPath);
    } catch (error) {
      return [] as any[];
    }
  },

  async getMappingSuggestions(request: SearchRequest, controller: AbortController): Promise<ConceptSummary[]> {
    try {
      return await axios.post(api + "api/entity/public/search", request, {
        signal: controller.signal
      });
    } catch (error) {
      return [] as ConceptSummary[];
    }
  },

  async getEntityAsEntityReferenceNode(iri: string): Promise<EntityReferenceNode> {
    try {
      return await axios.get(api + "api/entity/public/asEntityReferenceNode", { params: { iri: iri } });
    } catch (error) {
      return {} as EntityReferenceNode;
    }
  },

  async getPartialAndTotalCount(
    iri: string,
    predicate: string,
    pageIndex: number,
    pageSize: number,
    filters?: FiltersAsIris,
    controller?: AbortController
  ): Promise<any> {
    try {
      return await axios.get(api + "api/entity/public/partialAndTotalCount", {
        params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
        signal: controller?.signal
      });
    } catch (error) {
      return {} as any;
    }
  },

  async getHasMember(iri: string, predicate: string, pageIndex: number, pageSize: number, filters?: FiltersAsIris, controller?: AbortController): Promise<any> {
    try {
      return await axios.get(api + "api/entity/public/hasMember", {
        params: { iri: iri, predicate: predicate, page: pageIndex, size: pageSize, schemeIris: filters?.schemes.join(",") },
        signal: controller?.signal
      });
    } catch (error) {
      return {} as any;
    }
  },

  async getEntityByPredicateExclusions(iri: string, predicates: string[]): Promise<any> {
    try {
      return await axios.get(api + "api/entity/public/entityByPredicateExclusions", {
        params: { iri: iri, predicates: predicates.join(",") }
      });
    } catch (error) {
      return {} as any;
    }
  },

  async getBundleByPredicateExclusions(iri: string, predicates: string[]): Promise<TTBundle> {
    try {
      return await axios.get(api + "api/entity/public/bundleByPredicateExclusions", {
        params: { iri: iri, predicates: predicates.join(",") }
      });
    } catch (error) {
      return {} as TTBundle;
    }
  },

  async createEntity(entity: any): Promise<any> {
    try {
      return await axios.post(api + "api/entity/create", entity);
    } catch (error) {
      return {};
    }
  },

  async updateEntity(entity: any): Promise<any> {
    try {
      return await axios.post(api + "api/entity/update", entity);
    } catch (error) {
      return {};
    }
  },

  async getDataModelProperties(iri: string): Promise<DataModelProperty[]> {
    try {
      return await axios.get(Env.API + "api/entity/public/dataModelProperties", {
        params: { iri: iri }
      });
    } catch (error) {
      return [] as DataModelProperty[];
    }
  },

  async getEntityMembers(iri: string, expandMembers?: boolean, expandSubsets?: boolean, limit?: number, withHyperlinks?: boolean): Promise<ExportValueSet> {
    try {
      return await axios.get(Env.API + "api/entity/public/members", {
        params: {
          iri: iri,
          expandMembers: expandMembers,
          expandSubsets: expandSubsets,
          limit: limit,
          withHyperlinks: withHyperlinks
        }
      });
    } catch (error) {
      return {} as ExportValueSet;
    }
  },

  async getShape(iri: string): Promise<any> {
    try {
      return await axios.get(Env.API + "api/entity/public/entityAsPlainJson", { params: { iri: iri, depth: 10 } });
    } catch (error) {
      return {} as any;
    }
  },

  async getShapeFromType(iri: string): Promise<TTIriRef> {
    try {
      return await axios.get(Env.API + "api/entity/public/shapeFromType", { params: { iri: iri } });
    } catch (error) {
      return {} as TTIriRef;
    }
  },

  async getValidatedEntitiesBySnomedCodes(codes: string[]): Promise<any[]> {
    try {
      return await axios.post(Env.VITE_NODE_API + "node_api/public/search/validatedEntity", codes);
    } catch (error) {
      return [] as any[];
    }
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(EntityService);

export default EntityService;
