import { computed, Ref, ref } from "vue";
import { FormGenerator, PropertyGroup, TTIriRef } from "@im-library/interfaces";
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { EntityService } from "@/services";
import StepsGroup from "@/components/editor/StepsGroup.vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

export function setupEditorEntity() {
  const store = useStore();
  let editorEntityOriginal: Ref<any> = ref({});
  let editorEntity: Ref<any> = ref({});
  let entityName = ref("");

  const editorIri = computed(() => store.state.editorIri).value;
  const editorSavedEntity = computed(() => store.state.editorSavedEntity).value;
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
