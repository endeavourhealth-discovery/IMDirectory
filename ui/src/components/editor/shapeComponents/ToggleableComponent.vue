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
    <span v-if="checked" class="label">{{ shape.name }} ({{ shape.path["@id"] }})</span>
    <component
      v-if="checked"
      :is="processComponentType(shape.property[0].componentType)"
      :value="processEntityValue(shape.property[0])"
      :shape="shape.property[0]"
      :mode="mode"
    />
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
import { PropType, watch, onMounted, ref, inject } from "vue";
import { PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { processComponentType } from "@im-library/helpers/EditorMethods";
import { EditorMode } from "@im-library/enums";
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

const checked = ref(false);
const onLabel = ref("");
const offLabel = ref("");

onMounted(() => {
  setLabels();
  setChecked();
});

watch(checked, newValue => {
  if (!newValue && deleteEntityKey) deleteEntityKey(props.shape.path["@id"]);
});

function setLabels() {
  if (props.shape.label && props.shape.label.indexOf("|") > -1) {
    const splitLabels = props.shape.label.split("|");
    onLabel.value = splitLabels[0];
    offLabel.value = splitLabels[1];
  }
}

function setChecked() {
  if (isObjectHasKeys(editorEntity, [props.shape.path["@id"]])) {
    checked.value = true;
  }
}

function processEntityValue(property: PropertyShape) {
  if (isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity, [property.path["@id"]])) {
    return editorEntity[property.path["@id"]];
  }
  return undefined;
}
</script>

<style scoped>
.toggleable-entity-search {
  flex: 0 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  max-width: 25rem;
}

.toggle-button {
  align-self: center;
  order: 3;
  margin: 0.5rem 0 0 0;
}

.toggleable-entity-search:deep(.label-container) {
  border-color: var(--red-500);
}

.label {
  font-size: 1rem;
  color: var(--text-color);
}
</style>
