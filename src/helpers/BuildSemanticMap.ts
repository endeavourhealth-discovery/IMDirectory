import { IM, RDFS } from "@endeavour/vue-library/enums";
import { TTEntity, TTIriRef } from "@endeavour/vue-library/models";

import { type SemanticMapEntry } from "@/models";
import { DataModelService } from "@/services";

export async function getTypePropertyOptions(iri: string): Promise<TTIriRef[]> {
  const shape = await DataModelService.getDataModelProperties(iri);
  const options = [];

  if (shape.property) {
    shape.property.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    for (const property of shape.property) {
      options.push({ iri: property.path.iri, name: property.path.name });
    }
  }

  return options;
}
export function buildLinkedEntities(entries: SemanticMapEntry[], editorEntity: TTEntity, linkedEntities: TTEntity[]) {
  const entryIris = [];
  if (entries.length === 0) {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      linkedEntities.push({
        iri: entry.iri,
        [RDFS.LABEL]: editorEntity[RDFS.LABEL] + " - " + entry.targetText + "- " + i,
        [IM.SOURCE_ENTITY]: entry.sourceEntity,
        [IM.RANGE_FROM]: entry.rangeFrom,
        [IM.RANGE_TO]: entry.rangeTo,
        [IM.TARGET_TEXT]: entry.targetText,
        [IM.TARGET_VALUE]: entry.targetValue
      });
      entryIris.push({
        iri: entry.iri,
        name: entry.name
      } as TTIriRef);
    }
    editorEntity[IM.HAS_ENTRY] = entryIris;
  }
}

export function buildSemanticMapsFromEntities(linkedEntities: TTEntity[]): SemanticMapEntry[] {
  const entries: SemanticMapEntry[] = [];
  if (linkedEntities.length > 0) {
    for (const linkedEntity of linkedEntities) {
      entries.push({
        iri: linkedEntity.iri,
        name: linkedEntity.name,
        sourceEntity: linkedEntity[IM.SOURCE_ENTITY],
        sourceEntityProperty: linkedEntity[IM.SOURCE_ENTITY_PROPERTY],
        sourceValueProperty: linkedEntity[IM.SOURCE_VALUE_PROPERTY],
        rangeFrom: linkedEntity[IM.RANGE_FROM],
        rangeTo: linkedEntity[IM.RANGE_TO],
        targetText: linkedEntity[IM.TARGET_TEXT],
        targetValue: linkedEntity[IM.TARGET_VALUE]
      } as SemanticMapEntry);
    }
  }
  return entries;
}
