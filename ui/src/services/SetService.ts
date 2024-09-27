import axios from "axios";
import Env from "./Env";
import { SetDiffObject } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
const API = Env.API;
const MODEL_PATH = "api/set";

const SetService = {
  async publish(conceptIri: string) {
    return axios.get(API + MODEL_PATH + "/publish", {
      params: { iri: conceptIri }
    });
  },

  async IMV1(conceptIri: string, raw?: boolean) {
    return axios.get(API + MODEL_PATH + "/public/export", {
      params: { iri: conceptIri },
      responseType: "blob",
      raw: raw
    });
  },

  async getFullyExpandedSetMembers(iri: string, legacy: boolean, includeSubsets: boolean): Promise<TTIriRef[]> {
    return axios.get(API + MODEL_PATH + "/public/expandedMembers", {
      params: {
        iri: iri,
        legacy: legacy,
        includeSubsets: includeSubsets
      }
    });
  },

  async getSubsets(iri: string): Promise<TTIriRef[]> {
    return axios.get(API + MODEL_PATH + "/public/subsets", {
      params: {
        iri: iri
      }
    });
  },

  async getSetComparison(iriA?: string, iriB?: string): Promise<SetDiffObject> {
    return axios.get(Env.VITE_NODE_API + "node_api/entity/public/setDiff", {
      params: {
        setIriA: iriA,
        setIriB: iriB
      }
    });
  },

  async getFullExportSet(
    iri: string,
    definition: boolean,
    core: boolean,
    legacy: boolean,
    includeSubsets: boolean,
    ownRow: boolean,
    im1id: boolean,
    format: string,
    schemes: string[],
    raw?: boolean
  ): Promise<any> {
    return axios.get(API + MODEL_PATH + "/public/setExport", {
      params: {
        iri: iri,
        definition: definition,
        core: core,
        legacy: legacy,
        includeSubsets: includeSubsets,
        ownRow: ownRow,
        im1id: im1id,
        format: format,
        schemes: schemes.join(",")
      },
      responseType: "blob",
      raw: raw
    });
  },

  async updateSubsetsFromSuper(entity: any) {
    return axios.post(Env.API + MODEL_PATH + "/updateSubsetsFromSuper", entity);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SetService);

export default SetService;
