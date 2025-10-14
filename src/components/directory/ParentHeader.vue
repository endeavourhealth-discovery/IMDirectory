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
import TextHTMLWithLabel from "@/components/shared/generics/TextHTMLWithLabel.vue";
import ArrayObjectNamesToStringWithLabel from "@/components/shared/generics/ArrayObjectNamesToStringWithLabel.vue";
import ArrayObjectNameTagWithLabel from "@/components/shared/generics/ArrayObjectNameTagWithLabel.vue";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import TextWithLabel from "@/components/shared/generics/TextWithLabel.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { IM, RDF, RDFS } from "@/vocabulary";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";

defineProps<{
  entity: TTEntity;
  showSelect?: boolean;
}>();
const emit = defineEmits<{
  locateInTree: [payload: string];
  navigateTo: [payload: string];
  addToList: [payload: string];
  viewHierarchy: [payload: string];
}>();

function getIcon(entity: TTEntity) {
  if (entity.iri === IM.FAVOURITES) return ["fa-solid", "star"];
  return getFAIconFromType(entity[RDF.TYPE]);
}

function getColour(entity: TTEntity) {
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
