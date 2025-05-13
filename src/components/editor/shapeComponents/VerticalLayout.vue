<template>
  <div class="vertical-layout-container" :style="manualWidth">
    <div class="title-bar">
      <h2 v-if="shape.showTitle" class="title">{{ shape.name }}</h2>
      <h2 v-if="showRequired" class="required">*</h2>
    </div>
    <div v-for="(component, index) in components" class="component-container" :style="styles.find(s => s.index === index)?.style" v-bind:key="index">
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
import SubsetBuilder from "./setDefinition/SubsetBuilder.vue";

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
    IriBuilder,
    SubsetBuilder
  }
});
</script>

<script setup lang="ts">
import { EditorMode } from "@/enums";
import { inject, ref, Ref, onMounted, ComputedRef, computed } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { processComponentType } from "@/helpers/EditorMethods";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { PropertyShape } from "@/interfaces/AutoGen";

const props = defineProps<{
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
  position?: number;
}>();

const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});
const manualWidth = computed(() =>
  props.shape.argument?.find(arg => arg.parameter === "width")?.valueData?.length
    ? "width: " + props.shape.argument?.find(arg => arg.parameter === "width")?.valueData + "%;"
    : ""
);

const components: Ref<any[]> = ref([]);
const styles: Ref<{ index: number; style: any }[]> = ref([]);

onMounted(() => {
  setComponents();
  setStyles();
});

function setComponents() {
  if (isObjectHasKeys(props.shape, ["property"])) components.value = props.shape.property!;
}

function setStyles() {
  const styleArg = props.shape.argument?.find(a => a.parameter === "style");
  if (styleArg) {
    styles.value = styleArg.valueObject;
  }
}

function processEntityValue(property: PropertyShape) {
  if (editorEntity && isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity, [property.path.iri])) {
    return editorEntity[property.path.iri];
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
  flex: 0 1 auto;
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
  color: var(--p-red-500);
}
</style>
