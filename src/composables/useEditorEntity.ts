import { Ref, computed, ref } from "vue";

import { IM, RDF, RDFS, SHACL } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isArrayOf, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import { type TTEntity, TTEntitySchema, type TTIriRef, isTTIriRef } from "@endeavour/vue-library/models";

import { isEqual } from "lodash-es";

import { EditorMode } from "@/enums";
import { EntityService } from "@/services";
import { useCreatorStore } from "@/stores/creatorStore";
import { useEditorStore } from "@/stores/editorStore";

export function useEditorEntity(mode: EditorMode, updateType: (types: TTIriRef[]) => void) {
  const editorStore = useEditorStore();
  const creatorStore = useCreatorStore();
  const editorEntityOriginal: Ref<TTEntity> = ref({} as TTEntity);
  const editorEntity: Ref<TTEntity> = ref({} as TTEntity);
  const entityName = ref("");

  const editorIri = computed(() => editorStore.editorIri).value;
  const editorSavedEntity = computed(() => editorStore.editorSavedEntity).value;
  const hasType = computed<boolean>(() => {
    return isObjectHasKeys(editorEntity.value, [RDF.TYPE]) && isArrayHasLength(editorEntity.value[RDF.TYPE]);
  });

  async function fetchEntity(): Promise<void> {
    if (mode === EditorMode.EDIT && editorIri) {
      if (editorSavedEntity && isObjectHasKeys(editorSavedEntity, ["iri"]) && editorSavedEntity[IM.ID] === editorIri) {
        editorEntity.value = editorSavedEntity;
        return;
      }
      const entityTypes = await EntityService.getEntityTypes(editorIri);
      let fullEntity = null;
      if (entityTypes.includes(IM.CONCEPT_SET) || entityTypes.includes(IM.VALUESET)) {
        fullEntity = await EntityService.getEntityByPredicateExclusions(editorIri, [IM.HAS_MEMBER]);
      } else fullEntity = await EntityService.getFullEntity(editorIri, true);
      if (isObjectHasKeys(fullEntity)) {
        const processedEntity = processEntity(fullEntity);
        editorEntityOriginal.value = processedEntity;
        editorEntity.value = { ...editorEntityOriginal.value };
        if (typeof editorEntityOriginal.value[RDFS.LABEL] === "string") {
          entityName.value = editorEntityOriginal.value[RDFS.LABEL];
        }
      }
    }
  }

  function processEntity(entity: any) {
    const result = { ...entity };
    if (result?.iri) {
      result[IM.ID] = result.iri;
      delete result.iri;
    }
    return result;
  }

  function findPrimaryType(): TTIriRef | undefined {
    if (!(isObjectHasKeys(editorEntity.value, [RDF.TYPE]) && isArrayOf(editorEntity.value[RDF.TYPE], isTTIriRef))) return undefined;
    if (
      isObjectHasKeys(editorEntityOriginal.value, [RDF.TYPE]) &&
      isArrayOf(editorEntityOriginal.value[RDF.TYPE], isTTIriRef) &&
      editorEntityOriginal.value[RDF.TYPE].length === 1
    ) {
      const originalType = editorEntityOriginal.value[RDF.TYPE][0];
      const found = editorEntity.value[RDF.TYPE].find((type: TTIriRef) => type === originalType);
      if (found) return found;
    }
    if (editorEntity.value[RDF.TYPE].length === 1) return editorEntity.value[RDF.TYPE][0];
    if (editorEntity.value[RDF.TYPE].findIndex((type: TTIriRef) => type.iri === SHACL.NODESHAPE) !== -1) {
      const found = editorEntity.value[RDF.TYPE].find((type: TTIriRef) => type.iri === SHACL.NODESHAPE);
      if (found) return found;
    }
    return editorEntity.value[RDF.TYPE][0];
  }

  function updateEntity(data: any) {
    let wasUpdated = false;
    if (isArrayHasLength(data)) {
      wasUpdated = updateArrayEntity(data);
    } else if (isObjectHasKeys(data)) {
      wasUpdated = updateObjectEntity(data);
    }
    if (wasUpdated) {
      if (mode === EditorMode.CREATE) creatorStore.updateCreatorSavedEntity(editorEntity.value);
      else editorStore.updateEditorSavedEntity(editorEntity.value);
    }
  }

  function updateArrayEntity(data: any[]): boolean {
    let wasUpdated = false;
    data.forEach((item: any) => {
      if (isObjectHasKeys(item)) {
        for (const [key, value] of Object.entries(item)) {
          editorEntity.value[key] = value;
          wasUpdated = true;
        }
      }
    });
    return wasUpdated;
  }

  function updateObjectEntity(data: any): boolean {
    let wasUpdated = false;
    if (isObjectHasKeys(data, [RDF.TYPE]) && isArrayOf(data[RDF.TYPE], isTTIriRef)) {
      if (!isObjectHasKeys(editorEntity.value, [RDF.TYPE]) || JSON.stringify(editorEntity.value[RDF.TYPE]) !== JSON.stringify(data[RDF.TYPE])) {
        updateType(data[RDF.TYPE]);
        wasUpdated = true;
      }
    } else {
      for (const [key, value] of Object.entries(data)) {
        editorEntity.value[key] = value;
        wasUpdated = true;
      }
    }
    return wasUpdated;
  }

  function deleteEntityKey(data: string) {
    if (data) delete editorEntity.value[data];
  }

  function checkForChanges() {
    if (isEqual(editorEntity.value, editorEntityOriginal.value)) {
      if (mode === EditorMode.CREATE) creatorStore.updateCreatorHasChanges(false);
      if (mode === EditorMode.EDIT) editorStore.updateEditorHasChanges(false);
      return false;
    } else {
      if (mode === EditorMode.CREATE) creatorStore.updateCreatorHasChanges(true);
      if (mode === EditorMode.EDIT) editorStore.updateEditorHasChanges(true);
      return true;
    }
  }

  return {
    editorEntity,
    editorEntityOriginal,
    fetchEntity,
    processEntity,
    editorIri,
    editorSavedEntity,
    entityName,
    hasType,
    findPrimaryType,
    updateEntity,
    deleteEntityKey,
    checkForChanges
  };
}
