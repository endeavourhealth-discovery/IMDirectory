import axios from "axios";
import Env from "./Env";
import { SetDiffObject } from "@/interfaces";
import type { ECLQueryRequest, Node, Pageable, Query, SetExportRequest, TTIriRef } from "vue-library/interfaces";
import type { ExtendedTTEntity } from "vue-library/interfaces";
const API_URL = Env.API + "api/set";

const SetService = {
  async publish(conceptIri: string) {
    return await axios.get(API_URL + "/private/publish", {
      params: { iri: conceptIri }
    });
  },

  async IMV1(conceptIri: string, raw?: boolean) {
    return await axios.get(API_URL + "/protected/export", {
      params: { iri: conceptIri },
      responseType: "blob",
      raw: raw
    });
  },
  async getMembers(iri: string, entailments: boolean, pageIndex: number, pageSize: number, controller?: AbortController): Promise<Pageable<Node>> {
    return await axios.get(API_URL + "/protected/members", {
      params: { iri: iri, entailments: entailments, page: pageIndex, size: pageSize },
      signal: controller?.signal
    });
  },

  async getMembersFromQuery(query: Query, pageIndex: number, pageSize: number): Promise<Pageable<Node>> {
    const request = { query: query, page: pageIndex, size: pageSize } as ECLQueryRequest;
    return await axios.post(API_URL + "/protected/membersFromQuery", request);
  },

  async getSubsets(iri: string): Promise<TTIriRef[]> {
    return await axios.get(API_URL + "/protected/subsets", {
      params: {
        iri: iri
      }
    });
  },

  async getFullExportSet(setRequest: SetExportRequest, raw?: boolean): Promise<Blob> {
    return await axios.post(API_URL + "/protected/setExport", setRequest, {
      responseType: "blob",
      raw: raw
    });
  },

  async getSetComparison(iriA?: string, iriB?: string): Promise<SetDiffObject> {
    return await axios.get(API_URL + "/protected/setDiff", {
      params: {
        setIriA: iriA,
        setIriB: iriB
      }
    });
  },
  async updateSubsetsFromSuper(entity: ExtendedTTEntity) {
    return await axios.post(API_URL + "/private/updateSubsetsFromSuper", entity);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SetService);

export default SetService;
