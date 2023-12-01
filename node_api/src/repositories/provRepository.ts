import { GraphdbService, sanitise } from "@/services/graphdb.service";
import { IM } from "@im-library/vocabulary";

export default class ProvRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.imRepo();
  }

  public async getProvHistory(url: string): Promise<any[]> {
    const qry =
      "SELECT ?prov ?effectiveDate ?activityType ?agent ?agentName ?usedEntity ?usedEntityName ?activityTypeName WHERE {" +
      "?prov ?imProvTarget ?entity ;" +
      "      ?imEffectiveDate ?effectiveDate ;" +
      "      ?imProvActivityType ?activityType ." +
      "Optional {?prov ?imProvAgent ?agent ." +
      "         Optional {?agent rdfs:label ?agentName .}}" +
      "Optional {?prov ?imUsedEntity ?usedEntity ." +
      "         Optional {?usedEntity rdfs:label ?usedEntityName .}}" +
      "Optional {?activityType rdfs:label ?activityTypeName .}" +
      "} order by desc(?effectiveDate)";

    return await this.graph.execute(qry, {
      imProvTarget: sanitise(IM.PROV_TARGET),
      entity: sanitise(url),
      imEffectiveDate: sanitise(IM.EFFECTIVE_DATE),
      imProvActivityType: sanitise(IM.PROV_ACTIVITY_TYPE),
      imProvAgent: sanitise(IM.PROV_AGENT),
      imUsedEntity: sanitise(IM.PROV_USED)
    });
  }
}
