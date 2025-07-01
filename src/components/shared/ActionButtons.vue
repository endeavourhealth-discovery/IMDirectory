<template>
  <div class="flex items-center gap-1">
    <Button
      v-if="show('findInTree')"
      icon="fa-duotone fa-list-tree"
      :severity="getSeverity()"
      :class="getClass()"
      @click="(event: MouseEvent) => locateInTree(event, iri)"
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
      @click="(event: MouseEvent) => viewEntity(event, iri)"
      v-tooltip.top="'View'"
      data-testid="view-button"
    />
    <Button
      v-if="show('edit')"
      icon="fa-duotone fa-pen-to-square"
      :severity="getSeverity()"
      :class="getClass()"
      @click="(event: MouseEvent) => toEdit(event, iri)"
      v-tooltip.top="'Edit'"
      data-testid="edit-button"
      :disabled="!editAllowed"
    />
    <Button
      v-if="show('download')"
      icon="fa-duotone fa-download"
      :severity="getSeverity()"
      :class="getClass()"
      @click="confirmDownload()"
      v-tooltip.left="'Download'"
      data-testid="download-button"
    />
    <Button
      v-if="isLoggedIn && show('favourite') && isFavourite(iri) && !loadingFavourites"
      style="color: var(--p-yellow-500)"
      icon="fa-solid fa-star"
      :severity="getSeverity()"
      :class="getClass()"
      class="fav"
      @click="(event: MouseEvent) => updateFavourites(event, iri)"
      v-tooltip.right="{
        value: 'Unfavourite'
      }"
      data-testid="unfavourite-button"
      :loading="loadingFavourites"
    />
    <Button
      v-if="isLoggedIn && show('favourite') && loadingFavourites"
      style="color: var(--p-yellow-500)"
      icon="fa-solid fa-star"
      :severity="getSeverity()"
      :class="getClass()"
      class="fav"
      @click="(event: MouseEvent) => updateFavourites(event, iri)"
      data-testid="unfavourite-button"
      :loading="loadingFavourites"
    />
    <Button
      v-else-if="isLoggedIn && show('favourite') && !isFavourite(iri) && !loadingFavourites"
      icon="fa-regular fa-star"
      :severity="getSeverity()"
      :class="getClass()"
      @click="(event: MouseEvent) => updateFavourites(event, iri)"
      v-tooltip.left="{
        value: 'Favourite'
      }"
      data-testid="favourite-button"
      :loading="loadingFavourites"
    />
    <Button v-if="show('addToList')" label="Add" @click.stop="emit('addToList', iri)" v-tooltip.top="'Add to list'" data-testid="add-button" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { DirectService, EntityService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { useUserStore } from "@/stores/userStore";
import { useDialog } from "primevue/usedialog";
import { useConfirm } from "primevue/useconfirm";
import setupDownloadFile from "@/composables/downloadFile";
import LoadingDialog from "./dynamicDialogs/LoadingDialog.vue";

const directService = new DirectService();
const confirmDlg = useConfirm();
const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const editAllowed = ref(false);

const organisations = computed(() => userStore.organisations);

interface Props {
  buttons: string[];
  iri: string;
  name?: string;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "activityRowButton"
});

const emit = defineEmits<{
  locateInTree: [payload: string];
  addToList: [payload: string];
  viewHierarchy: [payload: string];
}>();

onMounted(() => {
  if (props.iri && props.iri.includes("#")) editAllowed.value = organisations.value.includes(props.iri.split("#")[0] + "#");
});

const dynamicDialog = useDialog();
const { downloadFile } = setupDownloadFile(window, document);

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

async function updateFavourites(event: MouseEvent, iri: string) {
  event.stopPropagation();
  loadingFavourites.value = true;
  await userStore.updateFavourites(iri);
  loadingFavourites.value = false;
}

function locateInTree(event: MouseEvent, iri: string) {
  event.stopPropagation();
  emit("locateInTree", iri);
}

async function viewEntity(event: MouseEvent, iri: string) {
  event.stopPropagation();
  await directService.view(iri);
}

async function toEdit(event: MouseEvent, iri: string) {
  event.stopPropagation();
  await directService.edit(iri, true);
}

function confirmDownload() {
  confirmDlg.require({
    message: 'Are you sure you want to download "' + props.name + '" (' + props.iri + ")?",
    header: "Download",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Download"
    },
    accept: async () => {
      confirmDlg.close();
      await download();
    },
    reject: () => confirmDlg.close()
  });
}

async function download(): Promise<void> {
  const downloadDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Downloading", text: "Preparing your download..." }
  });
  const result = await EntityService.downloadEntity(props.iri);
  if (result) downloadFile(result, props.name + "_" + new Date().toJSON().slice(0, 10).replace(/-/g, "/") + ".json");
  downloadDialog.close();
}
</script>

<style scoped>
.activity-row-button:hover {
  background-color: var(--p-text-color) !important;
  color: var(--p-content-background) !important;
  z-index: 999;
}

.concept-button,
.concept-button-fav {
  height: fit-content;
}

.concept-button:hover {
  background-color: var(--p-text-color) !important;
  color: var(--p-content-background) !important;
}

.fav:hover {
  background-color: var(--p-yellow-500) !important;
  color: var(--p-content-background) !important;
}

.p-button.p-button-icon-only.p-button-rounded {
  height: 1.5rem;
  width: 1.5rem;
}
</style>
