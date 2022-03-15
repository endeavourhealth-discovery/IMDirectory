import axios from "axios";
import { FilterDefaultsConfig, DefinitionConfig, DashboardLayout } from "im-library/dist/types/interfaces/Interfaces";
import Env from '@/services/Env';

export default class ConfigService {
  public static async getComponentLayout(name: string): Promise<DefinitionConfig[]> {
    try {
      return await axios.get(Env.api + "api/config/public/componentLayout", {
        params: {
          name: name
        }
      });
    } catch (error) {
      return [] as DefinitionConfig[];
    }
  }

  public static async getFilterDefaults(): Promise<FilterDefaultsConfig> {
    try {
      return await axios.get(Env.api + "api/config/public/filterDefaults");
    } catch (error) {
      return {} as FilterDefaultsConfig;
    }
  }

  public static async getDashboardLayout(name: string): Promise<DashboardLayout[]> {
    try {
      return await axios.get(Env.api + "api/config/public/dashboardLayout", {
        params: {
          name: name
        }
      });
    } catch (error) {
      return [] as DashboardLayout[];
    }
  }

  public static async getDefaultPredicateNames(): Promise<any> {
    try {
      return await axios.get(Env.api + "api/config/public/defaultPredicateNames");
    } catch (error) {
      return {} as any;
    }
  }

  public static async getGraphExcludePredicates(): Promise<any> {
    try {
      return await axios.get(Env.api + "api/config/public/graphExcludePredicates");
    } catch (error) {
      return [] as string[];
    }
  }

  public static async getXmlSchemaDataTypes(): Promise<any> {
    try {
      return await axios.get(Env.api + "api/config/public/xmlSchemaDataTypes");
    } catch (error) {
      return [] as string[];
    }
  }
}
