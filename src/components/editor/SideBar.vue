<template>
  <div class="sidebar">
    <TabView :lazy="true">
      <TabPanel header="NavTree">
        <NavTree />
      </TabPanel>
      <TabPanel header="JSON viewer">
        <VueJsonPretty class="json" :path="'res'" :data="editorEntity" @click="handleClick" />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import VueJsonPretty from "vue-json-pretty";
import NavTree from "./sidebar/NavTree.vue";

const props = defineProps({
  editorEntity: { type: Object as PropType<any>, required: true }
});

function handleClick(data: any) {
  console.log("click");
  console.log(data);
}
</script>

<style scoped>
.sidebar {
  height: 100%;
}

.p-tabview {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.p-tabview:deep(.p-tabview-panels) {
  flex: 1 1 auto;
  overflow: auto;
}

.json:deep(.vjs-value__string) {
  word-break: break-all;
}

.json:deep(.vjs-value) {
  font-size: 1rem;
}

.json:deep(.vjs-key) {
  font-size: 1rem;
}

.json {
  flex: 0 1 auto;
  width: 100%;
  overflow: auto;
  border: 1px #dee2e6 solid;
  border-radius: 3px;
}
</style>
