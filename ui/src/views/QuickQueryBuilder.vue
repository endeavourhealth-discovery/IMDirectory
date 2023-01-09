<template>
  <div id="topbar-quick-query-builder-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Quick Query Builder</strong></span>
        </div>
      </template>
    </TopBar>
    <ConfirmDialog />
    <div id="quick-query-builder-main-container">
      <div class="content-buttons-container">
        <div class="content-sidebar-container">
          <div v-if="loading" class="loading-container">
            <ProgressSpinner />
          </div>
          <div v-else class="steps-content">
            <SimpleQueryBuilder @updateQuery="onUpdateQuery" />
          </div>
          <Divider v-if="showSidebar" layout="vertical" />
          <div v-if="showSidebar" class="sidebar-container">
            <SideBar :editorEntity="queryObject" />
          </div>
          <Button
            class="p-button-rounded p-button-info p-button-outlined sidebar-toggle"
            :label="showSidebar ? 'hide sidebar' : 'show sidebar'"
            @click="onShowSidebar"
          />
        </div>
        <div class="button-bar" id="creator-button-bar">
          <Button icon="pi pi-refresh" label="Reset" class="p-button-warning" @click="refreshCreator" />
          <Button icon="pi pi-check" label="Create" class="p-button-success save-button" @click="submit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, watch, ComputedRef } from "vue";
import SideBar from "@/components/editor/SideBar.vue";
import SimpleQueryBuilder from "@/components/editor/shapeComponents/SimpleQueryBuilder.vue";
import TopBar from "@/components/shared/TopBar.vue";
import _ from "lodash";
import { useStore } from "vuex";
import { DataTypeCheckers } from "@im-library/helpers";
import { Query, SuggestionInfo, TreeTableItem } from "@im-library/interfaces";

const { isObjectHasKeys, isArrayHasLength } = DataTypeCheckers;
const store = useStore();
const suggestionInfo: ComputedRef<SuggestionInfo> = computed(() => store.state.suggestionInfo);
const queryObject: Ref<any> = ref();
const loading: Ref<boolean> = ref(false);
const showSidebar: Ref<boolean> = ref(false);

watch(
  () => suggestionInfo.value,
  (newValue, oldValue) => {
    if (isObjectHasKeys(newValue)) showSidebar.value = true;
  }
);

function onShowSidebar() {
  showSidebar.value = !showSidebar.value;
  store.commit("updateFindInEditorTreeIri", "");
}

function refreshCreator() {}

function submit() {}
function onUpdateQuery(query: Query) {
  queryObject.value = query;
}
</script>

<style scoped>
#topbar-quick-query-builder-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}

#quick-query-builder-main-container {
  height: calc(100% - 3.5rem);
  width: 100%;
  overflow: auto;
  background-color: #ffffff;
}

.content-buttons-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

.content-sidebar-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  overflow: hidden;
  position: relative;
}

.steps-content {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

.sidebar-container {
  width: 50vw;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding-top: 3rem;
}

.sidebar-toggle {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #ffffff !important;
}

.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}

.button-bar {
  flex: 0 1 auto;
  padding: 1rem 1rem 1rem 0;
  gap: 0.5rem;
  width: 100%;
  border-bottom: 1px solid #dee2e6;
  border-left: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
  border-radius: 3px;
  background-color: #ffffff;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}
</style>
