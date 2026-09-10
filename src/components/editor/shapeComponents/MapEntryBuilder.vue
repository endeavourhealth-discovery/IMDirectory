<template>
  <div id="cohort-query-definition-editor">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-if="!loading" :class="showValidation && invalid && 'invalid'" class="content-container">
      <div v-if="editorEntity[IM.ID]" id="editor-button-bar" class="button-bar">
        <Button data-testid="edit-button" icon="fa-solid fa-pen-to-square" label="Edit map entries" @click="showBuilder" />
      </div>
      <div v-else id="editor-button-bar" class="button-bar">
        <span>Entity must have an iri before editing semantic map.</span>
      </div>
      <div class="query-editor-container flex flex-col gap-4">
        <div class="query-editor flex flex-col p-2">
          <SemanticMapContentDisplay :mapEntries="mapEntries" :semanticMap="semanticMap" />
        </div>
      </div>
    </div>

    <div class="validate-error-container"></div>
    <span v-if="validationErrorMessage && showValidation" class="validate-error"> {{ validationErrorMessage }}</span>
    <div v-if="!loading">
      <MapEntryEditor
        v-if="showEditor && editorEntity[IM.ID]"
        :originalEntries="mapEntries"
        :shape="shape"
        :showEditor="showEditor"
        @cancel="cancelEditor"
        @closeDialog="cancelEditor"
        @updateEntity="updateEntity"
        @save-changes="updateEntity"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, inject, onMounted, ref, watch } from "vue";

import { IM } from "@endeavour/vue-library/enums";
import { type PropertyShape, type TTEntity } from "@endeavour/vue-library/models";

import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

import MapEntryEditor from "@/components/editor/shapeComponents/MapEntryEditor.vue";
import SemanticMapContentDisplay from "@/components/editor/shapeComponents/SemanticMapContentDisplay.vue";
import { EditorMode } from "@/enums";
import { buildLinkedEntities } from "@/helpers/BuildSemanticMap";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { type SemanticMap, type SemanticMapEntry } from "@/models";
import { DataModelService } from "@/services";

interface Props {
  mode: EditorMode;
  shape: PropertyShape;
  value?: any;
}

const props = defineProps<Props>();

const iri = "http://endhealth.info/im#CohortDefinition";
const showEditor = ref(false);
const emit = defineEmits<{
  (event: "onCancel"): void;
}>();
const linkedEntities = inject("linkedEntities") as Ref<TTEntity[]>;
const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const valueVariableMap = inject(injectionKeys.valueVariableMap)!.valueVariableMap;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}
const loading = ref(true);
const validationErrorMessage: Ref<string | undefined> = ref();
const invalid = ref(false);
const showValidation = ref(false);

const key = props.shape.path.iri;
const semanticMap: Ref<SemanticMap> = ref({ iri: editorEntity.value[IM.ID] as string, entries: [] } as SemanticMap);
const mapEntries: Ref<SemanticMapEntry[]> = ref([]);

onMounted(async () => {
  loading.value = true;
  await init();
  loading.value = false;
});

function cancelEditor() {
  showEditor.value = false;
}

async function init() {
  if (editorEntity.value[IM.ID]) {
    if (linkedEntities.value.length == 0) {
      semanticMap.value = await DataModelService.getSemanticMap(editorEntity.value[IM.ID] as string);
      if (semanticMap.value.entries) mapEntries.value = semanticMap.value.entries;
    }
  }
}

function showBuilder(): void {
  showEditor.value = true;
}

function updateEntity(entries: SemanticMapEntry[]) {
  mapEntries.value = entries;
  linkedEntities.value = [];
  buildLinkedEntities(mapEntries.value, editorEntity.value, linkedEntities.value);
  showEditor.value = false;
}
</script>

<style scoped>
.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.query-editor-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}

.query-editor {
  overflow-y: auto;
  border: 1px solid;
  background-color: var(--p-default);
  border-radius: var(--p-content-border-radius);
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.validate-error-container {
  width: 100%;
}

.button-bar {
  flex: 0 1 auto;
  padding: 1rem 1rem 1rem 0;
  gap: 0.5rem;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}
</style>
