<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Query</strong></span>
      </template>
    </TopBar>
    <div id="query-main-container">
      <RecursiveTableQuery :bool="'and'" :query-data="data" :selected="selected" :level="0" />
    </div>
    <div class="button-bar">
      <Button class="button-bar-button" label="Run" />
      <Button class="button-bar-button" label="View" severity="secondary" @click="visibleDialog = true" />
      <Button class="button-bar-button" label="Save" severity="success" />
    </div>
  </div>
  <Dialog v-model:visible="visibleDialog" modal header="Header" :style="{ width: '50vw' }">
    <VueJsonPretty class="json" :path="'res'" :data="query" @nodeClick="copy" />
  </Dialog>
</template>

<script setup lang="ts">
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import TopBar from "@/components/shared/TopBar.vue";
import { ref, Ref, onMounted } from "vue";
import { queryDefinition } from "./query-json";
import RecursiveTableQuery from "../components/query/RecursiveTableQuery.vue";
import { TableQuery } from "@im-library/interfaces";
import { buildTableQuery } from "@im-library/helpers/TableQueryBuilder";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
const toast = useToast();
const store = useStore();
const selected = ref([] as any[]);
const data: Ref<TableQuery[]> = ref({} as TableQuery[]);
const query: Ref<any> = ref();
const visibleDialog: Ref<boolean> = ref(false);

function getTableQuery() {
  query.value = { ...queryDefinition };
  const tableQuery = buildTableQuery(query.value);
  console.log(tableQuery);
  data.value = tableQuery;
}

onMounted(async () => {
  await store.dispatch("fetchFilterSettings");

  getTableQuery();
});

async function copy() {
  await navigator.clipboard.writeText(JSON.stringify(query.value));
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "JSON value copied to clipboard"));
}
</script>

<style scoped lang="scss">
#topbar-query-container {
  height: 100vh;
  width: 100vw;
  overflow: auto;
  display: flex;
  flex-flow: column;
}
.title {
  font-size: 2rem;
  white-space: nowrap;
}

#query-main-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  background-color: #ffffff;
  display: flex;
  flex-flow: row;
  border: 2px solid #b89241;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}
</style>
