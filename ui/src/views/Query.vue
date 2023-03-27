<template>
  <div id="topbar-query-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Query</strong></span>
      </template>
    </TopBar>
    <TextQuery :textQuery="textQuery" :parent="undefined"></TextQuery>
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
import { textQuery } from "./textQuery";
import { ref, Ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import TextQuery from "@/components/query/TextQuery.vue";
import { ITextQuery } from "@im-library/interfaces";
const toast = useToast();
const store = useStore();
const selected = ref([] as any[]);
const data: Ref<ITextQuery[]> = ref([]);
const query: Ref<any> = ref();
const visibleDialog: Ref<boolean> = ref(false);

function getTableQuery() {}

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
