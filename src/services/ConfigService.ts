import { parseApiResponse, parseArray } from "@endeavour/vue-library/helpers";

import z from "zod";

import { type Namespace, NamespaceSchema } from "@/models";

import Env from "./Env";
import api from "./api";
import { STATIC_LOOKUP_TTL, cachedRequest } from "./requestCache";

const API_URL = Env.API + "api/config/public";

const ConfigService = {
  async getNamespaces(): Promise<Namespace[]> {
    const result = await cachedRequest("/config/namespaces", () => api.get(API_URL + "/namespaces"), STATIC_LOOKUP_TTL);
    return parseApiResponse(result, z.array(NamespaceSchema));
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
