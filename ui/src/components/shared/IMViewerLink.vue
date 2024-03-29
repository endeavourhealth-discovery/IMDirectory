<template>
  <div
    v-if="html"
    :class="getClass()"
    @click="click()"
    @mouseover="showOverlay($event, props.iri)"
    @mouseleave="hideOverlay($event)"
    v-html="label"
    @contextmenu="onNodeContext"
  ></div>
  <div v-else :class="getClass()" @click="click()" @mouseover="showOverlay($event, props.iri)" @mouseleave="hideOverlay($event)" @contextmenu="onNodeContext">
    {{ label || iri }}
  </div>
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

function getClass() {
  const clasz = "clickable ";
  if (props.action === "select") return clasz;
  else return clasz + "link";
}

function onNodeContext(event: any) {
  vLinkMenu.value.show(event);
}

async function click() {
  emit("navigateTo", props.iri);
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
}

.link {
  text-decoration: none;
  color: #2196f3;
}
</style>
