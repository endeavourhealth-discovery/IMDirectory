import { DefinitionConfig, DashboardLayout } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const ConfigService = {
  async getComponentLayout(name: string): Promise<string> {
    return await axios.get(Env.VITE_NODE_API + "node_api/config/public/componentLayout", {
      params: {
        name: name
      }
    });
  },

  async getDashboardLayout(name: string): Promise<string> {
    return await axios.get(Env.VITE_NODE_API + "node_api/config/public/dashboardLayout", {
      params: {
        name: name
      }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
