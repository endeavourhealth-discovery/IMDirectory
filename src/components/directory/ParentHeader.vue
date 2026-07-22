<template>
  <div class="parent-header-container">
    <div class="title-buttons-container">
      <div class="title-container">
        <h2 v-if="!showSelect" class="title">
          <IMFontAwesomeIcon :icon="getIcon()" :style="getColour()" :key="iri" class="p-mx-1 type-icon" />
          <span>{{ name || "Favourites" }}</span>
        </h2>
        <h2 v-else class="title">
          <IMFontAwesomeIcon :icon="getIcon()" :style="getColour()" :key="iri" class="p-mx-1 type-icon" />
          <span>{{ name || "Favourites" }}</span>
        </h2>
      </div>
      <div class="entity-buttons-container">
        <ActionButtons
          v-if="entity.iri"
          :buttons="!showSelect ? ['findInTree', 'view', 'edit', 'download', 'favourite'] : ['findInTree', 'view', 'addToList']"
          :iri="iri"
          :name="name"
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
import { computed } from "vue";

import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { IM, RDF, RDFS } from "@endeavour/vue-library/enums";
import { getColourFromType, getFAIconFromType, isArrayOf } from "@endeavour/vue-library/helpers";
import { type TTEntity, isTTIriRef } from "@endeavour/vue-library/models";

import { isString } from "lodash-es";

import ActionButtons from "@/components/shared/ActionButtons.vue";

const props = defineProps<{
  entity: TTEntity;
  showSelect?: boolean;
}>();
const emit = defineEmits<{
  locateInTree: [payload: string];
  navigateTo: [payload: string];
  addToList: [payload: string];
  viewHierarchy: [payload: string];
}>();

const iri = computed(() => {
  if (isString(props.entity.iri)) return props.entity.iri;
  else return "";
});
const types = computed(() => {
  if (isArrayOf(props.entity[RDF.TYPE], isTTIriRef)) return props.entity[RDF.TYPE];
  else return [];
});
const name = computed(() => {
  if (isString(props.entity[RDFS.LABEL])) return props.entity[RDFS.LABEL];
  else return "";
});

function getIcon() {
  if (iri.value === IM.FAVOURITES) return ["fa-solid", "star"];
  return getFAIconFromType(types.value);
}

function getColour() {
  return "color: " + getColourFromType(types.value);
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
