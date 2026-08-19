<template>
  <div class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else>
      <div v-if="semanticMap.defaultText" class="flex flex-row">Default text {{ semanticMap.defaultText }}</div>
      <div v-if="semanticMap.defaultValue != undefined" class="flex flex-row">Default value {{ semanticMap.defaultValue }}</div>
      <div v-if="semanticMap.sourceType">Source type {{ semanticMap.sourceType.name }}</div>
      <div v-if="!mapEntries">No map entries for this semantic map</div>
      <div v-if="semanticMap.sourceEntityProperty">
        <IMViewerLink
          :iri="semanticMap.sourceEntityProperty.iri"
          :label="semanticMap.sourceEntityProperty.name"
          @navigateTo="(iri: string) => emit('navigateTo', iri)"
        />
      </div>
      <div v-if="semanticMap.sourceValueProperty">
        <IMViewerLink
          :iri="semanticMap.sourceValueProperty.iri"
          :label="semanticMap.sourceValueProperty.name"
          @navigateTo="(iri: string) => emit('navigateTo', iri)"
        />
      </div>
      <div v-if="semanticMap.function">
        <IMViewerLink
          :iri="semanticMap.function.iri"
          :label="'function : ' + semanticMap.function.name"
          @navigateTo="(iri: string) => emit('navigateTo', iri)"
        />
      </div>
      <DataTable v-else :value="mapEntries" scrollHeight="flex" scrollable showGridlines size="small">
        <Column header="Target text">
          <template #body="{ data }">
            <span v-if="data.targetText">{{ data.targetText }}</span>
          </template>
        </Column>
        <Column header="Data sources">
          <template #body="{ data }">
            <template v-if="data.sourceEntity">
              <IMViewerLink
                v-if="data.sourceEntity?.iri"
                :iri="data.sourceEntity.iri"
                :label="data.sourceEntity.name"
                @navigateTo="(iri: string) => emit('navigateTo', iri)"
              />
            </template>
          </template>
        </Column>
        <Column header="Source Property">
          <template #body="{ data }">
            <IMViewerLink
              v-if="data.sourceEntityProperty"
              :iri="data.sourceEntityProperty.iri"
              :label="data.sourceEntityProperty.name"
              @navigateTo="(iri: string) => emit('navigateTo', iri)"
            />
            <IMViewerLink
              v-else-if="data.function"
              :iri="data.function.iri"
              :label="'function : ' + data.function.name"
              @navigateTo="(iri: string) => emit('navigateTo', iri)"
            />
          </template>
        </Column>
        <Column header="Source value property">
          <template #body="{ data }">
            <IMViewerLink
              v-if="data.sourceValueProperty"
              :iri="data.sourceValueProperty.iri"
              :label="data.sourceValueProperty.name"
              @navigateTo="(iri: string) => emit('navigateTo', iri)"
            />
          </template>
        </Column>
        <Column header="Range From">
          <template #body="{ data }">
            <span v-if="data.rangeFrom != undefined">{{ data.rangeFrom }}</span>
          </template>
        </Column>
        <Column header="Range To">
          <template #body="{ data }">
            <span v-if="data.rangeTo != undefined">{{ data.rangeTo }}</span>
          </template>
        </Column>

        <Column header="Target Value">
          <template #body="{ data }">
            <span v-if="data.targetValue != undefined">{{ data.targetValue }}</span></template
          >
        </Column>
        <template #empty>No map entries found.</template>
      </DataTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import ProgressSpinner from "primevue/progressspinner";

import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { SemanticMap, SemanticMapEntry } from "@/models";

interface Props {
  semanticMap: SemanticMap;
  mapEntries?: SemanticMapEntry[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const loading = ref(true);
onMounted(async () => {
  loading.value = false;
});
</script>

<style scoped></style>
