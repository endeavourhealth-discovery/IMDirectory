import {GraphdbService, iri} from "@/services/graphdb.service";

export default class EntityRepository {

    private graph: GraphdbService;

    constructor() {
        this.graph = new GraphdbService();
    }

    public async getPropertyType(modelIri: string,propIri: string): Promise<any> {
        const qry =
            "PREFIX sh:" + iri("http://www.w3.org/ns/shacl#") +
            "select distinct ?type ?tname where {" +
            "?modelIri sh:property ?o ." +
            "?o sh:path ?property ." +
            "?o (sh:class|sh:node|sh:datatype) ?type ." +
            "?type rdfs:label ?tname ." +
            "filter (?property in(?propIri))" +
            "}";

        return await this.graph.execute(qry, {
            modelIri: iri(modelIri),
            propIri: iri(propIri)
        });
    }

    public async getPropertyRange(propIri: string): Promise<any> {
        const qry =
            "PREFIX im:" + iri("http://endhealth.info/im#") +
            "PREFIX rdfs:" + iri("http://www.w3.org/2000/01/rdf-schema#") +
            "SELECT DISTINCT ?type ?name ?objectProperty ?dataProperty WHERE {" +
            "OPTIONAL {?propIri rdfs:range ?type ." +
            "          ?type rdfs:label ?name .}" +
            "BIND( EXISTS{ ?propIri im:isA  im:dataModelObjectProperty} as ?objectProperty)" +
            "BIND( EXISTS{ ?propIri im:isA  im:dataModelDataProperty} as ?dataProperty)" +
            "}";

        return await this.graph.execute(qry, {
            propIri: iri(propIri)
        });
    }

    public async getDataTypes(): Promise<any> {
        const qry =
            "PREFIX sh:" + iri("http://www.w3.org/ns/shacl#") +
            "PREFIX rdfs:" + iri("http://www.w3.org/2000/01/rdf-schema#") +
            "SELECT DISTINCT ?datatype ?datatypeName WHERE {" +
            "?s sh:datatype ?datatype ." +
            "OPTIONAL{?datatype rdfs:label ?datatypeName .}" +
            "}";

        return await this.graph.execute(qry);
    }

    public  async getRangeSuggestionsForObjectProperty(propIri: string) {
        const qry =
            "PREFIX sh:" + iri("http://www.w3.org/ns/shacl#") +
            "select distinct ?type ?name where {" +
            "?o sh:path ?property ;" +
            "   (sh:class|sh:node|sh:datatype) ?type ." +
            "?type rdfs:label ?name ." +
            "filter (?property in(?propIri))" +
            "}";

        return await this.graph.execute(qry, {
            propIri: iri(propIri)
        });

    }
}