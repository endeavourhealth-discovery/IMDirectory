import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/status/public";

const StatusService = {
  async isPublicMode(): Promise<boolean> {
    return await api.get(API_URL + "/isPublicMode");
  },

  async isDevMode(): Promise<boolean> {
    return await api.get(API_URL + "/isDevMode");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(StatusService);

export default StatusService;
