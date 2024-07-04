<template>
  <Viewer
    v-if="detailsIri"
    :entityIri="detailsIri"
    @navigateTo="
      (iri: string) => {
        detailsIri = iri;
      }
    "
  />
  <!-- TODO: Component with 2 subcombonents - one for search results(SearchResults?+EclSearch?+IMQuerySearch?)/details(DirectoryDetails?) and one for selected list(ConceptSelect?) -->
</template>

<script setup lang="ts">
import Viewer from "@/components/directory/Viewer.vue";
import { QueryRequest } from "@im-library/interfaces/AutoGen";
import { Ref } from "vue";
import { ref } from "vue";
import { onMounted, watch } from "vue";
interface Props {
  selectedIri: string;
  searchTerm: string;
  imQuery: QueryRequest | undefined;
}

const emit = defineEmits({ navigateTo: (payload: string) => payload });
const props = defineProps<Props>();
const detailsIri: Ref<string> = ref("");

watch(
  () => props.selectedIri,
  () => {
    detailsIri.value = props.selectedIri;
  }
);

onMounted(() => init());

function init() {
  detailsIri.value = props.selectedIri;
}
</script>

<style scoped></style>
