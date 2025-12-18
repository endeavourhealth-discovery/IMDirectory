import { Graph } from "@/interfaces/AutoGen";
import axios from "axios";
import Env from "./Env";

const API_URL = Env.API + "api/config";

const ConfigService = {
  async getGraphs(): Promise<Graph[]> {
    return await axios.get(API_URL + "/public/graphs");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
