<template>
  <AutoComplete v-model="selected" option-label="name" :suggestions="suggestions" @complete="debounceForSearch" @change="emit('onChange', selected)" />
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isObject } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { onMounted, PropType, Ref, ref, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();
const props = defineProps({
  entityValue: { type: Object as PropType<ConceptSummary>, required: false }
});
const controller: Ref<AbortController> = ref({} as AbortController);
const filterDefaults: Ref<FilterOptions> = computed(() => store.state.filterDefaults);
const selected: Ref<ConceptSummary> = ref("" as any);
const suggestions: Ref<ConceptSummary[]> = ref([]);
const debounce = ref(0);

const emit = defineEmits({ onChange: (payload: ConceptSummary) => payload });

onMounted(() => {
  if (props.entityValue) {
    const value = props.entityValue.name || props.entityValue.iri;
    selected.value = value as any;
  }
});

async function search(searchTerm: any) {
  if (!isObject(controller.value)) {
    controller.value.abort();
  }
  controller.value = new AbortController();
  suggestions.value = await EntityService.simpleSearch(searchTerm.query, filterDefaults.value, controller.value);
}

function debounceForSearch(searchTerm: any): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search(searchTerm);
  }, 600);
}
</script>

<style scoped></style>
