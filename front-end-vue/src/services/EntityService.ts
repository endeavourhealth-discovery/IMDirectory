import { SearchRequest } from "@/models/search/SearchRequest";
import axios, { CancelToken } from "axios";
import GraphData from "@/models/GraphData";
import { EntityReferenceNode } from "@/models/EntityReferenceNode";
import { PartialBundle, SearchResponse } from "@/models/entityServiceTypes/EntityServiceTypes";
import { EntityDefinitionDto } from "@/models/EntityDefinitionDto";
import { TTBundle, TTIriRef } from "@/models/TripleTree";
import { ExportValueSet } from "@/models/members/ExportValueSet";
import { TermCode } from "@/models/terms/TermCode";
import { DataModelProperty } from "@/models/properties/DataModelProperty";
import { ConceptSummary } from "@/models/search/ConceptSummary";
import { Namespace } from "@/models/Namespace";
import { FiltersAsIris } from "@/models/FiltersAsIris";

export default class EntityService {
  static api = process.env.VUE_APP_API;

  public static async downloadConcept(iri: string, format: string): Promise<any> {
    try {
      return await axios.get(this.api + "api/entity/public/exportConcept", {
        params: {
          iri: iri,
          format: format
        },
        responseType: "blob"
      });
    } catch (error) {
      return {} as any;
    }
  }

  public static async getFullExportSet(iri: string): Promise<any> {
    const client = axios.create({
      baseURL: process.env.VUE_APP_API,
      timeout: 0
    });

    return client.get("api/entity/public/setExport", {
      params: {
        iri: iri
      },
      responseType: "blob"
    });
  }

  public static async getSimpleMaps(iri: string): Promise<any[]> {
    try {
      return await axios.get(this.api + "api/entity/public/simpleMaps", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return [] as any[];
    }
  }

  public static async getPartialEntity(iri: string, predicates: string[]): Promise<any> {
    try {
      return await axios.get(this.api + "api/entity/public/partial", {
        params: {
          iri: iri,
          predicate: predicates.join(",")
        }
      });
    } catch (error) {
      return {} as any;
    }
  }

  public static async getPartialEntityBundle(iri: string, predicates: string[]): Promise<PartialBundle> {
    try {
      return await axios.get(this.api + "api/entity/public/partialBundle", {
        params: {
          iri: iri,
          predicate: predicates.join(",")
        }
      });
    } catch (error) {
      return {} as PartialBundle;
    }
  }

  public static async getDefinitionBundle(iri: string): Promise<PartialBundle> {
    try {
      return await axios.get(this.api + "api/entity/public/inferredBundle", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return {} as PartialBundle;
    }
  }

  public static async getInferredAsString(iri: string): Promise<string> {
    try {
      return await axios.get(this.api + "api/entity/public/inferredAsString", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return "";
    }
  }

  public static async advancedSearch(request: SearchRequest, cancelToken: CancelToken): Promise<ConceptSummary[]> {
    try {
      return await axios.post(this.api + "api/entity/public/search", request, {
        cancelToken: cancelToken
      });
    } catch (error) {
      return [] as ConceptSummary[];
    }
  }

  private static getFilter(field: string, data: string[]): any {
    const types: any[] = [];
    for (const type of data) {
      const fieldValue: any = {};
      fieldValue[field] = type;
      types.push({ match_phrase: fieldValue });
    }

    return {
      bool: {
        should: types,
        minimum_should_match: 1
      }
    };
  }

  //obsolete, to be deleted on editor branch merge
  public static async getEntity(iri: string): Promise<any> {
    try {
      return await axios.get(this.api + "api/public/entity", {
        params: { iri: iri }
      });
    } catch (error) {
      return {} as any;
    }
  }

  public static async getEntityDefinitionDto(iri: string): Promise<EntityDefinitionDto> {
    try {
      return await axios.get(this.api + "api/entity/public/definition", {
        params: { iri: iri }
      });
    } catch (error) {
      return {} as EntityDefinitionDto;
    }
  }

  public static async getEntityParents(iri: string, filters?: FiltersAsIris): Promise<EntityReferenceNode[]> {
    try {
      return await axios.get(this.api + "api/entity/public/parents", {
        params: { iri: iri, schemeIris: filters?.schemes.join(",") }
      });
    } catch (error) {
      return [] as EntityReferenceNode[];
    }
  }

  public static async getEntityChildren(iri: string, filters?: FiltersAsIris, cancelToken?: CancelToken): Promise<EntityReferenceNode[]> {
    try {
      return await axios.get(this.api + "api/entity/public/children", {
        params: { iri: iri, schemeIris: filters?.schemes.join(",") },
        cancelToken: cancelToken
      });
    } catch (error) {
      return [] as EntityReferenceNode[];
    }
  }

  public static async getEntityUsages(iri: string, pageIndex: number, pageSize: number): Promise<TTIriRef[]> {
    try {
      return await axios.get(this.api + "api/entity/public/usages", {
        params: {
          iri: iri,
          page: pageIndex,
          size: pageSize
        }
      });
    } catch (error) {
      return [] as TTIriRef[];
    }
  }

  public static async getUsagesTotalRecords(iri: string): Promise<number> {
    try {
      return await axios.get(this.api + "api/entity/public/usagesTotalRecords", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return 0;
    }
  }

  public static async getEntityMembers(
    iri: string,
    expandMembers?: boolean,
    expandSubsets?: boolean,
    limit?: number,
    withHyperlinks?: boolean
  ): Promise<ExportValueSet> {
    try {
      return await axios.get(this.api + "api/entity/public/members", {
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
  }

  public static async getEntityGraph(iri: string): Promise<GraphData> {
    try {
      return await axios.get(this.api + "api/entity/public/graph", { params: { iri: iri } });
    } catch (error) {
      return {} as GraphData;
    }
  }

  public static async getEntityTermCodes(iri: string): Promise<TermCode[]> {
    try {
      return await axios.get(this.api + "api/entity/public/termCode", {
        params: { iri: iri }
      });
    } catch (error) {
      return {} as TermCode[];
    }
  }

  public static async getDataModelProperties(iri: string): Promise<DataModelProperty[]> {
    try {
      return await axios.get(this.api + "api/entity/public/dataModelProperties", {
        params: { iri: iri }
      });
    } catch (error) {
      return [] as DataModelProperty[];
    }
  }

  public static async getEntitySummary(iri: string): Promise<ConceptSummary> {
    try {
      return await axios.get(this.api + "api/entity/public/summary", {
        params: { iri: iri }
      });
    } catch (error) {
      return {} as ConceptSummary;
    }
  }

  public static async getNamespaces(): Promise<Namespace[]> {
    try {
      return await axios.get(this.api + "api/entity/public/namespaces");
    } catch (error) {
      return [] as Namespace[];
    }
  }

  public static async getEcl(bundle: TTBundle): Promise<string> {
    try {
      return await axios.post(this.api + "api/entity/public/ecl", bundle);
    } catch (error) {
      return "";
    }
  }
}
