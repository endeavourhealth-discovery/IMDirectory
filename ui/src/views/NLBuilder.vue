<template>
  <div id="cookies-main-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>NL Builder</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="cookies-content-container">
      Include if:
      <div class="query-box">
        <div v-for="(match, idx) of query" class="match">
          <span v-if="idx > 0">OR</span>
          {{ match.name }}
          <IMFontAwesomeIcon icon="times" class="delete" @click="remove(idx)"></IMFontAwesomeIcon>
          &nbsp;
          <AutoComplete
            v-model="inputs[idx + 1]"
            class="feature-search"
            :suggestions="items"
            optionLabel="name"
            @complete="search"
            @item-select="select($event, idx)"
          />
        </div>
        <AutoComplete
          id="autocomplete"
          v-model="inputs[0]"
          class="feature-search"
          :suggestions="items"
          optionLabel="name"
          @complete="search"
          @item-select="select($event, -1)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { useRouter } from "vue-router";
import { nextTick, onMounted, Ref, ref } from "vue";
import { AutoCompleteCompleteEvent, AutoCompleteItemSelectEvent } from "primevue/autocomplete";
import { SearchResponse, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";

const router = useRouter();

const abort: Ref<AbortController> = ref(new AbortController() as AbortController);
const items: Ref<SearchResultSummary[]> = ref([]);
const query: Ref<SearchResultSummary[]> = ref([]);
const inputs: Ref<string[]> = ref([""]);

onMounted(() => {
  nextTick(() => {
    console.log("Autofocus");
    const autocomplete: HTMLElement | null = document.getElementById("autocomplete");
    if (autocomplete) {
      console.log(autocomplete.children[0]);
      (autocomplete.children[0] as HTMLElement).focus();
    }
  });
});

async function search(event: AutoCompleteCompleteEvent) {
  if (abort.value) abort.value.abort();

  items.value = await getResults(event.query);
}

async function getResults(query: string): Promise<SearchResultSummary[]> {
  switch (query) {
    case "?":
      return [{ name: "Refine" }] as SearchResultSummary[];
    default:
      if (query && query.length >= 4) {
        abort.value = new AbortController();
        const results: SearchResponse = await EntityService.advancedSearch({ termFilter: query, typeFilter: [IM.CONCEPT], size: 10 }, abort.value);

        if (results && results?.count && results?.count > 0 && results.entities) return results.entities;
      }
  }
  return [];
}

function select(event: AutoCompleteItemSelectEvent, index: number) {
  inputs.value = Array(inputs.value.length + 1);

  if (-1 == index) query.value.push(event.value);
  else query.value.splice(index + 1, 0, event.value);
}

function remove(idx: number) {
  query.value.splice(idx, 1);
}

function goBack() {
  router.back();
}
</script>

<style>
#cookies-main-container {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}
#cookies-content-container {
  flex: 1 1 auto;
  padding: 1rem 4rem;
  overflow: auto;
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
}

.delete {
  color: var(--red-500);
  display: none;
}

.match:hover .delete {
  display: var(--fa-display, inline-block);
  cursor: pointer;
}

.query-box {
}

.feature-search,
.feature-search > .p-inputtext {
  border: none !important;
  background: transparent !important;
  padding: 0;
}

.feature-search,
.feature-search > .p-inputtext:enabled:focus {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0;
}
</style>
