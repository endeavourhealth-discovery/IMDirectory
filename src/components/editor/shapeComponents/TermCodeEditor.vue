<template>
  <div class="term-code-editor">
    <div class="title-bar">
      <span v-if="shape.showTitle">{{ shape.name }}</span>
      <span v-if="showRequired" class="required">*</span>
    </div>
    <div class="term-code-editor-container" :class="invalid && showValidation && 'invalid'">
      <div class="name-container">
        <InputText class="p-inputtext-md input-text term-name" v-model="name" type="text" placeholder="Name" />
      </div>
      <div class="code-container">
        <InputText class="input-text term-code" v-model="code" type="text" placeholder="Code" />
      </div>
      <div class="status-container">
        <Select class="dropdown term-status" v-model="status" :options="statusOptions" optionLabel="name" placeholder="Status" />
      </div>
    </div>
    <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { ComputedRef, Ref, computed, inject, onMounted, ref, watch } from "vue";
import { EditorMode } from "@/enums";
import { PropertyShape, TTIriRef } from "@/interfaces/AutoGen";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { IM, RDFS } from "@/vocabulary";
import { useFilterStore } from "@/stores/filterStore";
import { cloneDeep } from "lodash-es";

const props = defineProps<{
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
  position: number;
}>();

const emit = defineEmits<{
  updateClicked: [payload: any];
}>();
watch(
  () => cloneDeep(props.value),
  (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) processProps();
  }
);

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)!.valueVariableMap;
const valueVariableHasChanged = inject(injectionKeys.valueVariableMap)?.valueVariableHasChanged;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
if (forceValidation) {
  watch(forceValidation, async () => {
    codeComplete.value = true;
    validationDone.value = true;
    if (updateValidity) {
      if (props.shape.builderChild) {
        isValidTermCode();
      } else {
        await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path.iri, invalid, validationErrorMessage);
        if (updateValidationCheckStatus) updateValidationCheckStatus(props.shape.path.iri);
      }
      showValidation.value = true;
    }
  });
}

if (props.shape.argument?.some(arg => arg.valueVariable) && valueVariableMap) {
  watch(
    () => cloneDeep(valueVariableMap),
    async (newValue, oldValue) => {
      if (valueVariableHasChanged && valueVariableHasChanged(props.shape, oldValue, newValue)) {
        if (updateValidity) {
          if (props.shape.builderChild) {
            isValidTermCode();
          } else {
            await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path.iri, invalid, validationErrorMessage);
          }
          showValidation.value = true;
        }
      }
    }
  );
}

const filterStore = useFilterStore();
const statusOptions = computed(() => filterStore.filterOptions.status);

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const name = ref("");
const code = ref("");
const status: Ref<TTIriRef | undefined> = ref();
const codeComplete = ref(false);
const validationDone = ref(false);

watch(props, () => {
  if (props.value === undefined) {
    name.value = "";
    status.value = undefined;
    code.value = "";
  }
});

watch([name, code, status], async () => {
  if ((name.value.length > 0 && code.value.length > 0 && status.value) || validationDone.value) {
    codeComplete.value = true;
  }
  updateEntity();
  if (updateValidity) {
    if (props.shape.builderChild) {
      isValidTermCode();
    } else {
      await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path.iri, invalid, validationErrorMessage);
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
    if (
      isObjectHasKeys(props.value, [IM.HAS_STATUS]) &&
      isArrayHasLength(props.value[IM.HAS_STATUS]) &&
      isObjectHasKeys(props.value[IM.HAS_STATUS][0], ["iri"])
    ) {
      if (statusOptions.value.findIndex(so => so.iri === props.value[IM.HAS_STATUS][0].iri) != -1) status.value = props.value[IM.HAS_STATUS][0];
    }
    if (isObjectHasKeys(props.value, [RDFS.LABEL])) name.value = props.value[RDFS.LABEL];
  }
}

function isValidTermCode() {
  invalid.value = false;
  validationErrorMessage.value = "";
  if (props.shape.builderChild && props.position === 0 && !name.value && !code.value && !status.value) {
    return;
  }
  if (props.shape.minCount === 0 && !name.value && !code.value && !status.value) return;
  if (codeComplete.value) {
    if (!name.value) {
      invalid.value = true;
      validationErrorMessage.value += "Missing name. ";
    }
    if (!code.value) {
      invalid.value = true;
      validationErrorMessage.value += "Missing code. ";
    }
    if (statusOptions.value.findIndex(so => so.iri === status.value?.iri) === -1) {
      invalid.value = true;
      validationErrorMessage.value += "Missing status. ";
    }
    if (validationErrorMessage.value === "") validationErrorMessage.value = undefined;
  }
}

function updateEntity() {
  if (entityUpdate) {
    const newTermCode = {} as any;
    if (!name.value.length && !code.value.length && !status.value && deleteEntityKey) {
      deleteEntityKey(IM.HAS_TERM_CODE);
      codeComplete.value = false;
    } else {
      newTermCode[IM.CODE] = code.value;
      newTermCode[IM.HAS_STATUS] = [status.value];
      newTermCode[RDFS.LABEL] = name.value;
    }

    const result = {} as any;
    result[props.shape.path.iri] = newTermCode;
    if (!code.value && !status.value && !name.value && !props.shape.builderChild && deleteEntityKey) deleteEntityKey(props.shape.path.iri);
    else if (entityUpdate && !props.shape.builderChild) entityUpdate(result);
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
  height: 2.7rem;
}

.invalid {
  border: solid 1px var(--p-red-500);
  padding: 0.25rem;
  border-radius: 5px;
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.title-bar {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.25rem;
}

.required {
  color: var(--p-red-500);
}

.dropdown {
  height: 2.7rem;
}
</style>
