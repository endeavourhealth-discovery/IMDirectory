import Env from "./Env";
import axios from "axios";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
const node_api = Env.VITE_NODE_API;

const ProvService = {
  async getProvHistory(iri: string): Promise<TTIriRef[]> {
    try {
      return await axios.get(node_api + "node_api/prov/public/history", {
        params: { url: iri }
      });
    } catch (error) {
      return [] as TTIriRef[];
    }
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ProvService);

export default ProvService;
