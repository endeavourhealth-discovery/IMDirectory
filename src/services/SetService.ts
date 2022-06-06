import axios, { CancelToken } from "axios";
import { SearchResponse } from "im-library/dist/types/models/modules/Search";
import { Env } from "im-library";

export default class SetService {
  public static async download(conceptIri: string, expanded: boolean, v1: boolean) {
    return axios.get(Env.API + "api/set/public/download", {
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
      return await axios.post(Env.API + "api/set/public/eclSearch", searchString, {
        headers: { "Content-Type": "text/plain" },
        params: { includeLegacy: includeLegacy, limit: limit },
        cancelToken: cancelToken
      });
    } catch (error) {
      return {} as SearchResponse;
    }
  }
}
