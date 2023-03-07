import {GraphdbService, iri} from "@/services/graphdb.service";

export default class EntityRepository {

    private graph: GraphdbService;

    constructor() {
        this.graph = new GraphdbService();
    }

    public async getPropertyType(propIri: string): Promise<any> {
        const qry =
            "PREFIX sh:" + iri("http://www.w3.org/ns/shacl#") +
            "select distinct ?type ?tname where {" +
            "?entity sh:property ?o ." +
            "?o sh:path ?property ." +
            "?o (sh:class|sh:node|sh:datatype) ?type ." +
            "?type rdfs:label ?tname ." +
            "filter (?property in(?propIri))" +
            "}";

        return await this.graph.execute(qry, {
            shNamespace: iri("http://www.w3.org/ns/shacl#"),
            propIri: iri(propIri)
        });
    }
}