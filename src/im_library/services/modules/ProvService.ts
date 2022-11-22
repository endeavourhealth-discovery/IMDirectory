import Env from "./Env";
import { TTIriRef } from "../../interfaces";
import axios from "axios";
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

Object.freeze(ProvService);

export default ProvService;
