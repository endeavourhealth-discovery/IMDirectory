<template>
  <a v-tooltip.right="'See in viewer app'" class="clickable" @click="directService.view(iri)">{{ label || iri }}</a>
</template>

<script setup lang="ts">
import { DirectService } from "../../services";

const props = defineProps({ iri: { type: String, required: true }, label: { type: String, required: false } });

const directService = new DirectService();
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
