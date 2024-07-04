<template>
  <!-- TODO: Component with 2 subcombonents - one for search results(SearchResults?+EclSearch?+IMQuerySearch?)/details(DirectoryDetails?) and one for selected list(ConceptSelect?) -->
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
interface Props {
  msg?: string;
}
const props = withDefaults(defineProps<Props>(), {
  msg: "hello"
});

onMounted(async () => {});
</script>

<style scoped></style>
