<template>
  <div class="parent-header-container">
    <div class="title-buttons-container">
      <div class="title-container">
        <h2 v-if="!showSelect" class="title">
          <IMFontAwesomeIcon :icon="getIcon(entity)" :style="getColour(entity)" :key="entity.iri" class="p-mx-1 type-icon" />
          <span>{{ entity[RDFS.LABEL] || "Favourites" }}</span>
        </h2>
        <h2 v-else class="title">
          <IMFontAwesomeIcon :icon="getIcon(entity)" :style="getColour(entity)" :key="entity.iri" class="p-mx-1 type-icon" />
          <span>{{ entity[RDFS.LABEL] || "Favourites" }}</span>
        </h2>
      </div>
      <div class="entity-buttons-container">
        <ActionButtons
          v-if="entity.iri"
          :buttons="!showSelect ? ['findInTree', 'view', 'edit', 'download', 'favourite'] : ['findInTree', 'view', 'addToList']"
          :iri="entity.iri"
          :name="entity[RDFS.LABEL]"
          :type="'entityButton'"
          @locate-in-tree="(iri: string) => emit('locateInTree', iri)"
          @view-hierarchy="(iri: string) => emit('viewHierarchy', iri)"
          @add-to-list="(iri: string) => emit('addToList', iri)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { IM, RDF, RDFS } from "@endeavour/vue-library/enums";
import { getColourFromType, getFAIconFromType } from "@endeavour/vue-library/helpers";
import type { ExtendedTTEntity } from "@endeavour/vue-library/interfaces";

import ActionButtons from "@/components/shared/ActionButtons.vue";

defineProps<{
  entity: ExtendedTTEntity;
  showSelect?: boolean;
}>();
const emit = defineEmits<{
  locateInTree: [payload: string];
  navigateTo: [payload: string];
  addToList: [payload: string];
  viewHierarchy: [payload: string];
}>();

function getIcon(entity: ExtendedTTEntity) {
  if (entity.iri === IM.FAVOURITES) return ["fa-solid", "star"];
  return getFAIconFromType(entity[RDF.TYPE]);
}

function getColour(entity: ExtendedTTEntity) {
  return "color: " + getColourFromType(entity[RDF.TYPE]);
}
</script>

<style scoped>
.parent-header-container {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding: 0.5rem;
  gap: 0.5rem;
}

.title-container {
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.title-buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
}

.title {
  padding: 0;
  margin: 0;
  white-space: normal;
}

.type-icon {
  padding-right: 0.5rem;
}
</style>
