import type { Namespace } from "@endeavour/vue-library/interfaces";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/config/public";

const ConfigService = {
  async getNamespaces(): Promise<Namespace[]> {
    return await api.get(API_URL + "/namespaces");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
