import axios from "axios";
import Env from "./Env";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Argument } from "@/interfaces/AutoGen";

const FunctionService = {
  async runFunction(iri: string, args?: Argument[]): Promise<any> {
    if (args && args.length > 0) {
      const result: any = await axios.post(Env.API + "api/function/public/callFunction", {
        functionIri: iri,
        arguments: args
      });
      if (isArrayHasLength(args)) {
        const found = args.find(arg => arg.parameter === "fieldName");
        if (found && found.valueData) return result[found.valueData];
        else return result;
      } else return result;
    } else return await axios.post(Env.API + "api/function/public/callFunction", { functionIri: iri });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(FunctionService);

export default FunctionService;
