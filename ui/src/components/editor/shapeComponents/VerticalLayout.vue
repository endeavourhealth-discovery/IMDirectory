<template>
  <div class="vertical-layout-container">
    <div class="title-bar">
      <h2 v-if="shape.showTitle" class="title">{{ shape.name }}</h2>
      <h2 v-if="showRequired" class="required">*</h2>
    </div>
    <div v-for="(component, index) in components" class="component-container" :style="'height:' + heights[index]">
      <component :is="processComponentType(component.componentType)" :shape="component" :value="processEntityValue(component)" :mode="mode" />
    </div>
  </div>
</template>

<script lang="ts">
import ArrayBuilder from "@/components/editor/shapeComponents/ArrayBuilder.vue";
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
import TermCodeEditor from "./TermCodeEditor.vue";
import { defineComponent } from "vue";
import PropertyBuilder from "@/components/editor/shapeComponents/PropertyBuilder.vue";
import TextDropdown from "@/components/editor/shapeComponents/TextDropdown.vue";
import EntityDisplay from "@/components/editor/shapeComponents/EntityDisplay.vue";
import IriBuilder from "@/components/editor/shapeComponents/IriBuilder.vue";

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
    DropdownTextInputConcatenator,
    RoleGroupBuilder,
    PropertyBuilder,
    TermCodeEditor,
    TextDropdown,
    EntityDisplay,
    IriBuilder
  }
});
</script>

<script setup lang="ts">
import { EditorMode } from "@im-library/enums";
import { PropType, inject, ref, Ref, onMounted, ComputedRef, computed } from "vue";
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

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

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

.title-bar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
}

.required {
  color: var(--red-500);
}
</style>
