import {GraphdbService, iri} from "@/services/graphdb.service";

export default class FhirRepository {
    private graph: GraphdbService;

    constructor() {
        this.graph = new GraphdbService();
    }

    public  async  getMembers(url: string, expand: boolean): Promise<any[]> {
        const rs = await this.graph.execute("SELECT ?member WHERE { ?s ?p ?member }", {
            s: iri(url),
            p: iri("http://endhealth.info/im#hasMember")
        });

        const result = [] as any[];
        rs.forEach((r) => result.push(r.member.value));

        return result;
    }

    public  async  getSubsets(url: string): Promise<any[]> {
        const rs = await this.graph.execute("SELECT * WHERE { ?s ?p ?subset }", {
            s: iri(url),
            p: iri("http://endhealth.info/im#hasSubset")
        });

        const result = [] as any[];
        rs.forEach((r) => result.push(r.subset.value));

        return result;
    }
}