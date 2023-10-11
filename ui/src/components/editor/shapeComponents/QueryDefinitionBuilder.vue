<template>
  <div id="cohort-query-definition-editor">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else class="content-container" :class="showValidation && invalid && 'invalid'">
      <CohortEditor v-model:queryDefinition="queryDefinition" />
    </div>
    <span class="error-message" v-if="validationErrorMessage"> {{ validationErrorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import CohortEditor from "@/components/query/builder/CohortEditor.vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match, PropertyShape, Query } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { ComputedRef, Ref, computed, inject, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { cloneDeep } from "lodash";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}

const props = defineProps<Props>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}

const route = useRoute();
const loading = ref(true);
const queryDefinition: Ref<Query> = ref({ match: [] as Match[] } as Query);
const validationErrorMessage: Ref<string | undefined> = ref();
const invalid = ref(false);
const showValidation = ref(false);

const key = props.shape.path["@id"];

watch(
  () => cloneDeep(props.value),
  (newValue, oldValue) => {
    loading.value = true;
    if (newValue && newValue !== oldValue) queryDefinition.value = JSON.parse(props.value);
    loading.value = false;
  }
);

watch(
  () => cloneDeep(queryDefinition.value),
  async () => {
    updateEntity();
    if (updateValidity && valueVariableMap) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      showValidation.value = true;
    }
  }
);

onMounted(async () => {
  loading.value = true;
  init();
  loading.value = false;
});

function init() {
  if (props.value) queryDefinition.value = JSON.parse(props.value);
  else queryDefinition.value = generateDefaultQuery();
}

function generateDefaultQuery() {
  return { match: [] as Match[] } as Query;
}

function updateEntity() {
  if (!isArrayHasLength(queryDefinition.value.match) && deleteEntityKey) deleteEntityKey(key);
  else {
    const imDefinition: any = {};
    imDefinition[IM.DEFINITION] = JSON.stringify(cloneDeep(queryDefinition.value));
    if (entityUpdate) entityUpdate(imDefinition);
  }
}
</script>

<style>
#cohort-query-definition-editor {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column;
}

.invalid {
  border-color: var(--red-500);
}

.validate-error {
  color: var(--red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}
</style>
