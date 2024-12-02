<template>
  <Popover ref="OP" id="overlay-panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
    <div v-if="loading" class="flex flex-row justify-center"><ProgressSpinner /></div>
    <div v-else-if="hoveredResult?.name" class="justify-contents-start result-overlay flex flex-row" style="width: 100%; gap: 1rem">
      <div class="left-side" style="width: 50%">
        <p>
          <strong>Name: </strong>
          <span>{{ hoveredResult.name }}</span>
        </p>
        <p>
          <strong>Iri: </strong>
          <span style="word-break: break-all">{{ hoveredResult.iri }}</span>
        </p>
        <p>
          <strong>Description: </strong>
          <span>{{ hoveredResult.description }}</span>
        </p>
        <p v-if="hoveredResult.type">
          <strong>Type: </strong>
          <span>{{ getConceptTypes(hoveredResult.type) }}</span>
        </p>
        <p v-if="hoveredResult.intervalUnit">
          <strong>Units of measure : </strong>
          <span>{{ getConceptTypes(hoveredResult.intervalUnit) }}</span>
        </p>
        <p v-if="hoveredResult.qualifier">
          <strong>May be qualified by : </strong>
          <span>{{ getConceptTypes(hoveredResult.qualifier) }}</span>
        </p>
      </div>
      <div class="right-side" style="width: 50%">
        <p v-if="hoveredResult.scheme">
          <strong>Scheme: </strong>
          <span>{{ hoveredResult.scheme.name }}</span>
        </p>

      </div>
    </div>
  </Popover>
</template>

<script setup lang="ts">
import { getNamesAsStringFromTypes } from "@/helpers/ConceptTypeMethods";
import { TTIriRef, DataModelSummary } from "@/interfaces/AutoGen";
import { DataModelService } from "@/services";
import { ref, Ref } from "vue";

const hoveredResult: Ref<DataModelSummary | undefined> = ref();
const overlayLocation: Ref<any> = ref({});
const OP = ref();
const loading = ref(true);

async function showOverlay(event: any, iri: any): Promise<void> {
  if (iri) {
    loading.value = true;
    const x = OP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value = await DataModelService.getDataModelSummary(iri);
    loading.value = false;
  }
}

function hideOverlay(event: any): void {
  const x = OP.value;
  x.hide(event);
  overlayLocation.value = {} as any;
}

function getConceptTypes(types: TTIriRef[]): string {
  return getNamesAsStringFromTypes(types);
}

defineExpose({ showOverlay, hideOverlay });
</script>

<style scoped></style>
