<template>
  <div class="horizontal-row-container">
    <div v-for="(component, index) in components" class="component-container" :style="'width:' + widths[index]">
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
import { EditorMode } from "@im-library/enums";
import { PropType, inject, ref, Ref, onMounted } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { processComponentType } from "@im-library/helpers/EditorMethods";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { PropertyShape } from "@im-library/interfaces/AutoGen";

const props = defineProps({
  shape: { type: Object as PropType<PropertyShape>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: ([Object, String] as PropType<any>) || String, required: false },
  position: { type: Number, required: false }
});

const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;

const components: Ref<any[]> = ref([]);
const widths: Ref<String[]> = ref([]);

onMounted(() => {
  setComponents();
  setWidths();
});

function setComponents() {
  components.value = props.shape.property;
}

function setWidths() {
  if (props.shape.argument) {
    const splitArgs = props.shape.argument[0].valueData?.split(",");
    if (splitArgs && splitArgs?.length) {
      widths.value = splitArgs;
    } else {
      widths.value.push(100 / props.shape.property.length + "%");
    }
  } else {
    widths.value.push(100 / props.shape.property.length + "%");
  }
}

function processEntityValue(property: PropertyShape) {
  if (isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity, [property.path["@id"]])) {
    return editorEntity[property.path["@id"]];
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
