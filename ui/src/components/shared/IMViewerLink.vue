<template>
  <div
    v-if="html"
    class="flex-auto justify-start"
    @click="click($event)"
    @mouseover="showOverlay($event, props.iri)"
    @mouseleave="hideOverlay"
    v-html="label"
    @contextmenu="onNodeContext"
  ></div>
  <Button
    v-else
    link
    class="flex-auto justify-start"
    :label="label || iri"
    @click="click($event)"
    @mouseover="showOverlay($event, props.iri)"
    @mouseleave="hideOverlay"
    @contextmenu="onNodeContext"
  />
  <ContextMenu ref="vLinkMenu" :model="items" />
  <OverlaySummary ref="OS" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { DirectService } from "../../services";
import OverlaySummary from "./OverlaySummary.vue";
import setupOverlay from "@/composables/setupOverlay";

interface Props {
  iri: string;
  label?: string;
  action?: "view" | "select";
  html?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  action: "view",
  html: false
});

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

const vLinkMenu = ref();
const items = ref([
  { label: "Select", icon: "fa-duotone fa-list-tree", command: () => emit("navigateTo", props.iri) },
  {
    label: "View",
    icon: "fa-duotone fa-up-right-from-square",
    command: () => directService.view(props.iri)
  }
]);
const { OS, showOverlay, hideOverlay } = setupOverlay();
const directService = new DirectService();

function onNodeContext(event: any) {
  vLinkMenu.value.show(event);
}

async function click(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey) {
    directService.view(props.iri);
  } else {
    directService.select(props.iri);
  }
}
</script>

<style scoped></style>
