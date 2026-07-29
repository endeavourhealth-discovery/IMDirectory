import { parseArray } from "@endeavour/vue-library";
import { type Namespace, NamespaceSchema } from "@endeavour/vue-library/models";

import z from "zod";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/config/public";

const ConfigService = {
  async getNamespaces(): Promise<Namespace[]> {
    const result = await api.get(API_URL + "/namespaces");
    return parseArray(result, NamespaceSchema);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
