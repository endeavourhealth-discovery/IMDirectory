<template>
  <a v-tooltip.right="'See in viewer app'" class="clickable" @click="navigate">{{ label || iri }}</a>
</template>

<script setup lang="ts">
import { DirectService, Env } from "../../services";

const props = defineProps({ iri: { type: String, required: true }, label: { type: String, required: false } });

function navigate() {
  DirectService.directTo(Env.VIEWER_URL, props.iri, "concept");
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
