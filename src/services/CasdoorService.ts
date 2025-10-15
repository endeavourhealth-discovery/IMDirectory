import axios from "axios";
import Env from "./Env";

const CasdoorService = {
  async login(code: string, state: string) {
    await axios.get(Env.API + "api/casdoor/public/login", { params: { code: code, state: state } });
  },

  async logout() {
    await axios.get(Env.API + "api/casdoor/logout");
  },

  async getUser() {
    await axios.get(Env.API + "api/casdoor/user");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(CasdoorService);

export default CasdoorService;
