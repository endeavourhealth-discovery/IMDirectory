import axios from "axios";
import Env from "./Env";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { FunctionRequest } from "@im-library/interfaces/AutoGen";
import { ConceptSummary } from "@im-library/interfaces";

const FunctionService = {
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

  async runSearchFunction(request: FunctionRequest, controller?: AbortController, raw?: boolean): Promise<ConceptSummary[]> {
    return await axios.post(Env.VITE_NODE_API + "node_api/function/public/callSearchFunction", request, { signal: controller?.signal, raw: raw });
  },

  async runAskFunction(request: FunctionRequest, controller?: AbortController, raw?: boolean): Promise<boolean> {
    return axios.post(Env.VITE_NODE_API + "node_api/function/public/callAskFunction", request, { signal: controller?.signal, raw: raw });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(FunctionService);

export default FunctionService;
