<template>
  <div class="horizontal-row-container">
    <h2 v-if="shape.showTitle">{{ shape.name }}</h2>
    <div v-for="(component, index) in components" class="component-container" :style="'width:' + widths[index]" v-bind:key="index">
      <component :is="processComponentType(component.componentType)" :shape="component" :value="processEntityValue(component)" :mode="mode" />
    </div>
  </div>
</template>

<script lang="ts">
import ArrayBuilder from "./ArrayBuilder.vue";
import VerticalLayout from "./VerticalLayout.vue";
import SetDefinitionBuilder from "./SetDefinitionBuilder.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: { ArrayBuilder, VerticalLayout, SetDefinitionBuilder }
});
</script>

<script setup lang="ts">
import { EditorMode } from "@/enums";
import { inject, ref, Ref, onMounted } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { processComponentType } from "@/helpers/EditorMethods";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { PropertyShape } from "@/interfaces/AutoGen";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
  position?: number;
}

const props = defineProps<Props>();

const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;

const components: Ref<any[]> = ref([]);
const widths: Ref<string[]> = ref([]);

onMounted(() => {
  setComponents();
  setWidths();
});

function setComponents() {
  if (isObjectHasKeys(props.shape, ["property"])) components.value = props.shape.property!;
}

function setWidths() {
  if (isObjectHasKeys(props.shape, ["property"])) {
    if (props.shape.argument) {
      const splitArgs = props.shape.argument[0].valueData?.split(",");
      if (splitArgs && splitArgs?.length) {
        widths.value = splitArgs;
      } else {
        widths.value.push(100 / props.shape.property!.length + "%");
      }
    } else {
      widths.value.push(100 / props.shape.property!.length + "%");
    }
  }
}

function processEntityValue(property: PropertyShape) {
  if (isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity, [property.path!["@id"]])) {
    return editorEntity[property.path!["@id"]];
  }
  return undefined;
}
</script>

<style scoped>
.horizontal-row-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
}
.component-container {
  height: 100%;
  overflow: auto;
}
</style>
