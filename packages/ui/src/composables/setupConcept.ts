import { DefinitionConfig, EntityReferenceNode } from "im-library/interfaces";
import { EntityService } from "@/services";
import { IM } from "im-library/vocabulary";
import { ref, Ref } from "vue";

function setupConcept() {
  const concept: Ref<any> = ref({});

  async function getConcept(iri: string, configs: Ref<DefinitionConfig[]>, loadMore: Function) {
    const predicates = configs.value
      .filter((c: DefinitionConfig) => c.type !== "Divider")
      .filter((c: DefinitionConfig) => c.predicate !== "subtypes")
      .filter((c: DefinitionConfig) => c.predicate !== "inferred")
      .filter((c: DefinitionConfig) => c.predicate !== "termCodes")
      .filter((c: DefinitionConfig) => c.predicate !== "@id")
      .filter((c: DefinitionConfig) => c.predicate !== "None")
      .filter((c: DefinitionConfig) => c.predicate !== undefined)
      .map((c: DefinitionConfig) => c.predicate);
    predicates.push(IM.DEFINITION);

    concept.value = await EntityService.getPartialEntity(iri, predicates);

    concept.value["@id"] = iri;
    const result = await EntityService.getPagedChildren(iri, 1, 10);
    const subtypes = result.result.map((child: EntityReferenceNode) => {
      return { "@id": child["@id"], name: child.name };
    });
    concept.value["subtypes"] = { children: subtypes, totalCount: result.totalCount, loadMore: loadMore };
    concept.value["termCodes"] = await EntityService.getEntityTermCodes(iri);
  }
  return { concept, getConcept };
}

export default setupConcept;
