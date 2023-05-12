import { GraphdbService, iri } from "@/services/graphdb.service";
import { IM, RDFS } from "@im-library/vocabulary";

export default class EntityRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.imRepo();
  }

  public async getConceptContextMaps(conceptIri: string): Promise<any[]> {
    const rs = await this.graph.execute(
      "select ?publisherName ?systemName ?schema ?table ?field ?sourceVal ?sourceRegex ?map\n" +
      "where { \n" +
      "    ?map ?imConcept ?concept .\n" +
      "    ?context ?imHasMap ?map ;\n" +
      "        ?rdfsLabel ?node ;\n" +
      "        ?imSourcePublisher ?publisher .\n" +
      "    ?publisher ?rdfsLabel ?publisherName .\n" +
      "    OPTIONAL { ?context ?imSourceSystem ?system . ?system ?rdfsLabel ?systemName }\n" +
      "    OPTIONAL { ?context ?imSourceSchema ?schema }\n" +
      "    OPTIONAL { ?context ?imSourceTable ?table }\n" +
      "    OPTIONAL { ?context ?imSourceField ?field }\n" +
      "    ?map ?imSourceValue ?sourceVal .\n" +
      "    OPTIONAL { ?map ?imSourceRegex ?sourceRegex }\n" +
      "}",
      {
        concept: iri(conceptIri),
        imConcept: iri(IM.CONCEPT),
        imHasMap: iri(IM.HAS_MAP),
        rdfsLabel: iri(RDFS.LABEL),
        imSourcePublisher: iri(IM.SOURCE_PUBLISHER),
        imSourceSystem: iri(IM.SOURCE_SYSTEM),
        imSourceSchema: iri(IM.SOURCE_SCHEMA),
        imSourceTable: iri(IM.SOURCE_TABLE),
        imSourceField: iri(IM.SOURCE_FIELD),
        imSourceValue: iri(IM.SOURCE_VALUE),
        imSourceRegex: iri(IM.SOURCE_REGEX)
      }
    );



    return rs.map(cm => ({
      publisher: cm.publisherName?.value,
      system: cm.systemName?.value,
      schema: cm.schema?.value,
      table: cm.table?.value,
      field: cm.field?.value,
      value: cm.sourceVal?.value,
      regex: cm.sourceRegex?.value
    }));
  }
}
