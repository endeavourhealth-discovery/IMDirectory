import axios from "axios";
import Env from "./Env";
import { Action, Resource } from "@/interfaces/AutoGen";

const API_URL = Env.API + "api/casbin";

const CasbinService = {
  async hasPermission(resource: Resource, action: Action): Promise<boolean> {
    return await axios.get(API_URL + "/hasPermission", { params: { resource: resource, action: action } });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(CasbinService);

export default CasbinService;
