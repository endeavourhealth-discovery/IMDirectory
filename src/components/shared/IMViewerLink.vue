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
import { ref, watch, onUnmounted } from "vue";
import OverlaySummary from "./OverlaySummary.vue";
import { useOverlay } from "vue-library/composables";
import { cloneDeep } from "lodash-es";
import { useDirectService } from "@/composables/useDirectService";

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

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

onUnmounted(() => {
  hideOverlay();
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
const { OS, showOverlay, hideOverlay } = useOverlay();
const directService = useDirectService();

function onNodeContext(event: MouseEvent) {
  vLinkMenu.value.show(event);
}

async function click(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey || (props.action && props.action === "view")) {
    await directService.view(props.iri);
  } else {
    await directService.select(props.iri);
  }
}
</script>

<style scoped></style>
