import { FilterDefaultsConfig, DefinitionConfig, DashboardLayout } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const ConfigService = {
  async getComponentLayout(name: string): Promise<DefinitionConfig[]> {
    try {
      return await axios.get(Env.API + "api/config/public/componentLayout", {
        params: {
          name: name
        }
      });
    } catch (error) {
      return [] as DefinitionConfig[];
    }
  },

  async getDashboardLayout(name: string): Promise<DashboardLayout[]> {
    try {
      return await axios.get(Env.API + "api/config/public/dashboardLayout", {
        params: {
          name: name
        }
      });
    } catch (error) {
      return [] as DashboardLayout[];
    }
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ConfigService);

export default ConfigService;
