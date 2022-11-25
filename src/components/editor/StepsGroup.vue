<template>
  <div v-if="properties && properties.length" class="group-container">
    <div v-for="(property, index) in properties" class="property-container">
      <component :is="processComponentType(property.componentType)" :shape="property" :value="processEntityValue(property)" :mode="mode" />
    </div>
  </div>
</template>

<script lang="ts">
import ArrayBuilder from "@/components/editor/shapeComponents/ArrayBuilder.vue";
import ArrayBuilderWithDropdown from "@/components/editor/shapeComponents/ArrayBuilderWithDropdown.vue";
import EntityComboBox from "@/components/editor/shapeComponents/EntityComboBox.vue";
import EntityDropdown from "@/components/editor/shapeComponents/EntityDropdown.vue";
import HtmlInput from "@/components/editor/shapeComponents/HtmlInput.vue";
import TextInput from "@/components/editor/shapeComponents/TextInput.vue";
import TextDisplay from "@/components/editor/shapeComponents/TextDisplay.vue";
import SetDefinitionBuilder from "@/components/editor/shapeComponents/SetDefinitionBuilder.vue";
import QueryDefinitionBuilder from "@/components/editor/shapeComponents/QueryDefinitionBuilder.vue";
import ToggleableComponent from "@/components/editor/shapeComponents/ToggleableComponent.vue";

export default defineComponent({
  components: {
    EntityComboBox,
    ArrayBuilder,
    ArrayBuilderWithDropdown,
    SetDefinitionBuilder,
    QueryDefinitionBuilder,
    EntityDropdown,
    HtmlInput,
    TextDisplay,
    TextInput,
    ToggleableComponent
  }
});
</script>

<script setup lang="ts">
import { PropertyGroup, PropertyShape } from "@/im_library/interfaces";
import { ref, Ref, watch, inject, onMounted, PropType, defineComponent } from "vue";
import { EditorMode } from "@/im_library/enums";
import { isObjectHasKeys } from "@/im_library/helpers/modules/DataTypeCheckers";
import { processComponentType } from "@/im_library/helpers/modules/EditorMethods";
import injectionKeys from "@/injectionKeys/injectionKeys";
import _ from "lodash";

const props = defineProps({
  shape: { type: Object as PropType<PropertyGroup>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true }
});
watch(
  () => props.shape,
  newValue => {
    setProperties(newValue);
  }
);

const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;

let properties: Ref<PropertyShape[] | PropertyGroup[]> = ref([]);

onMounted(() => {
  setProperties(props.shape);
});

function processEntityValue(property: PropertyShape | PropertyGroup) {
  if (isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity, [property.path["@id"]])) {
    return editorEntity[property.path["@id"]];
  }
  return undefined;
}

function setProperties(shape: PropertyGroup) {
  if (isObjectHasKeys(shape, ["property"])) properties.value = shape.property;
  else if (isObjectHasKeys(shape, ["subGroup"])) properties.value = shape.subGroup;
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
  overflow: auto;
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
