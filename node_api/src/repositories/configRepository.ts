import {GraphdbService, iri} from "@/services/graphdb.service";
import { IM, RDFS } from "@im-library/vocabulary";
import { DefinitionConfig, DashboardLayout } from "@im-library/interfaces";
export default class ConfigRepository {
    private graph: GraphdbService;

    constructor() {
        this.graph = new GraphdbService();
    }

    public async getConfig(url: string): Promise<any[]> {
        const qry = "SELECT ?name ?data WHERE {" +
            "  GRAPH ?c {" +
            "        ?s ?label   ?name ;" +
            "           ?config  ?data ." +
            "  }" +
            "}";

        const rs = await this.graph.execute(qry, {
            c: iri("http://endhealth.info/config#"),
            s: iri(url),
            label: iri(RDFS.LABEL),
            config: iri(IM.HAS_CONFIG)
        },true);

        return rs[0].data.value;

    }
}