import { Ref, ref } from "vue";
import axios from "axios";
import { Helpers, Services, Vocabulary } from "im-library";
import { DefinitionConfig, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
const { IM, RDFS } = Vocabulary;
const { ConfigService, EntityService, LoggerService } = Services;
const {
  DataTypeCheckers: { isObjectHasKeys },
  Sorters: { byOrder }
} = Helpers;

const entityService = new EntityService(axios);
const configService = new ConfigService(axios);

export function setupConcept() {
  const concept: Ref<any> = ref({});

  async function getConcept(iri: string, configs: Ref<DefinitionConfig[]>) {
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

    concept.value = await entityService.getPartialEntity(iri, predicates);

    concept.value["@id"] = iri;
    const result = await entityService.getPagedChildren(iri, 1, 10);
    const subtypes = result.result.map((child: EntityReferenceNode) => {
      return { "@id": child["@id"], name: child.name };
    });
    concept.value["subtypes"] = { children: subtypes, totalCount: result.totalCount, loadMore: loadMore };
    concept.value["termCodes"] = await entityService.getEntityTermCodes(iri);
  }
  return { concept, getConcept };
}

export async function loadMore(children: any[], totalCount: number, nextPage: number, pageSize: number, loadButton: boolean, iri: string) {
  if (loadButton) {
    if (nextPage * pageSize < totalCount) {
      const result = await entityService.getPagedChildren(iri, nextPage, pageSize);
      const resultChildren = result.result.map((child: EntityReferenceNode) => {
        return { "@id": child["@id"], name: child.name };
      });
      children = children.concat(resultChildren);
      nextPage = nextPage + 1;
      loadButton = true;
    } else if (nextPage * pageSize > totalCount) {
      const result = await entityService.getPagedChildren(iri, nextPage, pageSize);
      const resultChildren = result.result.map((child: EntityReferenceNode) => {
        return { "@id": child["@id"], name: child.name };
      });
      children = children.concat(resultChildren);
      loadButton = false;
    } else {
      loadButton = false;
    }
  }
  return { children: children, totalCount: totalCount, nextPage: nextPage, pageSize: pageSize, loadButton: loadButton, iri: iri };
}

export function setupConfig() {
  const configs: Ref<DefinitionConfig[]> = ref([]);

  async function getConfig(): Promise<void> {
    const definitionConfig = await configService.getComponentLayout("definition");
    const summaryConfig = await configService.getComponentLayout("summary");
    configs.value = definitionConfig.concat(summaryConfig);

    if (configs.value.every(config => isObjectHasKeys(config, ["order"]))) {
      configs.value.sort(byOrder);
    } else {
      LoggerService.error(undefined, "Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
    }
  }

  return { configs, getConfig };
}

export async function getInferred(iri: string, concept: Ref<any>): Promise<void> {
  const result = await entityService.getDefinitionBundle(iri);
  if (isObjectHasKeys(result, ["entity"]) && isObjectHasKeys(result.entity, [RDFS.SUBCLASS_OF, IM.ROLE_GROUP])) {
    const roleGroup = result.entity[IM.ROLE_GROUP];
    delete result.entity[IM.ROLE_GROUP];
    const newRoleGroup: any = {};
    newRoleGroup[IM.ROLE_GROUP] = roleGroup;
    result.entity[RDFS.SUBCLASS_OF].push(newRoleGroup);
  }
  concept.value["inferred"] = result;
}

export function setupTerms() {
  const terms: Ref<any[] | undefined> = ref([]);
  async function getTerms(iri: string) {
    const entity = await entityService.getPartialEntity(iri, [IM.HAS_TERM_CODE]);
    terms.value = isObjectHasKeys(entity, [IM.HAS_TERM_CODE])
      ? (entity[IM.HAS_TERM_CODE] as []).map(term => {
          return { name: term[RDFS.LABEL], code: term[IM.CODE] };
        })
      : undefined;
  }
  return { terms, getTerms };
}
