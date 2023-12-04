<template>
  <div v-if="properties && properties.length" class="group-container">
    <div v-for="(property, index) in properties" class="property-container">
      <component :is="processComponentType(property.componentType)" :shape="property" :value="processEntityValue(property)" :mode="mode" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ArrayBuilder from "@/components/editor/shapeComponents/ArrayBuilder.vue";
import EntityComboBox from "@/components/editor/shapeComponents/EntityComboBox.vue";
import EntityDropdown from "@/components/editor/shapeComponents/EntityDropdown.vue";
import HtmlInput from "@/components/editor/shapeComponents/HtmlInput.vue";
import TextInput from "@/components/editor/shapeComponents/TextInput.vue";
import TextDisplay from "@/components/editor/shapeComponents/TextDisplay.vue";
import SetDefinitionBuilder from "@/components/editor/shapeComponents/SetDefinitionBuilder.vue";
import QueryDefinitionBuilder from "@/components/editor/shapeComponents/QueryDefinitionBuilder.vue";
import ToggleableComponent from "@/components/editor/shapeComponents/ToggleableComponent.vue";
import HorizontalLayout from "@/components/editor/shapeComponents/HorizontalLayout.vue";
import VerticalLayout from "./shapeComponents/VerticalLayout.vue";

export default defineComponent({
  components: {
    EntityComboBox,
    ArrayBuilder,
    SetDefinitionBuilder,
    QueryDefinitionBuilder,
    EntityDropdown,
    HtmlInput,
    TextDisplay,
    TextInput,
    ToggleableComponent,
    HorizontalLayout,
    VerticalLayout
  }
});
</script>

<script setup lang="ts">
import { PropertyShape } from "@im-library/interfaces/AutoGen";
import { ref, Ref, watch, inject, onMounted, PropType } from "vue";
import { EditorMode } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { processComponentType } from "@im-library/helpers/EditorMethods";
import injectionKeys from "@/injectionKeys/injectionKeys";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
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
  if (isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity, [property.path["@id"]])) {
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
.group-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  padding: 2rem 0 0 0;
}

.property-container {
  width: 100%;
  flex: 0 1 auto;
  max-height: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-content: flex-start;
  /* overflow: auto; */
  /* padding: 2rem 0 0 0; */
}
</style>
