import Env from "./Env";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { AllowableChildProperty, AliasEntity } from "@im-library/interfaces";
import axios from "axios";
import { PathDocument, Query, QueryRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";

const QueryService = {
  async querySummary(iri: string): Promise<any> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/querySummary", {
      params: {
        iri: iri
      }
    });
  },

  async definition(iri: string): Promise<any> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/definition", {
      params: {
        iri: iri
      }
    });
  },

  async getRichDefinition(iri: string): Promise<any> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/richDefinition", {
      params: {
        iri: iri
      }
    });
  },

  async queryIM(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<{ entities: any[]; "@context": any }> {
    if (controller) return await axios.post(Env.API + "api/query/public/queryIM", query, { signal: controller.signal, raw: raw });
    else return await axios.post(Env.API + "api/query/public/queryIM", query, { raw: raw });
  },

  async queryIMSearch(query: QueryRequest, controller?: AbortController, raw: boolean = false): Promise<SearchResultSummary[]> {
    return await axios.post(Env.API + "api/query/public/queryIMSearch", query, { signal: controller?.signal, raw: raw });
  },

  async checkValidation(validationIri: string, data: any): Promise<{ isValid: boolean; message: string | undefined }> {
    return axios.post(Env.VITE_NODE_API + "node_api/validation/public/validate", data, { params: { iri: validationIri } });
  },

  async runFunction(iri: string, args?: any[]): Promise<any> {
    if (args && args.length > 0) {
      const result: any = await axios.post(Env.API + "api/function/public/callFunction", {
        functionIri: iri,
        arguments: args
      });
      if (isArrayHasLength(args) && args.find(arg => arg.parameter === "fieldName")) return result[args.find(arg => arg.parameter === "fieldName").valueData];
      else return result;
    } else return await axios.post(Env.API + "api/function/public/callFunction", { functionIri: iri });
  },

  async entityQuery(query: QueryRequest, controller?: AbortController) {
    if (controller) return await axios.post(Env.API + "api/query/public/entityQuery", query, { signal: controller.signal });
    else return await axios.post(Env.API + "api/query/public/entityQuery", query);
  },

  async getAllowablePropertySuggestions(conceptIri: string, searchTerm?: string, controller?: AbortController): Promise<AliasEntity[]> {
    return await axios.get(Env.VITE_NODE_API + "node_api/query/public/allowablePropertySuggestions", {
      params: { iri: conceptIri, searchTerm: searchTerm },
      signal: controller?.signal
    });
  },

  async getAllowablePropertySuggestionsBoolFocus(focus: any, searchTerm?: string, controller?: AbortController): Promise<AliasEntity[]> {
    return axios.post(
      Env.VITE_NODE_API + "node_api/query/public/allowablePropertySuggestionsBoolFocus",
      { focus: focus, searchTerm: searchTerm },
      { signal: controller?.signal }
    );
  },

  async getAllowableRangeSuggestions(conceptIri: string, searchTerm?: string, controller?: AbortController): Promise<AliasEntity[]> {
    if (controller)
      return await axios.get(Env.VITE_NODE_API + "node_api/query/public/allowableRangeSuggestions", {
        params: { iri: conceptIri, searchTerm: searchTerm },
        signal: controller.signal
      });
    else
      return await axios.get(Env.VITE_NODE_API + "node_api/query/public/allowableRangeSuggestions", {
        params: { iri: conceptIri, searchTerm: searchTerm }
      });
  },

  async getAllowableChildTypes(conceptIri: string): Promise<AllowableChildProperty[]> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/allowableChildTypes", {
      params: { iri: conceptIri }
    });
  },

  async getPropertyRange(propIri: string): Promise<any[]> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/propertyRange", {
      params: { propIri: propIri }
    });
  },

  async isFunctionProperty(propIri: string): Promise<any> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/isFunctionProperty", {
      params: { propIri: propIri }
    });
  },

  async getPathSuggestions(queryRequest: QueryRequest): Promise<PathDocument> {
    return axios.post(Env.API + "api/query/public/pathQuery", queryRequest);
  },

  async getLabeledQuery(query: Query): Promise<Query> {
    return axios.post(Env.VITE_NODE_API + "node_api/query/public/labeledQuery", query);
  },

  async getQueryDisplay(iri: string): Promise<Query> {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/queryDisplay", { params: { queryIri: iri } });
  },

  async getAllQueries(): Promise<any> {
    return axios.get(Env.API + "api/query/public/allQueries");
  },

  async getAllQByType(iri: string): Promise<any> {
    return axios.get(Env.API + "api/query/public/allByType", { params: { iri: iri } });
  },

  async getDataModelProperty(dataModelIri: string, propertyIri: string) {
    return axios.get(Env.VITE_NODE_API + "node_api/query/public/dataModelProperty", { params: { dataModelIri: dataModelIri, propertyIri: propertyIri } });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(QueryService);

export default QueryService;
