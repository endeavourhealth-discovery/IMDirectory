import axios from "axios";
import Env from "./Env";

const API_URL = Env.API + "api/status";

const StatusService = {
  async isPublicMode(): Promise<boolean> {
    return await axios.get(API_URL + "/public/isPublicMode");
  },

  async isDevMode(): Promise<boolean> {
    return await axios.get(API_URL + "/public/isDevMode");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(StatusService);

export default StatusService;
