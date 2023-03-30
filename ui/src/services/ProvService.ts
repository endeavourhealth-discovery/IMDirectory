import Env from "./Env";
import axios from "axios";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
const node_api = Env.VITE_NODE_API;

const ProvService = {
  async getProvHistory(iri: string): Promise<TTIriRef[]> {
    return axios.get(node_api + "node_api/prov/public/history", {
      params: { url: iri }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ProvService);

export default ProvService;
