<template>
  <div class="flex">
    <Button
      v-if="show('findInTree')"
      icon="fa-duotone fa-list-tree"
      :severity="getSeverity()"
      :class="getClass()"
      @click="event => locateInTree(event, iri)"
      v-tooltip.top="'Find in tree'"
      data-testid="select-button"
    />
    <Button
      v-if="show('viewHierarchy')"
      icon="fa-duotone fa-sitemap"
      :severity="getSeverity()"
      :class="getClass()"
      @click.stop="emit('viewHierarchy', iri)"
      v-tooltip.top="'View hierarchy'"
      data-testid="hierarchy-button"
    />
    <Button
      v-if="show('view')"
      icon="fa-duotone fa-up-right-from-square"
      :severity="getSeverity()"
      :class="getClass()"
      @click="event => viewEntity(event, iri)"
      v-tooltip.top="'View'"
      data-testid="view-button"
    />
    <Button
      v-if="show('edit')"
      icon="fa-duotone fa-pen-to-square"
      :severity="getSeverity()"
      :class="getClass()"
      @click="event => toEdit(event, iri)"
      v-tooltip.top="'Edit'"
      data-testid="edit-button"
      :disabled="!editAllowed"
    />
    <Button
      v-if="isLoggedIn && show('favourite') && isFavourite(iri)"
      style="color: var(--p-yellow-500)"
      icon="fa-solid fa-star"
      :severity="getSeverity()"
      :class="getClass()"
      @click="event => updateFavourites(event, iri)"
      v-tooltip.left="'Unfavourite'"
      data-testid="unfavourite-button"
      :loading="loadingFavourites"
    />
    <Button
      v-else-if="isLoggedIn && show('favourite') && !isFavourite(iri)"
      icon="fa-regular fa-star"
      :severity="getSeverity()"
      :class="getClass()"
      @click="event => updateFavourites(event, iri)"
      v-tooltip.left="'Favourite'"
      data-testid="favourite-button"
      :loading="loadingFavourites"
    />
    <Button
      v-if="show('addToList')"
      icon="fa-regular fa-square-plus"
      :severity="getSeverity()"
      :class="getClass()"
      @click.stop="emit('addToList', iri)"
      v-tooltip.top="'Add to list'"
      data-testid="add-button"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { DirectService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { useSharedStore } from "@/stores/sharedStore";
import { useUserStore } from "@/stores/userStore";

const directService = new DirectService();
const sharedStore = useSharedStore();
const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const editAllowed = computed(() => organisations.value.indexOf(props.iri.split("#")[0] + "#") !== -1);

const organisations = computed(() => userStore.organisations);

interface Props {
  buttons: string[];
  iri: string;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "activityRowButton"
});

const emit = defineEmits({
  locateInTree: (_payload: string) => true,
  addToList: (_payload: string) => true,
  viewHierarchy: (_payload: string) => true
});

const loadingFavourites = ref(false);

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

async function updateFavourites(event: any, iri: string) {
  event.stopPropagation();
  loadingFavourites.value = true;
  await userStore.updateFavourites(iri);
  loadingFavourites.value = false;
}

function locateInTree(event: any, iri: string) {
  event.stopPropagation();
  emit("locateInTree", iri);
}

function viewEntity(event: any, iri: string) {
  event.stopPropagation();
  directService.view(iri);
}

function toEdit(event: any, iri: string) {
  event.stopPropagation();
  directService.edit(iri, true);
}
</script>

<style scoped>
.activity-row-button:hover {
  background-color: var(--p-text-color) !important;
  color: var(--p-surface-a) !important;
  z-index: 999;
}

.concept-button,
.concept-button-fav {
  height: fit-content;
}

.concept-button:hover {
  background-color: var(--p-text-color) !important;
  color: var(--p-surface-a) !important;
}

.concept-button-fav:hover {
  background-color: var(--p-yellow-500) !important;
  color: var(--p-surface-a) !important;
}

.p-button.p-button-icon-only.p-button-rounded {
  height: 1.5rem;
  width: 1.5rem;
}
</style>
