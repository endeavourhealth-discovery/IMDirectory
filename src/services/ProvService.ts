import Env from "./Env";
import axios from "axios";
import { TTIriRef } from "@/interfaces/AutoGen";
const node_api = Env.VITE_NODE_API;

const ProvService = {
  async getProvHistory(iri: string): Promise<TTIriRef[]> {
    return axios.get(Env.API + "api/prov/public/history", {
      params: { iri: iri }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ProvService);

export default ProvService;
