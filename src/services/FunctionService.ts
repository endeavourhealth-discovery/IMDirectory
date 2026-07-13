import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { Argument } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/function/protected";

const FunctionService = {
  async runFunction(iri: string, args?: Argument[]): Promise<any> {
    if (args && args.length > 0) {
      const result: any = await api.post(API_URL + "/callFunction", {
        functionIri: iri,
        arguments: args
      });
      if (isArrayHasLength(args)) {
        const found = args.find(arg => arg.parameter === "fieldName");
        if (found && found.valueData) return result[found.valueData];
        else return result;
      } else return result;
    } else return await api.post(API_URL + "/callFunction", { functionIri: iri });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(FunctionService);

export default FunctionService;
