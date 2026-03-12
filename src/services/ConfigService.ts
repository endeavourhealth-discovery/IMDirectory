import axios from "axios";
import Env from "./Env";
import { Namespace } from "@/interfaces/AutoGen";

const API_URL = Env.API + "api/config/public";

const ConfigService = {
  async getNamespaces(): Promise<Namespace[]> {
    return await axios.get(API_URL + "/namespaces");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
