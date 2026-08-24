<template>
  <div class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else>
      <div v-if="semanticMap.defaultText" class="flex flex-row">Default text {{ semanticMap.defaultText }}</div>
      <div v-if="semanticMap.defaultValue != undefined" class="flex flex-row">Default value {{ semanticMap.defaultValue }}</div>
      <div v-if="semanticMap.sourceType">Source type {{ semanticMap.sourceType.name }}</div>
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

      <div v-if="!mapEntries">No map entries for this semantic map</div>
      <DataTable v-else :value="mapEntries" scrollHeight="flex" scrollable showGridlines size="small">
        <Column header="Output">
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
import { Ref, onMounted, ref, watch } from "vue";

import ProgressSpinner from "primevue/progressspinner";

import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { SemanticMap, type SemanticMapEntry } from "@/models";
import { DataModelService } from "@/services";

interface Props {
  entityIri?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const loading = ref(true);
const semanticMap: Ref<SemanticMap> = ref({} as SemanticMap);
const mapEntries: Ref<SemanticMapEntry[] | undefined> = ref();

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
    semanticMap.value = await DataModelService.getSemanticMap(props.entityIri);
    mapEntries.value = semanticMap.value?.entries;
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
