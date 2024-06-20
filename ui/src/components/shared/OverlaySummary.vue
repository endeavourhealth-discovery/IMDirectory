<template>
  <OverlayPanel ref="OP" id="overlay-panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
    <div v-if="hoveredResult?.name" class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
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
        <p v-if="hoveredResult.code">
          <strong>Code: </strong>
          <span>{{ hoveredResult.code }}</span>
        </p>
      </div>
      <div class="right-side" style="width: 50%">
        <p v-if="hoveredResult.status">
          <strong>Status: </strong>
          <span>{{ hoveredResult.status.name }}</span>
        </p>
        <p v-if="hoveredResult.scheme">
          <strong>Scheme: </strong>
          <span>{{ hoveredResult.scheme.name }}</span>
        </p>
        <p v-if="hoveredResult.entityType">
          <strong>Type: </strong>
          <span>{{ getConceptTypes(hoveredResult.entityType) }}</span>
        </p>
      </div>
    </div>
  </OverlayPanel>
</template>

<script setup lang="ts">
import { getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { TTIriRef, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { ref, Ref } from "vue";

const hoveredResult: Ref<SearchResultSummary | undefined> = ref();
const overlayLocation: Ref<any> = ref({});
const OP = ref();

async function showOverlay(event: any, iri: any): Promise<void> {
  if (iri) {
    const x = OP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value = await EntityService.getEntitySummary(iri);
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
