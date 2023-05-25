import { GraphdbService, iri, sanitise } from "@/services/graphdb.service";
import { CONFIG, IM, RDFS } from "@im-library/vocabulary";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";
export default class ConfigRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.configRepo();
  }

  public async getConfig(url: string): Promise<any> {
    const qry = "SELECT ?name ?data WHERE {" + "  GRAPH ?c {" + "        ?s ?label   ?name ;" + "           ?config  ?data ." + "  }" + "}";
    const rs = await this.graph.execute(qry, {
      c: iri(CONFIG.NAMESPACE),
      s: iri(url),
      label: iri(RDFS.LABEL),
      config: iri(IM.HAS_CONFIG)
    });
    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["data"]) && isObjectHasKeys(rs[0].data, ["id"])) {
      return rs[0].data.id;
    } else if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["data"]) && isObjectHasKeys(rs[0].data, ["value"])) {
      return rs[0].data.value;
    } else {
      throw new CustomError(`Config not found: ${url}`, ErrorType.ConfigNotFoundError);
    }
  }

  public async setConfig(subjectUrl: string, name: string, description: string, data: any): Promise<void> {
    await this.graph.delete(iri(subjectUrl), iri(IM.HAS_CONFIG));

    const qry =
      "INSERT DATA { " +
      "GRAPH " +
      iri(CONFIG.NAMESPACE) +
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

    await this.graph.update(qry);
  }
}
