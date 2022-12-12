<template>
  <div class="vertical-layout-container">
    <div v-for="(component, index) in components" class="component-container" :style="'height:' + heights[index]">
      <component :is="processComponentType(component.componentType)" :shape="component" :value="processEntityValue(component)" :mode="mode" />
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
import { PropertyGroup, PropertyShape, TTIriRef } from "im-library/dist/types/interfaces";
import { EditorMode } from "im-library/enums";
import { PropType, inject, ref, Ref, onMounted, defineComponent } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { processComponentType } from "im-library/helpers/EditorMethods";
import { isObjectHasKeys } from "im-library/helpers/DataTypeCheckers";

const props = defineProps({
  shape: { type: Object as PropType<PropertyGroup>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: ([Object, String] as PropType<any>) || String, required: false },
  position: { type: Number, required: false }
});

const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;

const components: Ref<any[]> = ref([]);
const heights: Ref<String[]> = ref([]);

onMounted(() => {
  setComponents();
  setHeights();
});

function setComponents() {
  components.value = props.shape.property;
}

function setHeights() {
  if (props.shape.argument) {
    const splitArgs = props.shape.argument[0].valueData?.split(",");
    if (splitArgs && splitArgs?.length) {
      heights.value = splitArgs;
    } else {
      for (let i = 0; i < props.shape.property.length; i++) {
        heights.value.push(100 / props.shape.property.length + "%");
      }
    }
  } else {
    for (let i = 0; i < props.shape.property.length; i++) {
      heights.value.push("fit-content");
    }
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
.vertical-layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  overflow: auto;
  padding: 1rem;
}
</style>
