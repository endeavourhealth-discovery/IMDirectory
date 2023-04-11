<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Query</strong></span>
      </template>
    </TopBar>
    Defined as
    <TextQuery :from="textQueries[0]" :text-queries="textQueries" :parent="undefined"></TextQuery>
    <div class="button-bar">
      <Button class="button-bar-button" label="Run" />
      <Button class="button-bar-button" label="View" severity="secondary" @click="visibleDialog = true" />
      <Button class="button-bar-button" label="Save" severity="success" />
    </div>
  </div>
</template>

<script setup lang="ts">
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { definition } from "./definition";
import TopBar from "@/components/shared/TopBar.vue";
import { ref, Ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import TextQuery from "@/components/query/RecursiveTextQuery.vue";
import { ITextQuery } from "@im-library/interfaces";
import { buildTextQuery } from "@im-library/helpers/TextQueryBuilder";
import { QueryService } from "@/services";
import { Query } from "@im-library/interfaces/AutoGen";
const toast = useToast();
const store = useStore();
const selected = ref([] as any[]);
const textQueries: Ref<ITextQuery[]> = ref([]);
const query: Ref<any> = ref();
const visibleDialog: Ref<boolean> = ref(false);

async function getTextQuery() {
  query.value = await QueryService.getLabeledQuery(definition as any);
  return buildTextQuery(query.value);
}

onMounted(async () => {
  await store.dispatch("fetchFilterSettings");
  textQueries.value = await getTextQuery();
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
