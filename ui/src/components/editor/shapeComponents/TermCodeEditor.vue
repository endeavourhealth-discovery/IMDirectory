<template>
  <div class="term-code-editor">
    <label v-if="shape.showTitle">{{ shape.name }}</label>
    <div class="term-code-editor-container" :class="invalid && showValidation && 'invalid'">
      <div class="name-container">
        <label for="term-name">Name</label>
        <InputText class="p-inputtext-md input-text term-name" v-model="name" type="text" />
      </div>
      <div class="code-container">
        <label for="term-code">Code</label>
        <InputText class="input-text term-code" v-model="code" type="text" />
      </div>
      <div class="status-container">
        <label for="term-status">Status</label>
        <Dropdown class="dropdown term-status" v-model="status" :options="statusOptions" optionLabel="name" />
      </div>
    </div>
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
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
  position: number;
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
      if (props.shape.builderChild) {
        isValidTermCode();
      } else {
        await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path["@id"], invalid, validationErrorMessage);
        if (updateValidationCheckStatus) updateValidationCheckStatus(props.shape.path["@id"]);
      }
      showValidation.value = true;
    }
  });
}

if (valueVariableMap) {
  watch(
    () => _.cloneDeep(valueVariableMap),
    async () => {
      if (updateValidity) {
        if (props.shape.builderChild) {
          isValidTermCode();
        } else {
          await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path["@id"], invalid, validationErrorMessage);
        }
        showValidation.value = true;
      }
    }
  );
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
  updateEntity();
  if (updateValidity) {
    if (props.shape.builderChild) {
      isValidTermCode();
    } else {
      await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path["@id"], invalid, validationErrorMessage);
    }
    showValidation.value = true;
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

function isValidTermCode() {
  invalid.value = false;
  validationErrorMessage.value = "";
  if (props.shape.minCount === 0 && !name.value && !code.value && !status.value) return;
  if (!name.value) {
    invalid.value = true;
    validationErrorMessage.value += "Missing name. ";
  }
  if (!code.value) {
    invalid.value = true;
    validationErrorMessage.value += "Missing code. ";
  }
  if (statusOptions.value.findIndex(so => so["@id"] === status.value?.["@id"]) === -1) {
    invalid.value = true;
    validationErrorMessage.value += "Missing status. ";
  }
  if (validationErrorMessage.value === "") validationErrorMessage.value = undefined;
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

.invalid {
  border: solid 1px var(--red-500);
  padding: 0.25rem;
  border-radius: 5px;
}

.validate-error {
  color: var(--red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}
</style>