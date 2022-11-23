<template>
  <a v-tooltip.right="'See in viewer app'" class="clickable" @click="navigate">{{ label || iri }}</a>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { DirectService, Env } from "../../services";

const props = defineProps({ iri: { type: String, required: true }, label: { type: String, required: false } });

const store = useStore();

const directService = new DirectService(store);

function navigate() {
  directService.directTo(Env.VIEWER_URL, props.iri, "concept");
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
