<template>
  <div class="toggleable-entity-search">
    <ToggleButton
      v-model="checked"
      onLabel="Activate"
      offLabel="Deactivate"
      aria-label="deactivate/activate entity"
      :class="checked ? 'p-button-success' : 'p-button-danger'"
      class="toggle-button"
    />
    <h2 v-if="shape.showTitle && checked" class="title">{{ shape.name }}</h2>
    <div class="content">
      <component
        v-if="checked && isObjectHasKeys(shape, ['property'])"
        :is="processComponentType(shape.property![0].componentType)"
        :value="processEntityValue(shape.property![0])"
        :shape="shape.property![0]"
        :mode="mode"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EntitySearch from "./EntitySearch.vue";
export default defineComponent({
  components: { EntitySearch }
});
</script>

<script setup lang="ts">
import { watch, onMounted, ref, inject } from "vue";
import { PropertyShape, TTIriRef } from "@/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { processComponentType } from "@/helpers/EditorMethods";
import { EditorMode } from "@/enums";
import injectionKeys from "@/injectionKeys/injectionKeys";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: TTIriRef;
  position?: number;
}

const props = defineProps<Props>();

const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const addPropertyToValidationCheckStatus = inject(injectionKeys.forceValidation)?.addPropertyToValidationCheckStatus;
const removeValidationCheckStatus = inject(injectionKeys.forceValidation)?.removeValidationCheckStatus;

const checked = ref(false);
const onLabel = ref("");
const offLabel = ref("");

if (forceValidation && checked.value) {
  if (props.shape.property && isArrayHasLength(props.shape.property) && addPropertyToValidationCheckStatus) {
    for (const property of props.shape.property) {
      addPropertyToValidationCheckStatus(property);
    }
  }
}

onMounted(() => {
  setLabels();
  setChecked();
});

watch(checked, newValue => {
  if (!newValue && deleteEntityKey && isObjectHasKeys(props.shape, ["path"])) {
    deleteEntityKey(props.shape.path!["@id"]);
    if (removeValidationCheckStatus && props.shape.property && isArrayHasLength(props.shape.property)) {
      for (const property of props.shape.property) {
        removeValidationCheckStatus(property);
      }
    }
  }
});

function setLabels() {
  if (props.shape.label && props.shape.label.indexOf("|") > -1) {
    const splitLabels = props.shape.label.split("|");
    onLabel.value = splitLabels[0];
    offLabel.value = splitLabels[1];
  }
}

function setChecked() {
  if (isObjectHasKeys(props.shape, ["path"]) && isObjectHasKeys(editorEntity, [props.shape.path!["@id"]])) {
    checked.value = true;
  }
}

function processEntityValue(property: PropertyShape | undefined) {
  if (!property) throw new Error("Property is undefined");
  if (isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity, [property.path!["@id"]])) {
    return editorEntity[property.path!["@id"]];
  }
  return undefined;
}
</script>

<style scoped>
.toggleable-entity-search {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  min-width: 25rem;
}

.toggle-button {
  align-self: center;
  order: 3;
  margin: 0.5rem 0;
}

.toggleable-entity-search:deep(.label-container) {
  border-color: var(--p-red-500);
}

.label {
  font-size: 1rem;
  color: var(--p-text-color);
}

.title {
  width: 100%;
  text-align: center;
}

.content {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
}
</style>
