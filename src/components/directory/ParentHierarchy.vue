<template>
  <div class="breadcrumb-container">
    <div class="padding-container grid">
      <div class="col-10 table-header">
        <Breadcrumb :home="home" :model="pathItems" />
        <Menu id="path_overlay_menu" ref="pathOverlayMenu" :model="pathOptions" :popup="true" />
      </div>
      <div class="col-2 header-button-group p-buttonset">
        <Button icon="pi pi-angle-left" :disabled="canGoBack" class="go-back p-button-rounded p-button-text p-button-plain" @click="goBack" />
        <Button icon="pi pi-angle-right" :disabled="canGoForward" class="go-forward p-button-rounded p-button-text p-button-plain" @click="goForward" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, Ref, watch } from "vue";
import { Helpers, Vocabulary, Services } from "im-library";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
const { IM } = Vocabulary;
const {
  Converters: { iriToUrl }
} = Helpers;
const { EntityService } = Services;

const props = defineProps({ conceptIri: { type: String, required: true } });

const router = useRouter();
const route = useRoute();
const entityService = new EntityService(axios);

watch(
  () => props.conceptIri,
  () => init()
);

const pathItems: Ref<any[]> = ref([]);
const pathOptions: Ref<any[]> = ref([]);
const canGoBack = ref(false);
const canGoForward = ref(false);

const home = { icon: "pi pi-home", to: "/" };

const pathOverlayMenu = ref();

onMounted(() => init());

function openPathOverlaymenu(event: any) {
  pathOverlayMenu.value.toggle(event);
}

function goBack() {
  if (window.history.length > 0) router.back();
}

function goForward() {
  if (window.history.length > window.history.state.position + 1) router.forward();
}

function init() {
  if (props.conceptIri) {
    getPath();
    setBackForwardDisables();
  }
}

async function getPath() {
  if (props.conceptIri === IM.NAMESPACE + "Favourites") {
    pathItems.value = [{ label: "Favourites", to: iriToUrl(IM.NAMESPACE) + "Favourites" }];
    return;
  }
  let folderPath = (await entityService.getPathBetweenNodes(props.conceptIri, IM.MODULE_IM)).reverse();
  if (!folderPath.length) folderPath = await entityService.getFolderPath(props.conceptIri);
  pathItems.value = folderPath.map((iriRef: TTIriRef) => {
    return { label: iriRef.name, to: iriToUrl(iriRef["@id"]) };
  });
  if (pathItems.value.length > 2) {
    const filteredOutPathItems = pathItems.value.splice(1, pathItems.value.length - 2);
    pathItems.value.splice(pathItems.value.length - 1, 0, {
      label: "...",
      to: route.fullPath,
      command: () => {
        openPathOverlaymenu(event);
      }
    });
    pathOptions.value = filteredOutPathItems;
  }
}

function setBackForwardDisables() {
  canGoForward.value = window.history.length === window.history.state.position + 1;
  canGoBack.value = window.history.state.position === 0;
}
</script>

<style scoped>
.breadcrumb-container {
  padding: 1rem 1rem 0 1rem;
}

.padding-container {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
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
  background-color: #f8f9fa;
}
</style>
