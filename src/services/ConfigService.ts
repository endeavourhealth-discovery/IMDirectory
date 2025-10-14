import { Graph } from "@/interfaces/AutoGen";
import axios from "axios";
import Env from "./Env";

const ConfigService = {
  async getGraphs(): Promise<Graph[]> {
    return await axios.get(Env.API + "api/config/public/graphs");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
