import axios from "axios";
import Env from "./Env";
import { SetDiffObject } from "@/interfaces";
import { EclSearchRequest, Node, Pageable, Query, SetExportRequest, TTIriRef } from "@/interfaces/AutoGen";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";
const API_URL = Env.API + "api/set";

const SetService = {
  async publish(conceptIri: string) {
    return await axios.get(API_URL + "/publish", {
      params: { iri: conceptIri }
    });
  },

  async IMV1(conceptIri: string, raw?: boolean) {
    return await axios.get(API_URL + "/public/export", {
      params: { iri: conceptIri },
      responseType: "blob",
      raw: raw
    });
  },
  async getMembers(iri: string, entailments: boolean, pageIndex: number, pageSize: number, controller?: AbortController): Promise<Pageable<Node>> {
    return await axios.get(API_URL + "/public/members", {
      params: { iri: iri, entailments: entailments, page: pageIndex, size: pageSize },
      signal: controller?.signal
    });
  },

  async getMembersFromQuery(query: Query, pageIndex: number, pageSize: number): Promise<Pageable<Node>> {
    const request = { eclQuery: query, page: pageIndex, size: pageSize } as EclSearchRequest;
    return await axios.post(API_URL + "/public/membersFromQuery", request);
  },

  async getSubsets(iri: string): Promise<TTIriRef[]> {
    return await axios.get(API_URL + "/public/subsets", {
      params: {
        iri: iri
      }
    });
  },

  async getSetComparison(iriA?: string, iriB?: string): Promise<SetDiffObject> {
    return await axios.get(API_URL + "/public/setDiff", {
      params: {
        setIriA: iriA,
        setIriB: iriB
      }
    });
  },

  async getFullExportSet(setRequest: SetExportRequest, raw?: boolean): Promise<Blob> {
    return await axios.post(API_URL + "/public/setExport", setRequest, {
      responseType: "blob",
      raw: raw
    });
  },

  async updateSubsetsFromSuper(entity: TTEntity) {
    return await axios.post(API_URL + "/updateSubsetsFromSuper", entity);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(SetService);

export default SetService;
