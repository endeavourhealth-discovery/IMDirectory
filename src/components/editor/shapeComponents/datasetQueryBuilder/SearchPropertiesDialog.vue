<template>
  <Dialog v-model:visible="showDialogLocal" header="Search properties" :style="{ width: '95vw', minHeight: '95vh' }" modal class="search-properties-dialog">
    <div class="search-properties-dialog-content">
      <div class="search-bar">
        <InputGroup class="search-group">
          <InputGroupAddon @click="toggleListen" class="mic">
            <IMFontAwesomeIcon :icon="listening ? 'fa-duotone fa-microphone-slash' : 'fa-duotone fa-microphone'" />
          </InputGroupAddon>
          <InputText
            id="autocomplete-search"
            v-model="searchText"
            :placeholder="searchPlaceholder"
            @complete="debounceForSearch"
            data-testid="search-input"
            autofocus
            v-on:keyup.enter="onSearch"
            :loading="searchLoading"
            :pt="{ root: { autocomplete: 'off' } }"
          />
          <Button label="Search" @click="onSearch" class="p-button-secondary" />
        </InputGroup>
      </div>
      <div v-if="loading">
        <ProgressSpinner />
      </div>
      <div v-else class="flex flex-row">
        <DataModelTreeSelector :entity-iri="props.baseQueryReturnType['@id']" />
        <DataTable :paginator="true" :rows="rows" :value="searchResults" v-model:selection="selected" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { DataModelService, QueryService } from "@/services";
import { onMounted, Ref, ref, watch } from "vue";
import DataModelTreeSelector from "./DataModelTreeSelector.vue";
import { Query, QueryRequest, SearchResultSummary, TTIriRef } from "@/interfaces/AutoGen";
import setupSpeechToText from "@/composables/setupSpeechToText";
import DatasetService from "@/services/DatasetService";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { ExtendedSearchResultSummary } from "@/interfaces";
import { QUERY } from "@/vocabulary";

interface Props {
  showDialog: boolean;
  baseQueryReturnType: TTIriRef;
}

const props = defineProps<Props>();

watch(
  () => props.showDialog,
  newValue => {
    if (showDialogLocal.value != newValue) showDialogLocal.value = newValue;
  }
);

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean"
});

const dataModelProperties = ref();
const showDialogLocal = ref(false);
const loading = ref(true);
const searchText = ref("");
const searchLoading: Ref<boolean> = ref(false);
const searchPlaceholder: Ref<string> = ref("Search");
const debounce = ref(0);
const searchResults: Ref<SearchResultSummary[]> = ref([]);
const rows = ref(50);
const selected: Ref<ExtendedSearchResultSummary | undefined> = ref();

const { listening, speech, recog, toggleListen } = setupSpeechToText(searchText, searchPlaceholder);

watch(showDialogLocal, (newValue, oldValue) => {
  if (oldValue != newValue) emit("update:showDialog", newValue);
});

watch(searchText, async () => {
  debounceForSearch();
});

onMounted(async () => {
  loading.value = true;
  loading.value = false;
});

function debounceForSearch(): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    onSearch();
  }, 600);
}

async function onSearch() {
  if (searchText.value.length > 2) {
    const results = await DatasetService.searchAllowableDataModelProperties(props.baseQueryReturnType["@id"], searchText.value);
    if (isArrayHasLength(results)) searchResults.value = results;
    else searchResults.value = [];
  }
}
</script>

<style scoped></style>
