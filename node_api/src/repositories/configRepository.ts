import { GraphdbService, iri, sanitise } from "@/services/graphdb.service";
import { IM, RDFS } from "@im-library/vocabulary";
import { isArray } from "lodash";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
export default class ConfigRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = new GraphdbService();
  }

  public async getConfig(url: string): Promise<any> {
    const qry = "SELECT ?name ?data WHERE {" + "  GRAPH ?c {" + "        ?s ?label   ?name ;" + "           ?config  ?data ." + "  }" + "}";

    const rs = await this.graph.execute(
      qry,
      {
        c: iri("http://endhealth.info/config#"),
        s: iri(url),
        label: iri(RDFS.LABEL),
        config: iri(IM.HAS_CONFIG)
      },
      true
    );

    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["data"])) {
      return rs[0].data.value;
    } else {
      throw new Error(`Config not found: ${url}`);
    }
  }

  public async setConfig(subjectUrl: string, name: string, description: string, data: any): Promise<void> {
    await this.graph.delete(iri(subjectUrl), iri(IM.HAS_CONFIG));

    const qry =
      "INSERT DATA { " +
      "GRAPH " +
      iri("http://endhealth.info/config#") +
      " { " +
      iri(subjectUrl) +
      " " +
      iri(RDFS.LABEL) +
      " " +
      sanitise(name) +
      ";" +
      iri(RDFS.COMMENT) +
      " " +
      sanitise(description) +
      ";" +
      iri(IM.HAS_CONFIG) +
      " " +
      sanitise(data) +
      " ." +
      "   }" +
      "}";

    await this.graph.update(qry, true);
  }
}
