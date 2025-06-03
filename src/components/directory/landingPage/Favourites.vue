<template>
  <div class="loading-container flex flex-row items-center justify-center" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else class="favourites-container">
    <div class="flex flex-row flex-nowrap items-center justify-between">
      <span class="title"> Favourites </span>
      <Button @click="confirmClearFavourites" label="Clear favourites" :disabled="!favourites.length" data-testid="clear-favourites-button" />
    </div>
    <div class="datatable-container">
      <DataTable
        :value="favourites"
        v-model:selection="selected"
        selectionMode="single"
        @rowSelect="onRowSelect"
        dataKey="dateTime"
        :scrollable="true"
        scrollHeight="flex"
        class="p-datatable-sm favourites-datatable"
      >
        <template #empty>{{ !currentUser ? "Login to add favourites" : "No favourites" }}</template>
        <Column field="name" header="Name">
          <template #body="{ data }: { data: ExtendedSearchResultSummary }">
            <div class="favourite-name-icon-container">
              <IMFontAwesomeIcon v-if="data.icon" :icon="data.icon" class="recent-icon" :style="data.color" />
              <span class="favourite-name flex-1" @mouseover="showOverlay($event, data.iri)" @mouseleave="hideOverlay">{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="type" header="Type">
          <template #body="{ data }: { data: ExtendedSearchResultSummary }">
            <div class="favourite-type-container flex flex-row">
              <span class="favourite-type flex-1" @mouseover="showOverlay($event, data.iri)" @mouseleave="hideOverlay">{{ data.type }}</span>
            </div>
          </template>
        </Column>
        <Column :exportable="false">
          <template #body="{ data }: { data: ExtendedSearchResultSummary }">
            <div class="action-buttons-container">
              <ActionButtons
                v-if="data.iri"
                :buttons="['findInTree', 'view', 'edit', 'favourite']"
                :iri="data.iri"
                :name="data.name"
                @locate-in-tree="locateInTree"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <OverlaySummary ref="OS" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import { useUserStore } from "@/stores/userStore";
import { ExtendedSearchResultSummary } from "@/interfaces";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { cloneDeep } from "lodash-es";
import { TTIriRef } from "@/interfaces/AutoGen";
import { DirectService, EntityService } from "@/services";
import setupOverlay from "@/composables/setupOverlay";
import { RDF, RDFS } from "@/vocabulary";
import { useDirectoryStore } from "@/stores/directoryStore";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { useConfirm } from "primevue/useconfirm";

const { OS, showOverlay, hideOverlay } = setupOverlay();

const confirm = useConfirm();
const directService = new DirectService();
const directoryStore = useDirectoryStore();
const userStore = useUserStore();
const userFavourites = computed(() => userStore.favourites);
const currentUser = computed(() => userStore.currentUser);

const selected: Ref<ExtendedSearchResultSummary> = ref({} as ExtendedSearchResultSummary);
const favourites: Ref<ExtendedSearchResultSummary[]> = ref([]);
const loading: Ref<boolean> = ref(false);

watch(
  () => cloneDeep(userFavourites.value),
  async () => await getFavouritesDetails()
);

onMounted(async () => await init());

async function init(): Promise<void> {
  loading.value = true;
  await getFavouritesDetails();
  loading.value = false;
}

async function onRowSelect(event: { data: ExtendedSearchResultSummary }) {
  await directService.select(event.data.iri);
}

async function locateInTree(iri: string) {
  await directoryStore.updateFindInTreeIri(iri);
}

async function getFavouritesDetails() {
  const results = await EntityService.getPartialEntities(userFavourites.value, [RDFS.LABEL, RDF.TYPE]);
  if (!results?.length) {
    favourites.value = [];
    return;
  }
  const temp: ExtendedSearchResultSummary[] = [];
  for (const result of results) {
    const clone: ExtendedSearchResultSummary = {} as ExtendedSearchResultSummary;
    if (result && isObjectHasKeys(result, [RDF.TYPE, RDFS.LABEL, "iri"])) {
      if (result.iri) clone.iri = result.iri;
      clone.name = result[RDFS.LABEL];
      clone.type = result[RDF.TYPE].map((type: TTIriRef) => type.name).join(", ");
      clone.icon = getFAIconFromType(result[RDF.TYPE]);
      clone.color = "color:" + getColourFromType(result[RDF.TYPE]);
    }
    temp.push(clone);
  }
  favourites.value = temp;
}

function confirmClearFavourites() {
  confirm.require({
    message: "Are you sure you want to clear favourites?",
    header: "Clear favourites",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Clear",
      severity: "danger"
    },
    accept: async () => {
      await clearFavourites();
    }
  });
}

async function clearFavourites() {
  await userStore.clearFavourites();
}
</script>

<style scoped>
.loading-container {
  width: 100%;
}

.favourites-datatable {
  width: 100%;
}

.favourites-container {
  flex: 0 0 auto;
  display: flex;
  width: 100%;
  flex-flow: column nowrap;
  overflow: auto;
  padding: 1rem;
}

.datatable-container {
  flex: 1 1 auto;
  overflow: auto;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.recent-icon {
  height: 1rem;
  font-size: 1rem;
}

.action-buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.favourite-name-icon-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow: auto;
  gap: 0.25rem;
}
</style>
