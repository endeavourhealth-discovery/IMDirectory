<template>
  <Button
    v-if="show('findInTree')"
    icon="fa-solid fa-sitemap"
    :class="getClass()"
    @click="locateInTree($event, iri)"
    v-tooltip.top="'Find in tree'"
    data-testid="select-button"
  />
  <Button
    v-if="show('view')"
    icon="pi pi-fw pi-external-link"
    :class="getClass()"
    @click="directService.view(iri)"
    v-tooltip.top="'View'"
    data-testid="view-button"
  />
  <Button
    v-if="show('edit')"
    icon="fa-solid fa-pen-to-square"
    :class="getClass()"
    @click="directService.edit(iri)"
    v-tooltip.top="'Edit'"
    data-testid="edit-button"
  />
  <Button
    v-if="show('favourite') && isFavourite(iri)"
    style="color: #e39a36"
    icon="pi pi-fw pi-star-fill"
    :class="getClass()"
    @click="updateFavourites(iri)"
    v-tooltip.left="'Unfavourite'"
  />
  <Button
    v-else-if="show('favourite') && !isFavourite(iri)"
    icon="pi pi-fw pi-star"
    :class="getClass()"
    @click="updateFavourites(iri)"
    v-tooltip.left="'Favourite'"
  />
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import findInTree from "@/composables/findInTree";
import { DirectService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { State } from "@/store/stateType";
import { Store, useStore } from "vuex";
const directService = new DirectService();
const { locateInTree }: { locateInTree: Function } = findInTree();
const store: Store<State> = useStore();
const favourites = computed(() => store.state.favourites);

const props = defineProps({
  buttons: { type: Array as PropType<Array<string>>, required: true },
  iri: { type: String, required: true },
  type: { type: String, required: false, default: "activityRowButton" }
});

function getClass() {
  const activityRowButton = "p-button-rounded p-button-text p-button-plain activity-row-button";
  const conceptButton = "p-button-secondary p-button-outlined concept-button";

  switch (props.type) {
    case "activityRowButton":
      return activityRowButton;
    case "conceptButton":
      return conceptButton;
    default:
      return activityRowButton;
  }
}

function show(button: string) {
  return props.buttons.includes(button);
}

function isFavourite(iri: string) {
  return isArrayHasLength(favourites.value) && favourites.value.includes(iri);
}

function updateFavourites(iri: string) {
  store.commit("updateFavourites", iri);
}
</script>

<style scoped>
.activity-row-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
  z-index: 999;
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
