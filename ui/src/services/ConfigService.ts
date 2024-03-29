import { DefinitionConfig, DashboardLayout } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const ConfigService = {
  async getComponentLayout(name: string): Promise<any[]> {
    return await axios.get(Env.API + "api/config/public/componentLayout", {
      params: {
        name: name
      }
    });
  },

  async getDashboardLayout(name: string): Promise<any[]> {
    return await axios.get(Env.API + "api/config/public/dashboardLayout", {
      params: {
        name: name
      }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
