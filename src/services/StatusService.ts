import axios from "axios";
import Env from "./Env";

const StatusService = {
  async isPublicMode(): Promise<boolean> {
    return axios.get(Env.API + "api/status/public/isPublicMode");
  },

  async isDevMode(): Promise<boolean> {
    return axios.get(Env.API + "api/status/public/isDevMode");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(StatusService);

export default StatusService;
