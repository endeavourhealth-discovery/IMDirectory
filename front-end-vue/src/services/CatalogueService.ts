import { SimpleCount } from "@/models/SimpleCount";
import { TTBundle } from "@/models/TripleTree";
import axios, { CancelToken } from "axios";

export default class CatalogueService {
  static api = process.env.VUE_APP_API;

  public static async getSearchResult(request: string, typesIris: string[], cancelToken: CancelToken): Promise<any[]> {
    try {
      return await axios.get(this.api + "instance/public/search", {
        params: { request: request, typesIris: typesIris.join(",") },
        cancelToken: cancelToken
      });
    } catch (error) {
      return [] as any[];
    }
  }

  public static async getPartialInstance(iri: string, predicates?: string[]): Promise<TTBundle> {
    try {
      return await axios.get(this.api + "instance/public/partial", {
        params: { iri: iri, predicate: predicates }
      });
    } catch (error) {
      return {} as TTBundle;
    }
  }

  public static async getTypesCount(): Promise<SimpleCount[]> {
    try {
      return await axios.get(this.api + "instance/public/typesCount");
    } catch (error) {
      return [] as SimpleCount[];
    }
  }
}
