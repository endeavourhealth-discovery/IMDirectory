import { computed, Ref, ref } from "vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { EntityService } from "@/services";
import { useEditorStore } from "@/stores/editorStore";

export function setupEditorEntity() {
  const editorStore = useEditorStore();
  let editorEntityOriginal: Ref<any> = ref({});
  let editorEntity: Ref<any> = ref({});
  let entityName = ref("");

  const editorIri = computed(() => editorStore.editorIri).value;
  const editorSavedEntity = computed(() => editorStore.editorSavedEntity).value;
  const hasType = computed<boolean>(() => {
    return isObjectHasKeys(editorEntity.value, [RDF.TYPE]) && isArrayHasLength(editorEntity.value[RDF.TYPE]);
  });

  async function fetchEntity(): Promise<void> {
    if (editorIri) {
      if (isObjectHasKeys(editorSavedEntity, ["@id"]) && editorSavedEntity[IM.ID] === editorIri) {
        editorEntity.value = editorSavedEntity;
        return;
      }
      const fullEntity = await EntityService.getFullEntity(editorIri);
      if (isObjectHasKeys(fullEntity)) {
        const processedEntity = processEntity(fullEntity);
        editorEntityOriginal.value = processedEntity;
        editorEntity.value = { ...editorEntityOriginal.value };
        entityName.value = editorEntityOriginal.value[RDFS.LABEL];
      }
    }
  }

  function processEntity(entity: any) {
    const result = { ...entity } as any;
    if (isObjectHasKeys(result, ["@id"])) {
      result[IM.ID] = result["@id"];
      delete result["@id"];
    }
    if (isObjectHasKeys(result, [IM.IM_1_ID])) delete result[IM.IM_1_ID];
    if (isObjectHasKeys(result, [IM.IM_1_SCHEME])) delete result[IM.IM_1_SCHEME];
    return result;
  }

  return { editorEntity, editorEntityOriginal, fetchEntity, processEntity, editorIri, editorSavedEntity, entityName, hasType };
}
