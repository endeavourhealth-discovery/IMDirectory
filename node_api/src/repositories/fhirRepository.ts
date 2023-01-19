import {GraphdbService, iri} from "@/services/graphdb.service";
import Env from "@/services/env.service";
import axios from "axios";

export default class FhirRepository {
    private graph: GraphdbService;

    constructor() {
        this.graph = new GraphdbService();
    }

    public  async  getMembers(url: string): Promise<any[]> {
        return await this.graph.execute("select * where { \n" +
            " ?s ?hasMember ?member .\n" +
            "    ?member ?imCode ?code ;\n" +
            "            ?imScheme ?scheme ;\n" +
            "            ?label ?term .\n" +
            "}", {
            s: iri(url),
            hasMember: iri("http://endhealth.info/im#hasMember"),
            imCode: iri("http://endhealth.info/im#code"),
            imScheme: iri("http://endhealth.info/im#scheme"),
            label: iri("http://www.w3.org/2000/01/rdf-schema#label")
        });
    }

    public  async  getSubsets(url: string): Promise<any[]> {
        const rs = await this.graph.execute("SELECT ?subset WHERE { ?subset ?p ?o }", {
            o: iri(url),
            p: iri("http://endhealth.info/im#isSubsetOf")
        });

        const result = [] as any[];
        rs.forEach((r) => result.push(r.subset.value));

        return result;
    }

    public  async  getDefinition(url: string): Promise<any[]> {
        const rs = await this.graph.execute("SELECT ?def WHERE { ?s ?p ?def }", {
            s: iri(url),
            p: iri("http://endhealth.info/im#definition")
        });

        const result = [] as any[];
        rs.forEach((r) => result.push(r.def.value));

        return result;
    }

    async getECLFromDefinition(def: any): Promise<string> {
        if(def===null || def.length===0){
            return "";
        }
        const query = JSON.parse(def[0]);
        return (await axios.post<string>(Env.API + "api/set/public/query/ecl", query)).data;
    }

    async getDetails(url:string) {
        return await this.graph.execute("SELECT * where { \n" +
            "    ?s ?imCode ?code ;\n" +
            "       ?imScheme ?scheme ;\n" +
            "       ?label ?term .\n" +
            "}", {
            s: iri(url),
            imCode: iri("http://endhealth.info/im#code"),
            imScheme: iri("http://endhealth.info/im#scheme"),
            label: iri("http://www.w3.org/2000/01/rdf-schema#label")
        });

    }
}