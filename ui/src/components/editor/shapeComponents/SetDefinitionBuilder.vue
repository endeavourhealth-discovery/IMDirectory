<template>
  <div class="set-definition-container">
    <div class="ecl-container">
      <div class="text-copy-container">
        <Textarea v-model="ecl" id="ecl-string-container" placeholder="Enter ECL text here..." :class="eclError ? 'p-invalid' : ''" data-testid="ecl-string" />
      </div>
      <div class="button-container">
        <Button :disabled="eclError" label="ECL builder" @click="showBuilder" class="p-button-help" data-testid="builder-button" />
        <Button
          icon="fa-solid fa-copy"
          label="Copy to clipboard"
          v-clipboard:copy="copyToClipboard()"
          v-clipboard:success="onCopy"
          v-clipboard:error="onCopyError"
          data-testid="copy-to-clipboard-button"
        />
      </div>
    </div>
    <span class="error-message" v-if="eclError">{{ eclErrorMessage }}</span>
  </div>
  <Builder
    :showDialog="showDialog"
    :eclString="ecl"
    @eclSubmitted="updateECL"
    @closeDialog="$event => (showDialog = false)"
    @eclConversionError="updateError"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch, Ref, PropType, inject } from "vue";
import "vue-json-pretty/lib/styles.css";
import Builder from "@/components/directory/topbar/eclSearch/Builder.vue";
import SetDefinitionECL from "./setDefinition/SetDefinitionECL.vue";
import { Refinement, SetQueryObject } from "@im-library/interfaces";
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { EclService, SetService } from "@/services";
import _ from "lodash";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyGroup, Query, TTAlias } from "@im-library/models/AutoGen";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";

const props = defineProps({
  shape: { type: Object as PropType<PropertyGroup>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: String, required: false }
});

const toast = useToast();

const ecl: Ref<string> = ref("");
const eclAsQuery: Ref<Query | undefined> = ref();
const showDialog = ref(false);
const eclError = ref(false);
const eclErrorMessage = ref("");

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;

const key = props.shape.path["@id"];

watch(
  () => props.value,
  async (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) ecl.value = await EclService.getECLFromQuery(JSON.parse(newValue));
  }
);

watch(ecl, async () => {
  if (await EclService.isValidECL(ecl.value)) {
    eclAsQuery.value = await EclService.getQueryFromECL(ecl.value);
  }
});

watch(
  () => _.cloneDeep(eclAsQuery.value),
  async () => {
    updateEntity();
    updateValidity();
  }
);

onMounted(async () => {
  if (props.value) ecl.value = await EclService.getECLFromQuery(JSON.parse(props.value));
});

function showBuilder(): void {
  showDialog.value = true;
}

async function updateValidity() {
  if (validityUpdate) {
    validityUpdate({ key: key, valid: true });
  }
}

function updateEntity() {
  if (entityUpdate) {
    const result = {} as any;
    result[key] = JSON.stringify(eclAsQuery.value);
    entityUpdate(result);
  }
}

async function updateECL(data: string): Promise<void> {
  const isValid = await EclService.isValidECL(data);
  if (isValid) ecl.value = data;
}

function copyToClipboard(): string {
  return ecl.value;
}

function onCopy(): void {
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Value copied to clipboard"));
}

function onCopyError(): void {
  toast.add(new ToastOptions(ToastSeverity.ERROR, "Value copied to clipboard"));
}

function updateError(errorUpdate: { error: boolean; message: string }): void {
  eclError.value = errorUpdate.error;
  eclErrorMessage.value = errorUpdate.message;
}
</script>

<style scoped>
.set-definition-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;
}

.ecl-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

#ecl-string-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  flex-grow: 100;
}

.text-copy-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  margin: 0 0 1rem 0;
}

.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
  margin: 1rem 0 1rem 0;
}
</style>
