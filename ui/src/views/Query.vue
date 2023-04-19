<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Query</strong></span>
      </template>
    </TopBar>
    Defined as
    <TextQuery :baseEntityIri="baseEntityIri" :text-queries="textQueries" :parent="undefined"></TextQuery>
    <div class="button-bar">
      <Button class="button-bar-button" label="Run" />
      <Button class="button-bar-button" label="View" severity="secondary" @click="visibleDialog = true" />
      <Button class="button-bar-button" label="Save" severity="success" />
    </div>
  </div>
</template>

<script setup lang="ts">
import "vue-json-pretty/lib/styles.css";
import { definition } from "./definition";
import TopBar from "@/components/shared/TopBar.vue";
import { ref, Ref, onMounted } from "vue";
import { useStore } from "vuex";
import TextQuery from "@/components/query/RecursiveTextQuery.vue";
import { ITextQuery } from "@im-library/interfaces";
import { buildTextQuery } from "@im-library/helpers/TextQueryBuilder";
import { EntityService, QueryService } from "@/services";
import { IM } from "@im-library/vocabulary";
const store = useStore();
const textQueries: Ref<ITextQuery[]> = ref([]);
const query: Ref<any> = ref();
const visibleDialog: Ref<boolean> = ref(false);
const baseEntityIri = ref("");

onMounted(async () => {
  await store.dispatch("fetchFilterSettings");
  textQueries.value = await getTextQuery();
  const baseEntity = textQueries.value[0].data;
  baseEntityIri.value = baseEntity["@id"] || baseEntity["@set"] || baseEntity["@type"];
});

async function getTextQuery() {
  const entity = await EntityService.getPartialEntity("http://endhealth.info/im#Q_TestQuery", [IM.DEFINITION]);
  query.value = await QueryService.getLabeledQuery(JSON.parse(entity[IM.DEFINITION]));
  return buildTextQuery(JSON.parse(entity[IM.DEFINITION]));
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
