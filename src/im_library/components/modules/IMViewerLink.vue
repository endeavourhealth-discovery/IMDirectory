<template>
  <a class="clickable" @click="click()">{{ label || iri }}</a>
</template>

<script setup lang="ts">
import { DirectService } from "../../services";

const props = defineProps({
  iri: { type: String, required: true },
  label: { type: String, required: false },
  action: { type: String, required: false, default: "view" }
});

const directService = new DirectService();

async function click() {
  switch (props.action) {
    case "select":
      directService.select(props.iri);
      break;
    case "view":
      directService.view(props.iri);
      break;
    case "edit":
      directService.edit(props.iri);
      break;
    default:
      directService.view(props.iri);
      break;
  }
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
