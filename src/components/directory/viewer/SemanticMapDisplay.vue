<template>
  <div class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else-if="!isArrayHasLength(mapEntries)">No map entries for this semantic map</div>
    <div v-else-if="!mapTypeIri">No map entries found.</div>
    <DataTable v-else :value="displayEntries" scrollHeight="flex" scrollable showGridlines size="small">
      <Column header="Source Entity">
        <template #body="{ data }">
          <IMViewerLink
            v-if="data[IM.SOURCE_ENTITY]?.iri"
            :iri="data[IM.SOURCE_ENTITY].iri"
            :label="data[IM.SOURCE_ENTITY].name"
            @navigateTo="(iri: string) => emit('navigateTo', iri)"
          />
        </template>
      </Column>
      <Column v-if="showSourceType" header="Source Type">
        <template #body="{ data }">
          <IMViewerLink
            v-if="data[IM.SOURCE_TYPE]?.iri"
            :iri="data[IM.SOURCE_TYPE].iri"
            :label="data[IM.SOURCE_TYPE].name"
            @navigateTo="(iri: string) => emit('navigateTo', iri)"
          />
        </template>
      </Column>
      <Column v-if="showSourceProperty" header="Source Property">
        <template #body="{ data }">
          <IMViewerLink
            v-if="data[IM.SOURCE_PROPERTY]?.iri"
            :iri="data[IM.SOURCE_PROPERTY].iri"
            :label="data[IM.SOURCE_PROPERTY].name"
            @navigateTo="(iri: string) => emit('navigateTo', iri)"
          />
        </template>
      </Column>
      <Column v-if="showRangeFrom" header="Range From">
        <template #body="{ data }">{{ data[IM.RANGE_FROM] }}</template>
      </Column>
      <Column v-if="showRangeTo" header="Range To">
        <template #body="{ data }">{{ data[IM.RANGE_TO] }}</template>
      </Column>
      <Column v-if="showSourceText" header="Source Text">
        <template #body="{ data }">{{ data[IM.SOURCE_TEXT] }}</template>
      </Column>
      <Column v-if="showSourceValue" header="Source Value">
        <template #body="{ data }">{{ data[IM.SOURCE_VALUE] }}</template>
      </Column>
      <Column header="Target Text">
        <template #body="{ data }">{{ data[IM.TARGET_TEXT] }}</template>
      </Column>
      <Column header="Target Value">
        <template #body="{ data }">{{ data[IM.TARGET_VALUE] }}</template>
      </Column>
      <template #empty>No map entries found.</template>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref, watch } from "vue";

import { IM } from "@endeavour/vue-library/enums";
import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { ExtendedTTEntity } from "@endeavour/vue-library/interfaces";

import ProgressSpinner from "primevue/progressspinner";

import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { flattenArray } from "@/helpers/UtilityMethods";
import { EntityService } from "@/services";

interface Props {
  entityIri?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const loading = ref(true);
const semanticMap: Ref<ExtendedTTEntity | undefined> = ref();
const mapEntries: Ref<any[] | undefined> = ref();
const displayEntries: Ref<any[]> = ref([]);

const mapTypeIri = ref();

const isDirectMap = computed(() => mapTypeIri.value === IM.DIRECT_MAP);
const isRangeMap = computed(() => mapTypeIri.value === IM.RANGE_VALUE_MAP);
const isExactValueMap = computed(() => mapTypeIri.value === IM.EXACT_VALUE_MAP);

const showSourceType = computed(() => isRangeMap.value || isExactValueMap.value);
const showSourceProperty = computed(() => isRangeMap.value || isExactValueMap.value);
const showRangeFrom = computed(() => isRangeMap.value);
const showRangeTo = computed(() => isRangeMap.value);
const showSourceText = computed(() => isDirectMap.value || isExactValueMap.value);
const showSourceValue = computed(() => isExactValueMap.value);

watch(
  () => props.entityIri,
  async () => {
    await init();
  }
);

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  if (props.entityIri) {
    semanticMap.value = await EntityService.getFullEntity(props.entityIri);
    if (semanticMap.value && semanticMap.value[IM.HAS_MAP_TYPE]) {
      mapTypeIri.value = semanticMap.value[IM.HAS_MAP_TYPE][0].iri;
    }
    const rawEntries = semanticMap.value[IM.MAP_ENTRY];
    mapEntries.value = rawEntries;
    if (isArrayHasLength(rawEntries)) {
      displayEntries.value = rawEntries.map((entry: any) => flattenArray(entry));
    } else {
      displayEntries.value = [];
    }
  }
  loading.value = false;
}
</script>

<style scoped>
.semantic-map-table {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
