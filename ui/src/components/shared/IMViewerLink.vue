<template>
  <a v-if="html" class="clickable" @click="click()" @mouseover="showOverlay($event)" @mouseleave="hideOverlay($event)" v-html="label"></a>
  <a v-else class="clickable" @click="click()" @mouseover="showOverlay($event)" @mouseleave="hideOverlay($event)">{{ label || iri }}</a>
  <OverlaySummary ref="OS" />
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { DirectService } from "../../services";
import OverlaySummary from "./OverlaySummary.vue";

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

const OS: Ref<any> = ref();
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
