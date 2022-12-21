<template>
  <Dialog
    :visible="showDialog"
    :modal="true"
    :closable="false"
    :maximizable="true"
    :style="{
      minWidth: '90vw',
      minHeight: '90vh',
      display: 'flex',
      flexFlow: 'column nowrap'
    }"
    id="ecl-builder-dialog"
    :contentStyle="{ flexGrow: '100', display: 'flex' }"
  >
    <template #header>
      <h3>ECL Builder:</h3>
    </template>
    <div id="builder-string-container">
      <div id="query-builder-container">
        <div id="query-build">
          <bool-group :value="ecl" style="width: 100%; margin: 0"></bool-group>
        </div>
        <small style="color: red" v-if="!ecl.items || ecl.items.length == 0">*Move pointer over panel above to add concepts, refinements and groups.</small>
      </div>
      <div id="build-string-container">
        <h3>Output:</h3>
        <div class="string-copy-container">
          <pre class="output-string">{{ JSON.stringify(ecl, null, 2) }}</pre>
<!--
          <pre class="output-string">{{ queryString }}</pre>
-->
          <Button
            icon="fa-solid fa-copy"
            v-tooltip.left="'Copy to clipboard'"
            v-clipboard:copy="copyToClipboard()"
            v-clipboard:success="onCopy"
            v-clipboard:error="onCopyError"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-secondary" @click="closeBuilderDialog" />
      <Button label="OK" icon="pi pi-check" class="p-button-primary" @click="submit" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Logic from "./builder/Logic.vue";
import RefinementGroup from "./builder/RefinementGroup.vue";
import FocusConcept from "./builder/FocusConcept.vue";
import BoolGroup from './builder/BoolGroup.vue';
import Concept from '@/components/directory/topbar/eclSearch/builder/Concept.vue';
import RefinementX from '@/components/directory/topbar/eclSearch/builder/RefinementX.vue';

export default defineComponent({
  components: { Logic, RefinementGroup, FocusConcept, BoolGroup, Concept, RefinementX }
});
</script>

<script setup lang="ts">
import {  onMounted, Ref, ref, watch } from "vue";
import { ECLComponent } from "@im-library/enums";
import { Sorters, EclSearchBuilderMethods } from "@im-library/helpers";
import { LoggerService } from "@/services";
import { ECLComponentDetails } from "@im-library/interfaces";
import { useToast } from "primevue/usetoast";
const { byPosition } = Sorters;
const { generateNewComponent, addItem, updateItem, updatePositions } = EclSearchBuilderMethods;

const props = defineProps({
  showDialog: Boolean
});

const emit = defineEmits({
  ECLSubmitted: (_payload: string) => true,
  closeDialog: () => true
});

const toast = useToast();

const ecl: Ref<any> = ref({ "type": "BoolGroup", "operator": "AND" });

const queryString = ref("");
const queryBuild: Ref<ECLComponentDetails[]> = ref([]);

watch(queryBuild, () => {
  queryBuild.value.sort(byPosition);
  generateQueryString();
});

onMounted(() => setStartBuild());

function submit(): void {
  emit("ECLSubmitted", queryString.value);
}

function closeBuilderDialog(): void {
  emit("closeDialog");
}

function addItemWrapper(data: { selectedType: ECLComponent; position: number; value: any }): void {
  if (data.selectedType === ECLComponent.LOGIC) {
    data.value = { data: data.value, parentGroup: ECLComponent.BUILDER };
  }
  addItem(data, queryBuild.value, { minus: true, plus: true });
}

function generateQueryString(): void {
  queryString.value = queryBuild.value
    .map(item => {
      if (item.type === ECLComponent.LOGIC) {
        return item.queryString + "\n";
      } else {
        return item.queryString;
      }
    })
    .join(" ")
    .replace(/\n +/g, "\n");
}

function deleteItem(data: ECLComponentDetails): void {
  const index = queryBuild.value.findIndex(item => item.position === data.position);
  queryBuild.value.splice(index, 1);
  const length = queryBuild.value.length;
  if (length === 0) {
    setStartBuild();
    return;
  }
  updatePositions(queryBuild.value);
}

function updateItemWrapper(data: ECLComponentDetails): void {
  updateItem(data, queryBuild.value);
}

function setStartBuild(): void {
  queryBuild.value = [];
  queryBuild.value.push(generateNewComponent(ECLComponent.FOCUS_CONCEPT, 0, null, { minus: false, plus: true }));
}

function copyToClipboard(): string {
  return queryString.value;
}

function onCopy(): void {
  toast.add(LoggerService.success("Value copied to clipboard"));
}

function onCopyError(): void {
  toast.add(LoggerService.error("Failed to copy value to clipboard"));
}
</script>

<style scoped>
#builder-string-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
}

#query-builder-container {
  width: 100%;
  flex: 1 1 auto;
}

#query-build {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;
  gap: 1rem;
  flex: 1 1 auto;
  overflow: auto;
  font-size: 12px;
}

#next-option-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  min-height: 2rem;
}

#build-string-container {
  width: 100%;
  flex: 0 1 auto;
  display: flex;
  flex-flow: column nowrap;
}

.output-string {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 3px;
  padding: 1rem;
  margin: 0;
  height: 100%;
  flex-grow: 100;
  overflow-y: auto;
  tab-size: 4;
}

.string-copy-container {
  height: 10rem;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
</style>
