<template>
  <div class="vertical-layout-container">
    <h2 v-if="shape.showTitle">{{ shape.name }}</h2>
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
import DropdownTextInputConcatenator from "./DropdownTextInputConcatenator.vue";
import RoleGroupBuilder from "./RoleGroupBuilder.vue";
import { defineComponent } from "vue";
import PropertyBuilder from "@/components/editor/shapeComponents/PropertyBuilder.vue";

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
    ToggleableComponent,
    DropdownTextInputConcatenator,
    RoleGroupBuilder,
    PropertyBuilder
  }
});
</script>

<script setup lang="ts">
import { EditorMode } from "@im-library/enums";
import { PropType, inject, ref, Ref, onMounted } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { processComponentType } from "@im-library/helpers/EditorMethods";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { PropertyShape } from "@im-library/interfaces/AutoGen";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
  position?: number;
}

const props = defineProps<Props>();

const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;

const components: Ref<any[]> = ref([]);
const heights: Ref<String[]> = ref([]);

onMounted(() => {
  setComponents();
  setHeights();
});

function setComponents() {
  if (isObjectHasKeys(props.shape, ["property"])) components.value = props.shape.property!;
}

function setHeights() {
  if (props.shape.argument) {
    const splitArgs = props.shape.argument[0].valueData?.split(",");
    if (splitArgs && splitArgs?.length) {
      heights.value = splitArgs;
      return;
    }
  }

  if (isObjectHasKeys(props.shape, ["property"])) props.shape.property?.forEach(() => heights.value.push("fit-content"));
}

function processEntityValue(property: PropertyShape) {
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
  gap: 1rem;
}

.component-container {
  width: 100%;
}

.vertical-layout-container:deep(label) {
  display: block;
}
</style>
