import { GraphdbService, iri } from "@/services/graphdb.service";
import { IM } from "@im-library/vocabulary";

export default class ProvRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = new GraphdbService();
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
      imProvTarget: iri(IM.PROV_TARGET),
      entity: iri(url),
      imEffectiveDate: iri(IM.EFFECTIVE_DATE),
      imProvActivityType: iri(IM.PROV_ACTIVITY_TYPE),
      imProvAgent: iri(IM.PROV_AGENT),
      imUsedEntity: iri(IM.PROV_USED)
    });
  }
}
