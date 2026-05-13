<template>
  <div class="horizontal-row-container">
    <Tabs v-model:value="activeTab" :lazy="true" scrollable>
      <TabList>
        <Tab v-for="(component, index) in components" :key="component.name" :value="String(index)">{{ component.name }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-for="(component, index) in components" :key="index" :header="component.label || component.name" :value="String(index)" class="p-p-4">
          <component :is="processComponentType(component.componentType)" :shape="component" :value="processEntityValue(component)" :mode="mode" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ArrayBuilder from "./ArrayBuilder.vue";
import SetDefinitionBuilder from "./SetDefinitionBuilder.vue";
import VerticalLayout from "./VerticalLayout.vue";

export default defineComponent({
  components: { ArrayBuilder, VerticalLayout, SetDefinitionBuilder }
});
</script>

<script setup lang="ts">
import { Ref, inject, onMounted, ref } from "vue";

import { isObjectHasKeys } from "@endeavour/vue-library/helpers";
import type { PropertyShape } from "@endeavour/vue-library/interfaces";

import { MenuItem } from "primevue/menuitem";
import TabPanel from "primevue/tabpanel";
import Tabs from "primevue/tabs";

import { EditorMode } from "@/enums";
import { processComponentType } from "@/helpers/EditorMethods";
import injectionKeys from "@/injectionKeys/injectionKeys";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
  position?: number;
}

const props = defineProps<Props>();
const activeTab = ref("0");
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity.value;

const components: Ref<any[]> = ref([]);
const widths: Ref<string[]> = ref([]);
const tabs: Ref<MenuItem[]> = ref([]);

onMounted(() => {
  setComponents();
  setWidths();
});

function setComponents() {
  if (isObjectHasKeys(props.shape, ["property"])) {
    components.value = props.shape.property!;
    tabs.value = components.value.map(c => ({ label: c.name }));
  }
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
  if (editorEntity && property.path?.iri && editorEntity[property.path.iri]) {
    return editorEntity[property.path.iri];
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
/*
.component-container {
  height: 100%;
  overflow: auto;
}
*/
</style>
