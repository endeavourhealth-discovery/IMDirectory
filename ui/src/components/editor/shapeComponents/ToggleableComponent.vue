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
      :is="processComponentType(shape.subProperty[0].componentType)"
      :value="processEntityValue(shape.subProperty[0])"
      :shape="shape.subProperty[0]"
      :mode="mode"
    />
  </div>
</template>

<script lang="ts">
import EntitySearch from "./EntitySearch.vue";
export default defineComponent({
  components: { EntitySearch }
});
</script>

<script setup lang="ts">
import { PropType, watch, onMounted, ref, inject, defineComponent } from "vue";
import _ from "lodash";
import { PropertyGroup, PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { processComponentType } from "@im-library/helpers/EditorMethods";
import { EditorMode } from "@im-library/enums";
import injectionKeys from "@/injectionKeys/injectionKeys";

const props = defineProps({
  value: { type: Object as PropType<TTIriRef>, required: false },
  shape: { type: Object as PropType<PropertyShape>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  position: { type: Number, required: false }
});

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

function processEntityValue(property: PropertyShape | PropertyGroup) {
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
  border-color: red;
}

.label {
  font-size: 1rem;
  color: #6c757d;
}
</style>
