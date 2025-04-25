<template>
  <div class="breadcrumb-container">
    <div class="padding-container flex justify-between gap-4">
      <div class="table-header grow">
        <Breadcrumb :home="home" :model="pathItems">
          <template #item="{ item }: { item: any }">
            <div class="p-menuitem" @click="onClick($event, item)">
              <span v-if="item.icon" :class="item.icon"></span>
              <span v-if="item.label" class="p-menuitem-text">{{ item.label }}</span>
            </div>
          </template>
        </Breadcrumb>
        <Menu id="path_overlay_menu" ref="pathOverlayMenu" :model="pathOptions" :popup="true" />
      </div>
      <div class="header-button-group p-buttonset shrink-0">
        <Button icon="fa-regular fa-angle-left" :disabled="!canGoBack" class="go-back p-button-rounded p-button-text p-button-plain" @click="goBack" />
        <Button
          icon="fa-regular fa-angle-right"
          :disabled="!canGoForward"
          class="go-forward p-button-rounded p-button-text p-button-plain"
          @click="goForward"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch, computed } from "vue";
import { EntityService } from "@/services";
import { IM } from "@/vocabulary";
import { TTIriRef } from "@/interfaces/AutoGen";

const props = defineProps<{
  entityIri: string;
  history: string[];
}>();

const emit = defineEmits<{
  navigateTo: [payload: string];
  "update:history": [payload: string[]];
}>();

const canGoBack = computed(() => props.history.length && props.history.indexOf(props.entityIri) !== 0);
const canGoForward = computed(() => props.history.length && props.history.indexOf(props.entityIri) < props.history.length - 1);

watch(
  () => props.entityIri,
  () => init()
);

const pathItems: Ref<any[]> = ref([]);
const pathOptions: Ref<any[]> = ref([]);
const folderPath: Ref<TTIriRef[]> = ref([]);

const home = {
  icon: "fa-duotone fa-house-chimney",
  command: (data: any) => emit("navigateTo", data)
};

const pathOverlayMenu = ref();

onMounted(() => init());

function openPathOverlaymenu(event: any) {
  pathOverlayMenu.value.toggle(event);
}

function goBack() {
  if (canGoBack.value) emit("navigateTo", props.history[props.history.indexOf(props.entityIri) - 1]);
}

function goForward() {
  if (canGoForward.value) emit("navigateTo", props.history[props.history.indexOf(props.entityIri) + 1]);
}

function init() {
  if (props.entityIri) {
    const newHistory: string[] = [...props.history];
    if (!newHistory.includes(props.entityIri)) newHistory.push(props.entityIri);
    emit("update:history", newHistory);
    getPath();
  }
}

async function getPath() {
  if (props.entityIri === IM.FAVOURITES) {
    pathItems.value = [{ label: "Favourites", command: () => emit("navigateTo", IM.FAVOURITES) }];
    return;
  }
  folderPath.value = (await EntityService.getPathBetweenNodes(props.entityIri, IM.MODULE_IM)).reverse();
  if (!folderPath.value.length) folderPath.value = await EntityService.getFolderPath(props.entityIri);
  pathItems.value = folderPath.value.map((iriRef: TTIriRef) => {
    return { label: iriRef.name, command: () => emit("navigateTo", iriRef["@id"]) };
  });
  if (pathItems.value.length > 2) {
    const filteredOutPathItems = pathItems.value.splice(1, pathItems.value.length - 2);
    pathItems.value.splice(pathItems.value.length - 1, 0, {
      label: "...",
      command: () => {
        openPathOverlaymenu(event);
      }
    });
    pathOptions.value = filteredOutPathItems;
  }
}

function onClick(event: any, item: any) {
  if (item.command) item.command({ originalEvent: event, item: item });
}
</script>

<style scoped>
.breadcrumb-container {
  padding: 1rem 1rem 0 1rem;
}

.padding-container {
  background: var(--p-content-background);
  border: 1px solid var(--p-textarea-border-color);
  border-radius: var(--p-textarea-border-radius);
  overflow: a;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: left;
}

.header-button-group {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: right;
}

.go-forward:disabled,
.go-back:disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

.p-breadcrumb {
  border: none;
  padding: 0;
  margin: 0;
  background-color: var(--p-content-background);
}

.p-menuitem {
  cursor: pointer;
}
</style>
