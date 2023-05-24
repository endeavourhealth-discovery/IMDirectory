<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Query</strong></span>
      </template>
    </TopBar>

    <div class="include-title" style="color: green">include if</div>
    <RecursiveQueryDisplay
      v-if="isArrayHasLength(query.match)"
      :matches="query.match.filter((match: Match) => !isObjectHasKeys(match, ['exclude']))"
      :full-query="query"
    />
    <RecursiveQueryDisplay
      v-if="isArrayHasLength(query.match)"
      :matches="query.match.filter((match: Match) => isObjectHasKeys(match, ['exclude']))"
      :full-query="query"
    />

    <div class="button-bar">
      <Button class="button-bar-button" label="Run" />
      <Button class="button-bar-button" label="View" severity="secondary" @click="visibleDialog = true" />
      <Button class="button-bar-button" label="Save" severity="success" />
    </div>
  </div>
</template>

<script setup lang="ts">
import "vue-json-pretty/lib/styles.css";
import TopBar from "@/components/shared/TopBar.vue";
import { ref, Ref, onMounted } from "vue";
import { useFilterStore } from "@/stores/filterStore";
import { QueryService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { Match, Query } from "@im-library/interfaces/AutoGen";
import RecursiveQueryDisplay from "@/components/query/RecursiveQueryDisplay.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
const filterStore = useFilterStore();
const query: Ref<Query> = ref({} as Query);
const visibleDialog: Ref<boolean> = ref(false);
const baseEntityIri = ref("");

onMounted(async () => {
  await filterStore.fetchFilterSettings();
  query.value = await QueryService.getQueryDisplay(IM.NAMESPACE + "Q_TestQuery");
  const baseEntity = query.value.match[0];
  baseEntityIri.value = baseEntity["@id"] || baseEntity["@set"] || baseEntity["@type"];
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

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}

.include-title {
  margin-left: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 0.1rem;
}
</style>
