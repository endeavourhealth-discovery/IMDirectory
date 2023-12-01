import { GraphdbService, sanitise } from "@/services/graphdb.service";
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
      c: sanitise(CONFIG.NAMESPACE),
      s: sanitise(url),
      label: sanitise(RDFS.LABEL),
      config: sanitise(IM.HAS_CONFIG)
    });

    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["data"])) {
      return rs[0].data.value;
    } else {
      throw new CustomError(`Config not found: ${url}`, ErrorType.ConfigNotFoundError);
    }
  }

  public async setConfig(subjectUrl: string, name: string, description: string, data: any): Promise<void> {
    await this.graph.delete(sanitise(subjectUrl), sanitise(IM.HAS_CONFIG));

    const qry =
      "INSERT DATA { " +
      "GRAPH " +
      sanitise(CONFIG.NAMESPACE) +
      " { " +
      sanitise(subjectUrl) +
      " " +
      sanitise(RDFS.LABEL) +
      " " +
      sanitise(name) +
      ";" +
      sanitise(RDFS.COMMENT) +
      " " +
      sanitise(description) +
      ";" +
      sanitise(IM.HAS_CONFIG) +
      " " +
      sanitise(data) +
      " ." +
      "   }" +
      "}";

    await this.graph.update(qry);
  }
}
