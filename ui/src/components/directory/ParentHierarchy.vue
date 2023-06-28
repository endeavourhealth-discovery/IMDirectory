<template>
  <div class="breadcrumb-container">
    <div class="padding-container grid">
      <div class="col-10 table-header">
        <Breadcrumb :home="home" :model="pathItems">
          <template #item="{ item }">
            <div class="p-menuitem" @click="onClick($event, item)">
              <span v-if="item.icon" :class="item.icon"></span>
              <span v-if="item.label" class="p-menuitem-text">{{ item.label }}</span>
            </div>
          </template>
        </Breadcrumb>
        <Menu id="path_overlay_menu" ref="pathOverlayMenu" :model="pathOptions" :popup="true" />
      </div>
      <div class="col-2 header-button-group p-buttonset">
        <Button
          :icon="fontAwesomePro ? 'fa-regular fa-angle-left' : 'pi pi-angle-left'"
          :disabled="!canGoBack"
          class="go-back p-button-rounded p-button-text p-button-plain"
          @click="goBack"
        />
        <Button
          :icon="fontAwesomePro ? 'fa-regular fa-angle-right' : 'pi pi-angle-right'"
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
import { iriToUrl } from "@im-library/helpers/Converters";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { useRoute, useRouter } from "vue-router";
import { useSharedStore } from "@/stores/sharedStore";
import Breadcrumbs from "@/components/shared/Breadcrumbs.vue";
import { MenuItem } from "primevue/menuitem";
import _ from "lodash";

interface Props {
  entityIri: string;
  history: string[];
}
const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true,
  "update:history": (_payload: string[]) => true
});

const router = useRouter();
const route = useRoute();
const sharedStore = useSharedStore();
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const canGoBack = computed(() => props.history.length > 0 && props.history.indexOf(props.entityIri) > 0);
const canGoForward = computed(() => props.history.length > 0 && props.history.indexOf(props.entityIri) < props.history.length - 1);

watch(
  () => props.entityIri,
  () => init()
);

const pathItems: Ref<any[]> = ref([]);
const pathOptions: Ref<any[]> = ref([]);
const folderPath: Ref<TTIriRef[]> = ref([]);

const home = {
  icon: fontAwesomePro.value ? "fa-duotone fa-house-chimney" : "fa-solid fa-house",
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
  if (props.entityIri === IM.NAMESPACE + "Favourites") {
    pathItems.value = [{ label: "Favourites", command: () => emit("navigateTo", IM.NAMESPACE + "Favourites") }];
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

function onClick(event: any, item: MenuItem) {
  if (item.command) item.command({ originalEvent: event, item: item });
}
</script>

<style scoped>
.breadcrumb-container {
  padding: 1rem 1rem 0 1rem;
}

.padding-container {
  background: var(--surface-a);
  border: 1px solid var(--surface-border);
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
  background-color: var(--surface-a);
}

.p-menuitem {
  cursor: pointer;
}
</style>
