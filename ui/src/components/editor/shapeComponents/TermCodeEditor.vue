<template>
  <div class="term-code-editor">
    <label v-if="shape.showTitle">{{ shape.name }}</label>
    <div class="term-code-editor-container">
      <div class="name-container">
        <label for="term-name">Name</label>
        <InputText class="p-inputtext-md input-text term-name" :class="invalid && showValidation && 'invalid'" v-model="name" type="text" />
      </div>
      <div class="code-container">
        <label for="term-code">Code</label>
        <InputText class="input-text term-code" :class="invalid && showValidation && 'invalid'" v-model="code" type="text" />
      </div>
      <div class="status-container">
        <label for="term-status">Status</label>
        <Dropdown class="dropdown term-status" v-model="status" :options="statusOptions" optionLabel="name" />
      </div>
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, inject, onMounted, ref, watch } from "vue";
import { EditorMode } from "@im-library/enums";
import { PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDFS } from "@im-library/vocabulary";
import { useFilterStore } from "@/stores/filterStore";
import _ from "lodash";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}

const emit = defineEmits({
  updateClicked: _payload => true
});
const props = defineProps<Props>();
watch(
  () => _.cloneDeep(props.value),
  (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) processProps();
  }
);

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path["@id"], invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(props.shape.path["@id"]);
      showValidation.value;
    }
  });
}

const filterStore = useFilterStore();
const statusOptions = computed(() => filterStore.filterOptions.status);

const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const name = ref("");
const code = ref("");
const status: Ref<TTIriRef | undefined> = ref();
watch([name, code, status], async ([newName, newCode, newStatus], [oldName, oldCode, oldStatus]) => {
  if (isValidTermCode()) {
    updateEntity();
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path["@id"], invalid, validationErrorMessage);
      showValidation.value = true;
    }
  }
});

onMounted(() => {
  processProps();
});

function processProps() {
  if (props.value) {
    if (isObjectHasKeys(props.value, [IM.CODE])) code.value = props.value[IM.CODE];
    if (isObjectHasKeys(props.value, [IM.HAS_STATUS]) && isArrayHasLength(props.value[IM.HAS_STATUS])) {
      if (statusOptions.value.findIndex(so => so["@id"] === props.value[IM.HAS_STATUS][0]["@id"]) != -1) status.value = props.value[IM.HAS_STATUS][0];
    }
    if (isObjectHasKeys(props.value, [RDFS.LABEL])) name.value = props.value[RDFS.LABEL];
  }
}

function isValidTermCode(): boolean {
  let valid = true;
  if (!name.value) valid = false;
  if (!code.value) valid = false;
  if (statusOptions.value.findIndex(so => so["@id"] === status.value?.["@id"]) === -1) valid = false;
  return valid;
}

function updateEntity() {
  if (entityUpdate) {
    const newTermCode = {} as any;
    newTermCode[IM.CODE] = code.value;
    newTermCode[IM.HAS_STATUS] = [status.value];
    newTermCode[RDFS.LABEL] = name.value;
    const result = {} as any;
    result[props.shape.path["@id"]] = newTermCode;
    if (entityUpdate && !props.shape.builderChild) entityUpdate(result);
    else emit("updateClicked", newTermCode);
  }
}
</script>

<style scoped>
.term-code-editor {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  height: fit-content;
}

.term-code-editor-container {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  gap: 0.5rem;
}

.name-container,
.code-container {
  flex: 1 1 auto;
}

.input-text {
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
