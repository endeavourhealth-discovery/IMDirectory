import {GraphdbService, iri} from "@/services/graphdb.service";

export default class ProvRepository {

    private graph: GraphdbService;

    constructor() {
        this.graph = new GraphdbService();
    }

    public async getProvHistory(url:string): Promise<any[]> {
        const qry = "SELECT ?prov ?effectiveDate ?activityType ?agent ?agentName ?usedEntity ?usedEntityName ?activityTypeName WHERE {" +
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
            imProvTarget: iri("http://endhealth.info/im#provenanceTarget"),
            entity: iri(url),
            imEffectiveDate: iri("http://endhealth.info/im#effectiveDate"),
            imProvActivityType: iri("http://endhealth.info/im#provenanceActivityType"),
            imProvAgent: iri("http://endhealth.info/im#provenanceAgent"),
            imUsedEntity: iri("http://endhealth.info/im#usedEntity")
        });
    }
}