<template>
  <div class="component-group-container">
    <h2 v-if="shape.showTitle">{{ shape.name }}</h2>
    <div class="label-container">
      <div v-for="(property, index) in properties" class="components-container">
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
import { PropType, ref, Ref, watch, onMounted, inject } from "vue";
import { EditorMode } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { processComponentType } from "@im-library/helpers/EditorMethods";
import { isPropertyShape } from "@im-library/helpers/TypeGuards";
import { PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import injectionKeys from "@/injectionKeys/injectionKeys";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  position?: number;
  value?: TTIriRef[];
}

const props = defineProps<Props>();

watch(
  () => props.shape,
  newValue => {
    setProperties(newValue);
  }
);

const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;

let properties: Ref<PropertyShape[]> = ref([]);

onMounted(() => {
  setProperties(props.shape);
});

function processEntityValue(property: PropertyShape) {
  if (props.value && isPropertyShape(property)) {
    return props.value[property.order - 1];
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

.components-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column;
  align-items: baseline;
}

.label-container {
  width: 100%;
  flex: 1 1 auto;
  padding: 1rem;
  border-radius: 3px;
  display: flex;
  flex-flow: row nowrap;
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
  color: var(--text-color);
}
</style>
