import { Graph } from "@/interfaces/AutoGen";
import axios from "axios";
import Env from "./Env";
import { Namespace } from "@/interfaces/AutoGen";

const API_URL = Env.API + "api/config";

const ConfigService = {
  async getNamespaces(): Promise<Namespace[]> {
    return await axios.get(API_URL + "/public/namespaces");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
