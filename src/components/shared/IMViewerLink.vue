<template>
  <div
    v-if="html"
    class="flex-auto justify-start"
    @click="click($event)"
    @contextmenu="onNodeContext"
    @mouseleave="hideOverlay"
    @mouseover="showOverlay($event, props.iri)"
    v-html="label"
  ></div>
  <Button
    v-else
    :label="label || iri"
    class="flex-auto justify-start p-0"
    link
    @click="click($event)"
    @contextmenu="onNodeContext"
    @mouseleave="hideOverlay"
    @mouseover="showOverlay($event, props.iri)"
  />
  <ContextMenu ref="vLinkMenu" :model="items" />
  <OverlaySummary ref="OS" />
</template>

<script lang="ts" setup>
import { ref } from "vue";
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
