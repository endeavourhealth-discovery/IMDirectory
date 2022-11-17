<template>
  <div v-if="!subsets.length">No subsets found.</div>
  <div v-else v-for="(subset, index) in subsets" :key="index">
    <IMViewerLink :iri="subset['@id']" :label="subset.name" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from "@vue/runtime-core";
import { Services, Vocabulary, Interfaces } from "im-library";
import axios from "axios";
const { EntityService } = Services;
const { IM } = Vocabulary;

const props = defineProps({ conceptIri: { type: String, required: true } });
const entityService = new EntityService(axios);
const subsets: Ref<{ "@id": string; name: string }[]> = ref([]);
onMounted(async () => {
  const entity = await entityService.getPartialEntity(props.conceptIri, [IM.HAS_SUBSET]);
  if (entity[IM.HAS_SUBSET]) subsets.value = entity[IM.HAS_SUBSET].filter((subset: any) => subset["@id"] !== props.conceptIri);
});
</script>

<style scoped></style>
