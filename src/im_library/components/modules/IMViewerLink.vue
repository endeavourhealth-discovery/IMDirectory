<template>
  <a v-tooltip.right="'See in viewer app'" class="clickable" @click="directService.view(iri)">{{ label || iri }}</a>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { DirectService, Env } from "../../services";

const props = defineProps({ iri: { type: String, required: true }, label: { type: String, required: false } });

const store = useStore();
const router = useRouter();
const route = useRoute();
const directService = new DirectService(store, router, route);
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
