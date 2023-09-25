<template>
  <a v-if="html" class="clickable" @click="click()" @mouseover="showOverlay($event, props.iri)" @mouseleave="hideOverlay($event)" v-html="label"></a>
  <a v-else class="clickable" @click="click()" @mouseover="showOverlay($event, props.iri)" @mouseleave="hideOverlay($event)">{{ label || iri }}</a>
  <OverlaySummary ref="OS" />
</template>

<script setup lang="ts">
import { DirectService } from "../../services";
import OverlaySummary from "./OverlaySummary.vue";
import setupOverlay from "@/composables/setupOverlay";

interface Props {
  iri: string;
  label?: string;
  action?: string;
  html?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  action: "view",
  html: false
});

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

const { OS, showOverlay, hideOverlay } = setupOverlay();
const directService = new DirectService();

async function click() {
  switch (props.action) {
    case "select":
      emit("navigateTo", props.iri);
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
