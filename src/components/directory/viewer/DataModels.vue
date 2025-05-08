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
import { DataTableRowSelectEvent } from "primevue/datatable";

const props = defineProps<{
  entityIri: string;
}>();

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

interface UIDataModel extends TTIriRef {
  type?: TTIriRef[];
  icon?: string[];
}

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
const dataModels: Ref<UIDataModel[]> = ref([]);

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

async function getDMs(iri: string): Promise<UIDataModel[]> {
  const dataModels = await DataModelService.getDataModelsFromProperty(iri);
  return dataModels.map(dm => {
    return {
      "@id": dm["@id"],
      name: dm.name,
      description: dm.description,
      order: dm.order,
      type: [{ "@id": SHACL.NODESHAPE }],
      icon: ["fa-duotone", "fa-diagram-project"]
    };
  });
}

function onRowSelect(event: DataTableRowSelectEvent<UIDataModel>) {
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

.content-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
