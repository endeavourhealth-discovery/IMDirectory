<template>
  <Button
    v-if="show('runQuery')"
    :icon="'fa-solid fa-bolt'"
    :severity="getSeverity()"
    :class="getClass()"
    @click="onRunQuery(iri)"
    v-tooltip.top="'Run query'"
    data-testid="run-query-button"
  />
  <Button
    v-if="show('findInTree')"
    :icon="fontAwesomePro ? 'fa-duotone fa-list-tree' : 'fa-solid fa-sitemap'"
    :severity="getSeverity()"
    :class="getClass()"
    @click="locateInTree($event, iri)"
    v-tooltip.top="'Find in tree'"
    data-testid="select-button"
  />
  <Button
    v-if="show('view')"
    :icon="fontAwesomePro ? 'fa-duotone fa-up-right-from-square' : 'fa-solid fa-up-right-from-square'"
    :severity="getSeverity()"
    :class="getClass()"
    @click="directService.view(iri)"
    v-tooltip.top="'View'"
    data-testid="view-button"
  />
  <Button
    v-if="show('edit')"
    :icon="fontAwesomePro ? 'fa-duotone fa-pen-to-square' : 'fa-solid fa-pen-to-square'"
    :severity="getSeverity()"
    :class="getClass()"
    @click="directService.edit(iri)"
    v-tooltip.top="'Edit'"
    data-testid="edit-button"
  />
  <Button
    v-if="show('favourite') && isFavourite(iri)"
    style="color: var(--yellow-500)"
    icon="fa-solid fa-star"
    :severity="getSeverity()"
    :class="getClass()"
    @click="updateFavourites(iri)"
    v-tooltip.left="'Unfavourite'"
    data-testid="unfavourite-button"
  />
  <Button
    v-else-if="show('favourite') && !isFavourite(iri)"
    icon="fa-regular fa-star"
    :severity="getSeverity()"
    :class="getClass()"
    @click="updateFavourites(iri)"
    v-tooltip.left="'Favourite'"
    data-testid="favourite-button"
  />
  <TestQueryParams
    v-if="showTestQueryParams && isObjectHasKeys(queryRequest)"
    :showDialog="showTestQueryParams"
    :query-request="queryRequest"
    :params="params"
    @on-params-populated="onParamsPopulated"
    @close-dialog="showTestQueryParams = false"
  />
  <TestQueryResults
    v-if="showTestQueryResults && isObjectHasKeys(queryRequest)"
    :showDialog="showTestQueryResults"
    :query-request="queryRequest"
    @close-dialog="showTestQueryResults = false"
  />
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import findInTree from "@/composables/findInTree";
import setupRunQuery from "@/composables/setupRunQuery";
import { DirectService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import TestQueryResults from "../editor/shapeComponents/setDefinition/TestQueryResults.vue";
import TestQueryParams from "../editor/shapeComponents/setDefinition/TestQueryParams.vue";
import { Query } from "@im-library/interfaces/AutoGen";
import { useRootStore } from "@/stores/rootStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useUserStore } from "@/stores/userStore";

const directService = new DirectService();
const { hasParams, getParams, runQueryFromIri, params, queryResults, showTestQueryResults, queryRequest, showTestQueryParams } = setupRunQuery();
const { locateInTree }: { locateInTree: Function } = findInTree();
const rootStore = useRootStore();
const directoryStore = useDirectoryStore();
const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);
const fontAwesomePro = computed(() => directoryStore.fontAwesomePro);

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
function getSeverity() {
  if (props.type == "conceptButton") {
    return "secondary";
  }
  return undefined;
}

function show(button: string) {
  return props.buttons.includes(button);
}

function isFavourite(iri: string) {
  return isArrayHasLength(favourites.value) && favourites.value.includes(iri);
}

function updateFavourites(iri: string) {
  userStore.updateFavourites(iri);
}

async function onRunQuery(iri: string) {
  queryRequest.value.query = { "@id": iri } as Query;
  if (await hasParams(iri)) {
    getParams(iri);
    showTestQueryParams.value = true;
  } else {
    showTestQueryResults.value = true;
  }
}

async function onParamsPopulated() {
  showTestQueryParams.value = false;
  showTestQueryResults.value = true;
}
</script>

<style scoped>
.activity-row-button:hover {
  background-color: var(--text-color) !important;
  color: var(--surface-a) !important;
  z-index: 999;
}

.concept-button,
.concept-button-fav {
  height: fit-content;
}

.concept-button:hover {
  background-color: var(--text-color) !important;
  color: var(--surface-a) !important;
}

.concept-button-fav:hover {
  background-color: var(--yellow-500) !important;
  color: var(--surface-a) !important;
}
</style>
