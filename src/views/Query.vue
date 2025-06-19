<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Query</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="query-main-container">
      <div id="query-content-container">
        <div v-if="loading" class="loading-container">
          <ProgressSpinner />
        </div>
        <IMQueryEditor v-else v-model:queryDefinition="queryDefinition" />
      </div>
      <div id="query-footer-bar">
        <Button class="button-bar-button" label="Run" />
        <Button class="button-bar-button" label="View" severity="secondary" />
        <Button class="button-bar-button" label="Save" severity="success" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "vue-json-pretty/lib/styles.css";
import TopBar from "@/components/shared/TopBar.vue";
import { Match, Query } from "@/interfaces/AutoGen";
import { ComputedRef, Ref, computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { resolveIri } from "@/helpers/TTTransform";
import { QueryService } from "@/services";
import IMQueryEditor from "@/components/imquery/IMQueryEditor.vue";
import { useFilterStore } from "@/stores/filterStore";

const route = useRoute();
const queryIri: ComputedRef<string> = computed(() => route.params.queryIri as string);
const queryDefinition: Ref<Query> = ref({ match: [] as Match[] } as Query);
const loading = ref(true);
const filterStore = useFilterStore();

onBeforeMount(async () => {
  await filterStore.fetchFilterSettings();
});

onMounted(async () => {
  await init();
});

watch(
  () => queryIri.value,
  async () => await init()
);

async function init() {
  await setQuery();
  loading.value = false;
}

async function setQuery() {
  const resolvedIri = resolveIri(queryIri.value);
  if (resolvedIri) queryDefinition.value = await QueryService.getQueryDisplay(resolvedIri, false);
}
</script>

<style lang="scss" scoped>
#topbar-query-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column;
}

#query-main-container {
  height: calc(100% - 3.5rem);
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

#query-content-container {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

#query-footer-bar {
  flex: 0 0 auto;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
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
</style>
