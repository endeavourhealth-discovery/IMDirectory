import axios, { CancelToken } from "axios";
import { SearchResponse } from "@/models/entityServiceTypes/EntityServiceTypes";

export default class SetService {
  static api = process.env.VUE_APP_API;

  public static async download(conceptIri: string, expanded: boolean, v1: boolean) {
    return await axios.get(this.api + "api/set/public/download", {
      params: {
        iri: conceptIri,
        expandMembers: expanded,
        v1: expanded && v1,
        format: "excel"
      },
      responseType: "blob"
    });
  }

  public static async ECLSearch(searchString: string, includeLegacy: boolean, limit: number, cancelToken: CancelToken): Promise<SearchResponse> {
    try {
      return await axios.post(this.api + "api/set/public/eclSearch", searchString, {
        headers: { "Content-Type": "text/plain" },
        params: { includeLegacy: includeLegacy, limit: limit },
        cancelToken: cancelToken
      });
    } catch (error) {
      return {} as SearchResponse;
    }
  }
}
