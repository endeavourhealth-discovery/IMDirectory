import axios from "axios";
import Env from "./Env";

const SetService = {
  async publish(conceptIri: string) {
    return axios.get(Env.API + "api/set/publish", {
      params: { iri: conceptIri }
    });
  },

  async IMV1(conceptIri: string, raw?: boolean) {
    return axios.get(Env.API + "api/set/public/export", {
      params: { iri: conceptIri },
      responseType: "blob",
      raw: raw
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SetService);

export default SetService;
