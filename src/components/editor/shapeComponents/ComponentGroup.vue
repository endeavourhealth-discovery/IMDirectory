<template>
  <div class="component-group-container">
    <div class="title-bar">
      <h2 v-if="shape.showTitle">{{ shape.name }}</h2>
      <h2 v-if="showRequired" class="required">*</h2>
    </div>
    <div class="label-container">
      <div v-for="(property, index) in properties" class="component-container">
        <component :is="processComponentType(property.componentType)" :shape="property" :value="processEntityValue(property)" :mode="mode" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import EntityAutoComplete from "./EntityAutoComplete.vue";
import EntityComboBox from "./EntityComboBox.vue";
import EntityDropdown from "./EntityDropdown.vue";
import EntitySearch from "./EntitySearch.vue";
import TextInput from "./TextInput.vue";
import TextDisplay from "./TextDisplay.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: { EntityAutoComplete, EntityComboBox, EntityDropdown, EntitySearch, TextDisplay, TextInput }
});
</script>

<script setup lang="ts">
import { ref, Ref, watch, onMounted, inject, computed, ComputedRef } from "vue";
import { EditorMode } from "@/enums";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { processComponentType } from "@/helpers/EditorMethods";
import { isPropertyShape } from "@/helpers/TypeGuards";
import { PropertyShape } from "@/interfaces/AutoGen";
import injectionKeys from "@/injectionKeys/injectionKeys";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: any;
}

const props = defineProps<Props>();

watch(
  () => props.shape,
  newValue => {
    setProperties(newValue);
  }
);

const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

let properties: Ref<PropertyShape[]> = ref([]);

onMounted(() => {
  setProperties(props.shape);
});

function processEntityValue(property: PropertyShape) {
  if (props.value && isObjectHasKeys(props.value) && isPropertyShape(property) && isObjectHasKeys(props.value, [property.path["@id"]])) {
    return props.value[property.path["@id"]];
  }
  if (isPropertyShape(property) && isObjectHasKeys(editorEntity, [property.path["@id"]])) {
    return editorEntity[property.path["@id"]];
  }
  return undefined;
}

function setProperties(shape: PropertyShape) {
  if (isObjectHasKeys(shape, ["property"])) properties.value = shape.property!;
  else properties.value = [];
}
</script>

<style scoped>
.component-group-container {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: row wrap;
}

.component-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row;
  align-items: baseline;
}

.label-container {
  width: 100%;
  flex: 1 1 auto;
  padding: 1rem;
  border: 1px solid var(--p-textarea-border-color);
  border-radius: var(--p-textarea-border-radius);
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: auto;
  gap: 1rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: var(--p-text-color);
}

.title-bar {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.25rem;
  justify-content: center;
}

.required {
  color: var(--p-red-500);
}
</style>
