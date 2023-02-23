import Env from "./Env";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { QueryDisplay, QueryObject, AllowableChildProperty, AliasEntity } from "@im-library/interfaces";
import axios from "axios";
import { PathDocument, QueryRequest } from "@im-library/models/AutoGen";

const QueryService = {
  async querySummary(iri: string): Promise<any> {
    try {
      return await axios.get(Env.VITE_NODE_API + "node_api/query/public/querySummary", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return {} as any;
    }
  },

  async definition(iri: string): Promise<any> {
    try {
      return await axios.get(Env.VITE_NODE_API + "node_api/query/public/definition", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return {} as any;
    }
  },

  async getRichDefinition(iri: string): Promise<any> {
    try {
      return await axios.get(Env.VITE_NODE_API + "node_api/query/public/richDefinition", {
        params: {
          iri: iri
        }
      });
    } catch (error) {
      return {} as any;
    }
  },

  async generateSQL(conceptIri: string) {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/getSQL", {
      params: {
        iri: conceptIri
      },
      responseType: "text"
    });
  },

  async queryIM(query: QueryRequest, controller?: AbortController): Promise<{ entities: any[]; "@context": any }> {
    try {
      if (controller) return await axios.post(Env.API + "api/query/public/queryIM", query, { signal: controller.signal });
      else return await axios.post(Env.API + "api/query/public/queryIM", query);
    } catch (error) {
      return undefined as any;
    }
  },

  async checkValidation(validationIri: string, data: any): Promise<boolean> {
    try {
      return await axios.post(Env.VITE_NODE_API + "node_api/validation/public/validate", data, { params: { iri: validationIri } });
    } catch (error) {
      return false;
    }
  },

  async runFunction(iri: string, args?: any[]): Promise<any> {
    try {
      if (args && args.length > 0) {
        const result: any = await axios.post(Env.API + "api/function/public/callFunction", {
          functionIri: iri,
          arguments: args
        });
        if (isArrayHasLength(args) && args.find(arg => arg.parameter === "fieldName")) return result[args.find(arg => arg.parameter === "fieldName").valueData];
        else return result;
      } else return await axios.post(Env.API + "api/function/public/callFunction", { functionIri: iri });
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },

  async entityQuery(query: QueryRequest, controller?: AbortController) {
    try {
      if (controller) return await axios.post(Env.API + "api/query/public/entityQuery", query, { signal: controller.signal });
      else return await axios.post(Env.API + "api/query/public/entityQuery", query);
    } catch (error) {
      return undefined;
    }
  },

  async getSetQueryDisplay(query: any): Promise<QueryDisplay> {
    try {
      return await axios.post(Env.VITE_NODE_API + "node_api/query/public/queryDisplay", query);
    } catch (error) {
      return {} as QueryDisplay;
    }
  },

  async getQueryObject(query: any): Promise<QueryObject> {
    try {
      return await axios.post(Env.VITE_NODE_API + "node_api/query/public/queryObject", query);
    } catch (error) {
      return {} as QueryObject;
    }
  },

  async getQueryDefinitionDisplay(conceptIri: string): Promise<QueryDisplay> {
    try {
      return await axios.get(Env.VITE_NODE_API + "node_api/query/public/queryDefinitionDisplay", {
        params: { iri: conceptIri }
      });
    } catch (error) {
      return {} as QueryDisplay;
    }
  },

  async getQueryObjectByIri(conceptIri: string): Promise<QueryObject> {
    try {
      return await axios.get(Env.VITE_NODE_API + "node_api/query/public/queryObjectDisplay", {
        params: { iri: conceptIri }
      });
    } catch (error) {
      return {} as QueryObject;
    }
  },

  async getAllowablePropertySuggestions(conceptIri: string, searchTerm?: string, controller?: AbortController): Promise<AliasEntity[]> {
    try {
      if (controller)
        return await axios.get(Env.VITE_NODE_API + "node_api/query/public/allowablePropertySuggestions", {
          params: { iri: conceptIri, searchTerm: searchTerm },
          signal: controller.signal
        });
      else
        return await axios.get(Env.VITE_NODE_API + "node_api/query/public/allowablePropertySuggestions", {
          params: { iri: conceptIri, searchTerm: searchTerm }
        });
    } catch (error) {
      return [] as AliasEntity[];
    }
  },

  async getAllowableRangeSuggestions(conceptIri: string, searchTerm?: string, controller?: AbortController): Promise<AliasEntity[]> {
    try {
      if (controller)
        return await axios.get(Env.VITE_NODE_API + "node_api/query/public/allowableRangeSuggestions", {
          params: { iri: conceptIri, searchTerm: searchTerm },
          signal: controller.signal
        });
      else
        return await axios.get(Env.VITE_NODE_API + "node_api/query/public/allowableRangeSuggestions", {
          params: { iri: conceptIri, searchTerm: searchTerm }
        });
    } catch (error) {
      return [] as AliasEntity[];
    }
  },

  async getAllowableChildTypes(conceptIri: string): Promise<AllowableChildProperty[]> {
    try {
      return await axios.get(Env.VITE_NODE_API + "node_api/query/public/allowableChildTypes", {
        params: { iri: conceptIri }
      });
    } catch (error) {
      return [] as AllowableChildProperty[];
    }
  },

  async getPathSuggestions(queryRequest: QueryRequest): Promise<PathDocument> {
    try {
      return await axios.post(Env.VITE_NODE_API + "node_api/query/public/pathQuery", queryRequest);
    } catch (error) {
      return {} as PathDocument;
    }
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(QueryService);

export default QueryService;
