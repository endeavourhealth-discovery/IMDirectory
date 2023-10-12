<template>
  <div class="flex">
    <QuickQuery v-if="show('quickQuery')" :query-iri="iri">
      <template #button="{ runQuickQuery }">
        <Button
          :icon="'fa-solid fa-bolt'"
          :severity="getSeverity()"
          :class="getClass()"
          v-tooltip.top="'Run query'"
          id="quick-query-button"
          @click="runQuickQuery()"
        />
      </template>
    </QuickQuery>
    <Button
      v-if="show('findInTree')"
      :icon="fontAwesomePro ? 'fa-duotone fa-list-tree' : 'fa-solid fa-sitemap'"
      :severity="getSeverity()"
      :class="getClass()"
      @click="locateInTree(iri)"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DirectService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { useSharedStore } from "@/stores/sharedStore";
import { useUserStore } from "@/stores/userStore";
import QuickQuery from "@/components/query/QuickQuery.vue";

const directService = new DirectService();
const sharedStore = useSharedStore();
const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

interface Props {
  buttons: string[];
  iri: string;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "activityRowButton"
});

const emit = defineEmits({
  locateInTree: (_payload: string) => true
});

function getClass() {
  const activityRowButton = "p-button-rounded p-button-text p-button-plain activity-row-button ";
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

function locateInTree(iri: string) {
  emit("locateInTree", iri);
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

.p-button.p-button-icon-only.p-button-rounded {
  height: 1.5rem;
  width: 1.5rem;
}
</style>
