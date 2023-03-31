<template>
  <a class="clickable" @click="click()" @mouseover="showOverlay($event)" @mouseleave="hideOverlay($event)">{{ label || iri }}</a>
  <OverlaySummary ref="OS" />
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { DirectService } from "../../services";
import OverlaySummary from "../directory/viewer/OverlaySummary.vue";

const props = defineProps({
  iri: { type: String, required: true },
  label: { type: String, required: false },
  action: { type: String, required: false, default: "view" }
});
const OS: Ref<any> = ref();
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

async function showOverlay(event: any): Promise<void> {
  await OS.value.showOverlay(event, props.iri);
}

function hideOverlay(event: any): void {
  OS.value.hideOverlay(event);
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
