import axios from "axios";
import Env from "./Env";
import { SetDiffObject } from "@/interfaces";
import { TTIriRef } from "@/interfaces/AutoGen";
const API_URL = Env.API + "api/set";

const SetService = {
  async publish(conceptIri: string) {
    return axios.get(API_URL + "/publish", {
      params: { iri: conceptIri }
    });
  },

  async IMV1(conceptIri: string, raw?: boolean) {
    return axios.get(API_URL + "/public/export", {
      params: { iri: conceptIri },
      responseType: "blob",
      raw: raw
    });
  },
  async getMembers(iri: string, entailments: boolean, pageIndex: number, pageSize: number, controller?: AbortController): Promise<any> {
    return axios.get(API_URL + "/public/members", {
      params: { iri: iri, entailments: entailments, page: pageIndex, size: pageSize },
      signal: controller?.signal
    });
  },

  async getSubsets(iri: string): Promise<TTIriRef[]> {
    return axios.get(API_URL + "/public/subsets", {
      params: {
        iri: iri
      }
    });
  },

  async getSetComparison(iriA?: string, iriB?: string): Promise<SetDiffObject> {
    return axios.get(API_URL + "/public/setDiff", {
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
    subsumedBy: boolean,
    format: string,
    schemes: string[],
    raw?: boolean
  ): Promise<any> {
    return axios.get(API_URL + "/public/setExport", {
      params: {
        iri: iri,
        definition: definition,
        core: core,
        legacy: legacy,
        includeSubsets: includeSubsets,
        ownRow: ownRow,
        im1id: im1id,
        subsumedBy: subsumedBy,
        format: format,
        schemes: schemes.join(",")
      },
      responseType: "blob",
      raw: raw
    });
  },

  async updateSubsetsFromSuper(entity: any) {
    return axios.post(API_URL + "/updateSubsetsFromSuper", entity);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SetService);

export default SetService;
