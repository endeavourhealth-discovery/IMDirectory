<template>
  <div class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else>
      <div v-if="defaultText" class="flex flex-row">Default text {{ defaultText }}</div>
      <div v-if="defaultValue != undefined" class="flex flex-row">Default value {{ defaultValue }}</div>
      <div v-if="!isArrayHasLength(mapEntries)">No map entries for this semantic map</div>
      <DataTable v-else :value="displayEntries" scrollHeight="flex" scrollable showGridlines size="small">
        <Column header="Output">
          <template #body="{ data }">
            <span v-if="data[IM.TARGET_TEXT]">{{ data[IM.TARGET_TEXT] }}</span>
          </template>
        </Column>
        <Column header="Data sources">
          <template #body="{ data }">
            <template v-if="data[IM.SOURCE_ENTITY] && isArrayHasLength(data[IM.SOURCE_ENTITY])">
              <template v-for="(source, index) in data[IM.SOURCE_ENTITY]" :key="index">
                <IMViewerLink v-if="source?.iri" :iri="source.iri" :label="source.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </template>
            </template>
          </template>
        </Column>
        <Column header="Source Property">
          <template #body="{ data }">
            <IMViewerLink
              v-if="data[IM.SOURCE_ENTITY_PROPERTY] && data[IM.SOURCE_ENTITY_PROPERTY][0]?.iri"
              :iri="data[IM.SOURCE_ENTITY_PROPERTY][0].iri"
              :label="data[IM.SOURCE_ENTITY_PROPERTY][0].name"
              @navigateTo="(iri: string) => emit('navigateTo', iri)"
            />
            <IMViewerLink
              v-else-if="data[IM.FUNCTION_DEFINITION] && data[IM.FUNCTION_DEFINITION][0]?.iri"
              :iri="data[IM.FUNCTION_DEFINITION][0].iri"
              :label="'function : ' + data[IM.FUNCTION_DEFINITION][0].name"
              @navigateTo="(iri: string) => emit('navigateTo', iri)"
            />
          </template>
        </Column>
        <Column header="Source value property">
          <template #body="{ data }">
            <IMViewerLink
              v-if="data[IM.SOURCE_VALUE_PROPERTY] && data[IM.SOURCE_VALUE_PROPERTY][0]?.iri"
              :iri="data[IM.SOURCE_VALUE_PROPERTY][0].iri"
              :label="data[IM.SOURCE_VALUE_PROPERTY][0].name"
              @navigateTo="(iri: string) => emit('navigateTo', iri)"
            />
          </template>
        </Column>
        <Column header="Range From">
          <template #body="{ data }">
            <span v-if="data[IM.RANGE_FROM] != undefined">{{ data[IM.RANGE_FROM] }}</span>
          </template>
        </Column>
        <Column header="Range To">
          <template #body="{ data }">
            <span v-if="data[IM.RANGE_TO]">{{ data[IM.RANGE_TO] }}</span>
          </template>
        </Column>
        <Column header="Source Text">
          <template #body="{ data }">
            <span v-if="data[IM.SOURCE_TEXT]">{{ data[IM.SOURCE_TEXT] }}</span>
          </template>
        </Column>

        <Column header="Target Value">
          <template #body="{ data }">
            <span v-if="data[IM.TARGET_VALUE] != undefined">{{ data[IM.TARGET_VALUE] }}</span></template
          >
        </Column>
        <template #empty>No map entries found.</template>
      </DataTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref, watch } from "vue";

import { IM } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isArrayOf } from "@endeavour/vue-library/helpers";
import { type TTEntity, TTIriRef, isTTEntity, isTTIriRef } from "@endeavour/vue-library/models";

import { isString } from "lodash-es";
import ProgressSpinner from "primevue/progressspinner";

import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { EntityService } from "@/services";

interface Props {
  entityIri?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const loading = ref(true);
const semanticMap: Ref<TTEntity | undefined> = ref();
const mapEntries: Ref<TTEntity[] | undefined> = ref();
const displayEntries: Ref<TTEntity[]> = ref([]);
const defaultText = computed(() => semanticMap.value?.[IM.DEFAULT_TEXT]);
const defaultValue = computed(() => semanticMap.value?.[IM.DEFAULT_VALUE]);

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
    const rawEntries = semanticMap.value[IM.HAS_MAP_ENTRY];
    if (isArrayOf(rawEntries, isTTEntity)) {
      mapEntries.value = rawEntries;
      if (isArrayHasLength(rawEntries)) {
        displayEntries.value = [];
        for (const entry of rawEntries) {
          if (isString(entry.iri)) displayEntries.value.push(await EntityService.getFullEntity(entry.iri));
        }
      } else {
        mapEntries.value = [];
        displayEntries.value = [];
      }
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
