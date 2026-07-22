import { SetDiffObjectSchema, TTIriRefSchema, parseArray } from "@endeavour/vue-library";
import { type ECLQueryRequest, type PageableNode, PageableNodeSchema, type Query, type SetExportRequest, type TTIriRef } from "@endeavour/vue-library/models";
import type { TTEntity } from "@endeavour/vue-library/models";

import { SetDiffObject } from "@/interfaces";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/set";

const SetService = {
  async publish(conceptIri: string): Promise<void> {
    return await api.get(API_URL + "/private/publish", {
      params: { iri: conceptIri }
    });
  },

  async IMV1(conceptIri: string, raw?: boolean): Promise<Blob> {
    return await api.get(API_URL + "/protected/export", {
      params: { iri: conceptIri },
      responseType: "blob",
      raw: raw
    });
  },
  async getMembers(iri: string, entailments: boolean, pageIndex: number, pageSize: number, controller?: AbortController): Promise<PageableNode> {
    const result = await api.get(API_URL + "/protected/members", {
      params: { iri: iri, entailments: entailments, page: pageIndex, size: pageSize },
      signal: controller?.signal
    });
    return PageableNodeSchema.parse(result);
  },

  async getMembersFromQuery(query: Query, pageIndex: number, pageSize: number): Promise<PageableNode> {
    const request = { query: query, page: pageIndex, size: pageSize } as ECLQueryRequest;
    const result = await api.post(API_URL + "/protected/membersFromQuery", request);
    return PageableNodeSchema.parse(result);
  },

  async getSubsets(iri: string): Promise<TTIriRef[]> {
    const result = await api.get(API_URL + "/protected/subsets", {
      params: {
        iri: iri
      }
    });
    return parseArray(result, TTIriRefSchema);
  },

  async getFullExportSet(setRequest: SetExportRequest, raw?: boolean): Promise<Blob> {
    return await api.post(API_URL + "/protected/setExport", setRequest, {
      responseType: "blob",
      raw: raw
    });
  },

  async getSetComparison(iriA?: string, iriB?: string): Promise<SetDiffObject> {
    const result = await api.get(API_URL + "/protected/setDiff", {
      params: {
        setIriA: iriA,
        setIriB: iriB
      }
    });
    return SetDiffObjectSchema.parse(result);
  },
  async updateSubsetsFromSuper(entity: TTEntity): Promise<void> {
    return await api.post(API_URL + "/private/updateSubsetsFromSuper", entity);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SetService);

export default SetService;
