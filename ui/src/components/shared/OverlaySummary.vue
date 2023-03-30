<template>
  <div v-if="hoveredResult.name" class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
    <div class="left-side" style="width: 50%">
      <p>
        <strong>Name: </strong>
        <span>{{ hoveredResult.name }}</span>
      </p>
      <p>
        <strong>Iri: </strong>
        <span style="word-break: break-all">{{ hoveredResult.iri }}</span>
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
</template>

<script setup lang="ts">
import { getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { TTIriRef } from "@im-library/interfaces/AutoGen";

const props = defineProps({
  hoveredResult: { type: Object, required: true }
});

function getConceptTypes(types: TTIriRef[]): string {
  return getNamesAsStringFromTypes(types);
}
</script>

<style scoped></style>
