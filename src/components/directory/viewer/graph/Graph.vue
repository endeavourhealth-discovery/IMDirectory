<template>
  <div class="graph-predicates-container">
    <MultiSelect
      v-model="selectedPredicates"
      @change="updatePredicates"
      :options="options"
      option-label="name"
      placeholder="Select predicates"
      data-testid="selectedPredicates"
    />
    <div class="loading-container" v-if="loading">
      <ProgressSpinner />
    </div>
    <GraphComponent v-else :data="data" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import GraphComponent from "./GraphComponent.vue";
import { TTGraphData, TTBundle } from "@/interfaces";
import { GraphTranslator, DataTypeCheckers } from "@/helpers";
import { EntityService } from "@/services";
import { IM } from "@/vocabulary";
const { translateFromEntityBundle } = GraphTranslator;
const { isObjectHasKeys } = DataTypeCheckers;

const props = defineProps<{
  entityIri: string;
}>();

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

watch(
  () => props.entityIri,
  async newValue => await getEntityBundle(newValue)
);

const loading = ref(false);
const data: Ref<TTGraphData> = ref({} as TTGraphData);
const selectedPredicates: Ref<{ iri: string; name: string }[]> = ref([]);
const selectedIris: Ref<string[]> = ref([]);
const predicatesIris: Ref<string[]> = ref([]);
const bundle: Ref<TTBundle> = ref({} as TTBundle);
const options: Ref<{ iri: string; name: string }[]> = ref([]);

const graphExcludePredicates: Ref<string[]> = ref([]);

onMounted(async () => {
  const result = await EntityService.getEntityChildren(IM.GRAPH_EXCLUDE_PREDICATES);
  if (result) graphExcludePredicates.value = result.map(r => r["@id"]);
  await getEntityBundle(props.entityIri);
});

async function updatePredicates() {
  selectedIris.value = [];
  selectedPredicates.value.forEach(i => {
    selectedIris.value.push(i.iri);
  });
  data.value = translateFromEntityBundle(bundle.value, selectedIris.value);
}

async function getEntityBundle(iri: string) {
  loading.value = true;
  bundle.value = await EntityService.getBundleByPredicateExclusions(iri, [IM.HAS_MEMBER]);
  const hasMember = await EntityService.getPartialAndTotalCount(iri, IM.HAS_MEMBER, 1, 10);
  if (isObjectHasKeys(hasMember, ["totalCount"]) && hasMember.totalCount !== 0) {
    bundle.value.entity[IM.HAS_MEMBER] = hasMember.result;
    bundle.value.predicates[IM.HAS_MEMBER] = "has member";
  }
  if (hasMember.totalCount >= 10) {
    bundle.value.entity[IM.HAS_MEMBER] = bundle.value.entity[IM.HAS_MEMBER].concat({ "@id": "seeMore", name: "see more..." });
  }
  predicatesIris.value = Object.keys(bundle.value.entity).filter(value => value !== "@id");
  predicatesIris.value.forEach(i => {
    if (!graphExcludePredicates.value.find(gep => gep === i)) options.value.push({ iri: i, name: bundle.value.predicates[i] });
  });
  selectedPredicates.value = options.value.filter(value => !graphExcludePredicates.value.find(gep => gep === value.iri));
  selectedPredicates.value.forEach(i => {
    selectedIris.value.push(i.iri);
  });
  data.value = translateFromEntityBundle(bundle.value, selectedIris.value);
  loading.value = false;
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.graph-predicates-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
}
</style>
