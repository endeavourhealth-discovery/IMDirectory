<template>
  <div class="parent-header-container">
    <div class="title-buttons-container">
      <div class="title-container">
        <h4 class="title">
          <span :style="getColour(concept)" class="p-mx-1 type-icon" :key="concept['@id']">
            <i :class="getIcon(concept)" aria-hidden="true" />
          </span>
          {{ concept["http://www.w3.org/2000/01/rdf-schema#label"] || "Favourites" }}
        </h4>
      </div>
      <div class="concept-buttons-container">
        <Button
          icon="fa-solid fa-sitemap"
          class="p-button-secondary p-button-outlined concept-button"
          @click="locateInTree($event, concept['@id'])"
          v-tooltip.top="'Find in tree'"
          data-testid="find-in-tree-button"
        />
        <Button
          icon="pi pi-fw pi-external-link"
          class="p-button-secondary p-button-outlined concept-button"
          @click="directService.view(concept['@id'])"
          v-tooltip.left="'Open in new tab'"
        />
        <Button
          icon="fa-solid fa-pen-to-square"
          class="p-button-secondary p-button-outlined concept-button"
          @click="directService.edit(concept['@id'])"
          v-tooltip.left="'Edit'"
        />
        <Button
          v-if="isFavourite(concept['@id'])"
          style="color: #e39a36"
          icon="pi pi-fw pi-star-fill"
          class="p-button-secondary p-button-outlined concept-button-fav"
          @click="updateFavourites(concept['@id'])"
          v-tooltip.left="'Unfavourite'"
        />
        <Button
          v-else
          icon="pi pi-fw pi-star"
          class="p-button-secondary p-button-outlined concept-button"
          @click="updateFavourites(concept['@id'])"
          v-tooltip.left="'Favourite'"
        />
      </div>
    </div>
    <TextWithLabel label="Iri" :data="concept['@id']" :show="concept['@id'] ? true : false" />
    <TextWithLabel label="Code" :data="concept['http://endhealth.info/im#code']" :show="concept['http://endhealth.info/im#code'] ? true : false" />
    <div class="flex flex-row justify-content-start">
      <ArrayObjectNameTagWithLabel
        label="Status"
        :data="concept['http://endhealth.info/im#status']"
        :show="concept['http://endhealth.info/im#status'] ? true : false"
      />
      <ArrayObjectNamesToStringWithLabel
        label="Types"
        :data="concept['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']"
        :show="concept['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] ? true : false"
      />
    </div>

    <TextHTMLWithLabel
      label="Description"
      :data="concept['http://www.w3.org/2000/01/rdf-schema#comment']"
      :show="concept['http://www.w3.org/2000/01/rdf-schema#comment'] ? true : false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import TextHTMLWithLabel from "@/components/shared/generics/TextHTMLWithLabel.vue";
import ArrayObjectNamesToStringWithLabel from "@/components/shared/generics/ArrayObjectNamesToStringWithLabel.vue";
import ArrayObjectNameTagWithLabel from "@/components/shared/generics/ArrayObjectNameTagWithLabel.vue";
import TextWithLabel from "@/components/shared/generics/TextWithLabel.vue";
import { ConceptTypeMethods, DataTypeCheckers } from "im-library/helpers";
import { IM, RDF } from "im-library/vocabulary";
import { DirectService } from "@/services";
import { Store, useStore } from "vuex";
import { State } from "@/store/stateType";
import findInTree from "@/composables/findInTree";
const { getColourFromType, getFAIconFromType } = ConceptTypeMethods;
const { isArrayHasLength } = DataTypeCheckers;

const props = defineProps({ concept: { type: Object as any, required: true } });

const store: Store<State> = useStore();
const favourites = computed(() => store.state.favourites);
const { locateInTree }: { locateInTree: Function } = findInTree();

const directService = new DirectService();

function isFavourite(iri: string) {
  return isArrayHasLength(favourites.value) && favourites.value.includes(iri);
}

function getIcon(concept: any) {
  if (concept["@id"] === IM.NAMESPACE + "Favourites") return ["fa-solid", "star"];
  return getFAIconFromType(concept[RDF.TYPE]);
}

function getColour(concept: any) {
  return "color: " + getColourFromType(concept[RDF.TYPE]);
}

function updateFavourites(iri: string) {
  store.commit("updateFavourites", iri);
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
}

.type-icon {
  padding-right: 0.5rem;
}

.concept-buttons-container {
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.concept-button,
.concept-button-fav {
  height: fit-content;
}

.concept-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}

.concept-button-fav:hover {
  background-color: #e39a36 !important;
  color: #ffffff !important;
}
</style>
