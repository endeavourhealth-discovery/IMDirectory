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
    {{ query }}
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { ref, Ref, onMounted } from "vue";
import { queryDefinition } from "./query-json";
import RecursiveTableQuery from "../components/query/RecursiveTableQuery.vue";
import { TableQuery } from "@im-library/interfaces";
import { buildTableQuery } from "@im-library/helpers/TableQueryBuilder";
import { useStore } from "vuex";

const store = useStore();
const selected = ref([] as any[]);
const data: Ref<TableQuery[]> = ref({} as TableQuery[]);
const query: Ref<any> = ref();

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
</style>
