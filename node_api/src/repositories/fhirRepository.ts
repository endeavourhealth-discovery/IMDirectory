import { GraphdbService, sanitise } from "@/services/graphdb.service";
import Env from "@/services/env.service";
import axios from "axios";
import { IM, RDFS } from "@im-library/vocabulary";

export default class FhirRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.imRepo();
  }

  public async getMembers(url: string): Promise<any[]> {
    return await this.graph.execute(
      "select * where { \n" +
        " ?s ?hasMember ?member .\n" +
        "    ?member ?imCode ?code ;\n" +
        "            ?imScheme ?scheme ;\n" +
        "            ?label ?term .\n" +
        "}",
      {
        s: sanitise(url),
        hasMember: sanitise(IM.HAS_MEMBER),
        imCode: sanitise(IM.CODE),
        imScheme: sanitise(IM.SCHEME),
        label: sanitise(RDFS.LABEL)
      }
    );
  }

  public async getSubsets(url: string): Promise<any[]> {
    const rs = await this.graph.execute("SELECT ?subset WHERE { ?subset ?p ?o }", {
      o: sanitise(url),
      p: sanitise(IM.IS_SUBSET_OF)
    });

    const result = [] as any[];
    rs.forEach(r => result.push(r.subset.value));

    return result;
  }

  public async getDefinition(url: string): Promise<any[]> {
    const rs = await this.graph.execute("SELECT ?def WHERE { ?s ?p ?def }", {
      s: sanitise(url),
      p: sanitise(IM.DEFINITION)
    });

    const result = [] as any[];
    rs.forEach(r => result.push(r.def.value));

    return result;
  }

  async getECLFromDefinition(def: any): Promise<string> {
    if (def === null || def.length === 0) {
      return "";
    }
    const query = JSON.parse(def[0]);
    return (await axios.post<string>(Env.API + "api/set/public/query/ecl", query)).data;
  }

  async getMetaData(url: string) {
    return await this.graph.execute(
      "SELECT * where { \n" +
        "   OPTIONAL{ ?s ?imCode ?code .} \n" +
        "   ?s ?imScheme ?scheme ;\n" +
        "      ?label ?term ;\n" +
        "      ?imStatus ?status .\n" +
        "   ?status ?label ?statusLabel .\n" +
        "   OPTIONAL{ ?s  ?comment ?desc .}\n" +
        "   OPTIONAL{ ?s  ?imVersion ?version .}\n" +
        "}",
      {
        s: sanitise(url),
        imCode: sanitise(IM.CODE),
        imScheme: sanitise(IM.SCHEME),
        label: sanitise(RDFS.LABEL),
        imStatus: sanitise(IM.HAS_STATUS),
        comment: sanitise(RDFS.COMMENT),
        imVersion: sanitise(IM.VERSION)
      }
    );
  }
}
