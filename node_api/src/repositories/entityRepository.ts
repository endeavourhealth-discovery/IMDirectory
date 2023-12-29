import { GraphdbService, sanitise } from "@/services/graphdb.service";
import { IM, RDFS } from "@im-library/vocabulary";
import { ContextMap } from "@im-library/interfaces";
import { v4 } from "uuid";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

export default class EntityRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.imRepo();
  }

  public async getInverseIsas(iri: string, searchTerm?: string) {
    let rs;
    if (!searchTerm) {
      rs = await this.graph.execute("select ?s ?name \n where { \n ?s ?isa ?o ; \n ?label ?name . \n } \n order by ?name", {
        o: sanitise(iri),
        isa: sanitise(IM.IS_A),
        label: sanitise(RDFS.LABEL)
      });
    } else {
      rs = await this.graph.execute("select ?s ?name \n where { \n ?s ?isa ?o ; \n ?label ?name . \n } \n order by ?name", {
        o: sanitise(iri),
        isa: sanitise(IM.IS_A),
        label: sanitise(RDFS.LABEL),
        name: sanitise(searchTerm)
      });
    }

    const result: any[] = [];

    for (const r of rs) {
      result.push({ "@id": r.s.value, name: r.name.value } as TTIriRef);
    }
    return result;
  }

  public async getConceptContextMaps(conceptIri: string): Promise<ContextMap[]> {
    const rs = await this.graph.execute(
      "select ?nodeName ?sourceVal ?sourceRegex ?propertyName ?publisherName ?systemName ?schema ?table ?field\n" +
        "where { \n" +
        "    ?map ?imConcept ?concept .\n" +
        "    ?node ?imHasMap ?map ;\n" +
        "          ?imTargetProperty ?property ;\n" +
        "          ?rdfsLabel ?nodeName .\n" +
        "    ?property ?rdfsLabel ?propertyName .\n" +
        "    ?context ?imContextNode ?node ;\n" +
        "        ?imSourcePublisher ?publisher .\n" +
        "    ?publisher rdfs:label ?publisherName .\n" +
        "    OPTIONAL { ?context ?imSourceSystem ?system . ?system ?rdfsLabel ?systemName }\n" +
        "    OPTIONAL { ?context ?imSourceSchema ?schema }\n" +
        "    OPTIONAL { ?context ?imSourceTable ?table }\n" +
        "    OPTIONAL { ?context ?imSourceField ?field }\n" +
        "    ?map ?imSourceValue ?sourceVal .\n" +
        "    OPTIONAL { ?map ?imSourceRegex ?sourceRegex }\n" +
        "}\n" +
        "ORDER BY ?nodeName ?sourceVal ?publisherName",
      {
        concept: sanitise(conceptIri),
        imConcept: sanitise(IM.CONCEPT),
        imHasMap: sanitise(IM.HAS_MAP),
        rdfsLabel: sanitise(RDFS.LABEL),
        imContextNode: sanitise(IM.CONTEXT_NODE),
        imTargetProperty: sanitise(IM.TARGET_PROPERTY),
        imSourcePublisher: sanitise(IM.SOURCE_PUBLISHER),
        imSourceSystem: sanitise(IM.SOURCE_SYSTEM),
        imSourceSchema: sanitise(IM.SOURCE_SCHEMA),
        imSourceTable: sanitise(IM.SOURCE_TABLE),
        imSourceField: sanitise(IM.SOURCE_FIELD),
        imSourceValue: sanitise(IM.SOURCE_VALUE),
        imSourceRegex: sanitise(IM.SOURCE_REGEX)
      }
    );

    const result: ContextMap[] = [];
    let map: ContextMap = {} as ContextMap;

    for (const r of rs) {
      if (r.nodeName?.value !== map?.node || r.sourceVal?.value !== map?.value || r.sourceRegex?.value !== map?.regex) {
        map = {
          id: v4(),
          node: r.nodeName?.value,
          value: r.sourceVal?.value,
          regex: r.sourceRegex?.value,
          property: r.propertyName?.value,
          context: []
        };
        result.push(map);
      }

      map.context.push({
        publisher: r.publisherName?.value,
        system: r.systemName?.value,
        schema: r.schema?.value,
        table: r.table?.value,
        field: r.field?.value
      });
    }

    return result;
  }
}
