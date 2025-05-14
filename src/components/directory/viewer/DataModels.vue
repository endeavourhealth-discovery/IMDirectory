<template>
  <div id="content-table-container" class="content-wrapper">
    <DataTable
      :value="dataModels"
      class="concept-data-table p-datatable-sm"
      selectionMode="single"
      dataKey="@id"
      :scrollable="true"
      scrollHeight="flex"
      :loading="loading"
      :lazy="true"
      @row-select="onRowSelect"
    >
      <template #loading> Loading data. Please wait. </template>
      <template #empty> No records found. </template>

      <Column field="name" header="Name">
        <template #body="{ data }: any">
          <div>
            <IMFontAwesomeIcon v-if="data.icon" :icon="data.icon" :style="getColourStyleFromType(data.type)" class="p-mx-1 type-icon" />
            <span @mouseover="showOverlay($event, data['@id'])" @mouseleave="hideOverlay">{{ data.name }}</span>
          </div>
        </template>
      </Column>
      <Column :exportable="false" style="justify-content: flex-end">
        <template #body="{ data }: any">
          <div class="buttons-container">
            <ActionButtons
              v-if="data.iri"
              :buttons="['findInTree', 'view', 'edit', 'favourite']"
              :iri="data['@id']"
              :name="data.name"
              @locate-in-tree="locateInTree"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from "vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { cloneDeep } from "lodash-es";
import { TTIriRef } from "@/interfaces/AutoGen";
import { IM, SHACL } from "@/vocabulary";
import { DataModelService } from "@/services";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useUserStore } from "@/stores/userStore";
import setupOverlay from "@/composables/setupOverlay";
import { getColourFromType } from "@/helpers/ConceptTypeVisuals";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const directoryStore = useDirectoryStore();
const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);
const { OS, showOverlay, hideOverlay } = setupOverlay();

watch(
  () => props.entityIri,
  () => init()
);

watch(
  () => cloneDeep(favourites.value),
  () => {
    if (conceptIsFavourite.value) init();
  }
);

const conceptIsFavourite = computed(() => props.entityIri === IM.FAVOURITES);
const loading = ref(false);
const dataModels: Ref<any[]> = ref([]);

onMounted(async () => await init());

async function init() {
  if (props.entityIri) {
    loading.value = true;
    dataModels.value = await getDMs(props.entityIri);
    loading.value = false;
  }
}

function getColourStyleFromType(types: TTIriRef[]) {
  return "color: " + getColourFromType(types);
}

async function getDMs(iri: string) {
  const dataModels = await DataModelService.getDataModelsFromProperty(iri);
  dataModels.forEach((dm: any) => {
    dm.type = [{ "@id": SHACL.NODESHAPE }];
    dm.icon = ["fa-duotone", "fa-diagram-project"];
  });
  return dataModels;
}

function onRowSelect(event: any) {
  emit("navigateTo", event.data["@id"]);
}

function locateInTree(iri: string) {
  directoryStore.updateFindInTreeIri(iri);
}
</script>

<style scoped>
.buttons-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  row-gap: 0.5rem;
}

.type-icon {
  padding-right: 0.5rem;
}

.row-button:hover {
  background-color: var(--p-textarea-border-color) !important;
  color: var(--p-content-background) !important;
}

.row-button-fav:hover {
  background-color: var(--p-yellow-500) !important;
  color: var(--p-content-background) !important;
}

.content-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}

.scrollbar {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
