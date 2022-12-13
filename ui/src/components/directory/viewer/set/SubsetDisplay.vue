<template>
  <div v-if="!subsets.length">No subsets found.</div>
  <div v-else v-for="(subset, index) in subsets" :key="index">
    <IMViewerLink :iri="subset['@id']" :label="subset.name" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from "@vue/runtime-core";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";

const props = defineProps({ conceptIri: { type: String, required: true } });
const subsets: Ref<{ "@id": string; name: string }[]> = ref([]);
onMounted(async () => {
  const entity = await EntityService.getPartialEntity(props.conceptIri, [IM.HAS_SUBSET]);
  if (entity[IM.HAS_SUBSET]) subsets.value = entity[IM.HAS_SUBSET].filter((subset: any) => subset["@id"] !== props.conceptIri);
});
</script>

<style scoped></style>
