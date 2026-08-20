import { parseApiResponse, parseArray } from "@endeavour/vue-library/helpers";

import z from "zod";

import { type Namespace, NamespaceSchema } from "@/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/config/public";

const ConfigService = {
  async getNamespaces(): Promise<Namespace[]> {
    const result = await api.get(API_URL + "/namespaces");
    return parseApiResponse(result, z.array(NamespaceSchema));
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
