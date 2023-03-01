<template>
  <div v-if="type === 'whereIn'">
    <div class="content">
      <AutoComplete
        v-model="selectedWhere"
        :suggestions="entitySuggestions"
        @complete="debounceForSearch($event)"
        optionLabel="name"
        placeholder="Select data model"
      />
      <AutoComplete
        v-model="selectedIn"
        :multiple="true"
        :suggestions="entitySuggestions"
        @complete="debounceForSearch($event)"
        optionLabel="name"
        placeholder="Select property or value"
      />
    </div>
    <div class="footer">
      <Button label="Cancel" icon="fa-solid fa-ban" @click="onClose" class="p-button-text" />
      <Button label="Save" icon="fa-solid fa-check" @click="onSave" autofocus />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, PropType, onMounted, ComputedRef } from "vue";
import EntityService from "@/services/EntityService";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { useStore } from "vuex";
import { TreeNode } from "primevue/tree";
import { Query, TTAlias, Where } from "@im-library/models/AutoGen";
import _ from "lodash";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const store = useStore();
const props = defineProps({
  node: { type: Object as PropType<TreeNode>, required: true },
  query: { type: Object as PropType<Query>, required: true }
});

const emit = defineEmits({ onClose: () => true });

const type: ComputedRef<string> = computed(() => (isObjectHasKeys(props.node.data, ["@id", "in"]) ? "whereIn" : "where"));

onMounted(async () => {
  selectedWhere.value = { iri: (props.node.data as Where)["@id"], name: (props.node.data as Where).name } as ConceptSummary;
  selectedIn.value = (props.node.data as Where).in.map(inItem => {
    return { iri: inItem["@id"], name: inItem.name } as ConceptSummary;
  });
});

const filterDefaults: Ref<FilterOptions> = computed(() => store.state.filterDefaults);
const abortController = ref(new AbortController());
const debounce = ref(0);
const loading = ref(false);
const entitySuggestions: Ref<ConceptSummary[]> = ref([]);
const selectedWhere: Ref<ConceptSummary> = ref({} as ConceptSummary);
const selectedIn: Ref<ConceptSummary[]> = ref({} as ConceptSummary[]);

function debounceForSearch(searchTerm: any): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search(searchTerm);
  }, 600);
}

async function search(searchTerm: any): Promise<void> {
  if (searchTerm.query.length > 2) {
    loading.value = true;
    entitySuggestions.value = await EntityService.simpleSearch(searchTerm.query, filterDefaults.value, abortController.value);
    loading.value = false;
  }
}

function onClose() {
  emit("onClose");
}

function onSave() {
  props.node.data["@id"] = selectedWhere.value.iri;
  props.node.data.name = selectedWhere.value.name;
  props.node.data.in = selectedIn.value.map(inItem => {
    return { "@id": inItem.iri, name: inItem.name } as TTAlias;
  });
  emit("onClose");
}
</script>

<style scoped>
.content {
  padding-bottom: 1rem;
}
.footer {
  display: flex;
  justify-content: end;
}
</style>
