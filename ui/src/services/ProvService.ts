import Env from "./Env";
import axios from "axios";
import { TTIriRef } from "@im-library/interfaces";
const api = Env.API;

const ProvService = {
  async getProvHistory(iri: string) {
    try {
      return await axios.get(api + "api/prov/public/history", {
        params: { iri: iri }
      });
    } catch (error) {
      return [] as TTIriRef[];
    }
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ProvService);

export default ProvService;
