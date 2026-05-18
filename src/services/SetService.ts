import type { ECLQueryRequest, Node, Pageable, Query, SetExportRequest, TTIriRef } from "@endeavour/vue-library/interfaces";
import type { ExtendedTTEntity } from "@endeavour/vue-library/interfaces";

import { SetDiffObject } from "@/interfaces";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/set";

const SetService = {
  async publish(conceptIri: string) {
    return await api.get(API_URL + "/private/publish", {
      params: { iri: conceptIri }
    });
  },

  async IMV1(conceptIri: string, raw?: boolean) {
    return await api.get(API_URL + "/protected/export", {
      params: { iri: conceptIri },
      responseType: "blob",
      raw: raw
    });
  },
  async getMembers(iri: string, entailments: boolean, pageIndex: number, pageSize: number, controller?: AbortController): Promise<Pageable<Node>> {
    return await api.get(API_URL + "/protected/members", {
      params: { iri: iri, entailments: entailments, page: pageIndex, size: pageSize },
      signal: controller?.signal
    });
  },

  async getMembersFromQuery(query: Query, pageIndex: number, pageSize: number): Promise<Pageable<Node>> {
    const request = { query: query, page: pageIndex, size: pageSize } as ECLQueryRequest;
    return await api.post(API_URL + "/protected/membersFromQuery", request);
  },

  async getSubsets(iri: string): Promise<TTIriRef[]> {
    return await api.get(API_URL + "/protected/subsets", {
      params: {
        iri: iri
      }
    });
  },

  async getFullExportSet(setRequest: SetExportRequest, raw?: boolean): Promise<Blob> {
    return await api.post(API_URL + "/protected/setExport", setRequest, {
      responseType: "blob",
      raw: raw
    });
  },

  async getSetComparison(iriA?: string, iriB?: string): Promise<SetDiffObject> {
    return await api.get(API_URL + "/protected/setDiff", {
      params: {
        setIriA: iriA,
        setIriB: iriB
      }
    });
  },
  async updateSubsetsFromSuper(entity: ExtendedTTEntity) {
    return await api.post(API_URL + "/private/updateSubsetsFromSuper", entity);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SetService);

export default SetService;
