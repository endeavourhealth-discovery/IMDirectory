import { GraphdbService, iri } from "@/services/graphdb.service";
import { IM, RDFS } from "@im-library/vocabulary";
import { ContextMap } from "@im-library/interfaces";
import { v4 } from "uuid";

export default class EntityRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.imRepo();
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
        concept: iri(conceptIri),
        imConcept: iri(IM.CONCEPT),
        imHasMap: iri(IM.HAS_MAP),
        rdfsLabel: iri(RDFS.LABEL),
        imContextNode: iri(IM.CONTEXT_NODE),
        imTargetProperty: iri(IM.TARGET_PROPERTY),
        imSourcePublisher: iri(IM.SOURCE_PUBLISHER),
        imSourceSystem: iri(IM.SOURCE_SYSTEM),
        imSourceSchema: iri(IM.SOURCE_SCHEMA),
        imSourceTable: iri(IM.SOURCE_TABLE),
        imSourceField: iri(IM.SOURCE_FIELD),
        imSourceValue: iri(IM.SOURCE_VALUE),
        imSourceRegex: iri(IM.SOURCE_REGEX)
      }
    );

    const result: ContextMap[] = [];
    let map: ContextMap = { } as ContextMap;

    for(const r of rs) {
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
