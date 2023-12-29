<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Query</strong></span>
        </div>
      </template>
    </TopBar>
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <CohortEditor v-else v-model:queryDefinition="queryDefinition" />

    <div class="button-bar">
      <Button class="button-bar-button" label="Run" />
      <Button class="button-bar-button" label="View" severity="secondary" />
      <Button class="button-bar-button" label="Save" severity="success" />
    </div>
  </div>
</template>

<script setup lang="ts">
import "vue-json-pretty/lib/styles.css";
import TopBar from "@/components/shared/TopBar.vue";
import _ from "lodash";
import CohortEditor from "@/components/query/builder/CohortEditor.vue";
import { Match, Query } from "@im-library/interfaces/AutoGen";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useFilterStore } from "@/stores/filterStore";
import { resolveIri } from "@im-library/helpers/TTTransform";
import { QueryService } from "@/services";

const filterStore = useFilterStore();
const route = useRoute();
const queryIri: ComputedRef<string> = computed(() => route.params.queryIri as string);
const queryDefinition: Ref<Query> = ref({ match: [] as Match[] } as Query);
const loading = ref(true);

onMounted(async () => {
  await filterStore.fetchFilterSettings();
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
  if (resolvedIri) queryDefinition.value = await QueryService.getQueryDisplay(resolvedIri);
}
</script>

<style lang="scss">
#topbar-query-container {
  height: 100vh;
  width: 100vw;
  overflow: auto;
  display: flex;
  flex-flow: column;
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

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}
</style>
