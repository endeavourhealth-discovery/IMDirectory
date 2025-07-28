<template>
  <div class="value-container">
    <Select
      style="width: 4.5rem; min-height: 2.3rem"
      v-model="valueConstraintOperator"
      :options="constraintOperatorOptions"
      option-label="label"
      option-value="value"
      @change="updateValueConstraint"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center">
          <div>{{ valueConstraintOperator }}</div>
        </div>
      </template>
      <template #option="slotProps">
        <div class="flex items-center" style="min-height: 1rem">
          <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Select>
    <div class="value-text-container">
      <AutocompleteSearchBar
        :disabled="loadingValue || !hasFocus"
        v-model:selected="selectedValue"
        :imQuery="imQueryForValueSearch"
        :root-entities="valueTreeRoots"
        :setupSearch="updateQueryForValueSearch"
        :setupRootEntities="updateValueTreeRoots"
        @update:selected="updateValue"
      />
    </div>
    <Button v-if="node.invalid" icon="fa-solid fa-exclamation" severity="danger" v-tooltip="'Value is invalid for property'" />
    <Button
      :disabled="!where.iri"
      type="button"
      icon="fa-solid fa-plus"
      label="Add value"
      data-testid="add-refinement-button"
      :severity="hoverAddValue ? 'success' : 'secondary'"
      :outlined="!hoverAddValue"
      :class="!hoverAddValue && 'hover-button'"
      @click="addValue()"
      @mouseover="hoverAddValue = true"
      @mouseout="hoverAddValue = false"
    />
    <Button
      @click.stop="deleteValue"
      class="builder-button"
      :severity="hoverDeleteValue ? 'danger' : 'secondary'"
      :outlined="!hoverDeleteValue"
      :class="!hoverDeleteValue && 'hover-button'"
      icon="fa-solid fa-trash"
      @mouseover="hoverDeleteValue = true"
      @mouseout="hoverDeleteValue = false"
    />
    <ProgressSpinner v-if="loadingValue" class="loading-icon" stroke-width="8" />
  </div>
</template>

<script setup lang="ts">
import { constraintOperatorOptions, getConstraintOperator, setConstraintOperator } from "@/composables/buildQuery";
import Button from "primevue/button";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { computed, inject, onMounted, ref, Ref, watch } from "vue";
import { QueryRequest, SearchResultSummary, Where, Node, TTIriRef } from "@/interfaces/AutoGen";
import { IM, QUERY, SNOMED } from "@/vocabulary";
import { isEqual } from "lodash-es";
import { EclService, QueryService } from "@/services";
import { ToastSeverity } from "@/enums";
import { useToast } from "primevue/usetoast";
interface Props {
  index: number;
}

const props = defineProps<Props>();
const where = defineModel<Where>("where", { default: {} });
const node = defineModel<Node>("node", { default: {} });
const valueConstraintOperator: Ref<string | undefined> = ref<"<<">();
const hoverAddValue = ref(false);
const loadingValue = ref(true);
const imQueryForValueSearch: Ref<QueryRequest | undefined> = ref();
const valueTreeRoots: Ref<string[] | undefined> = ref();
const selectedValue: Ref<SearchResultSummary> = ref({ iri: node.value.iri, name: node.value.name } as SearchResultSummary);
const forceValidation = inject("forceValidation") as Ref<boolean>;
const toast = useToast();
const allowableRanges: Ref<TTIriRef[]> = ref([]);
const hoverDeleteValue = ref(false);
const hasFocus = computed(() => {
  return !!where.value.iri;
});
watch(forceValidation, async () => {
  await updateIsValidPropertyValue();
});
watch(where, async (newValue, oldValue) => {
  if (!isEqual(newValue.iri, oldValue.iri)) {
    imQueryForValueSearch.value = undefined;
    allowableRanges.value = [];
  }
});

watch(node, async (newValue, oldValue) => {
  if (!isEqual(newValue.iri, oldValue.iri)) {
    imQueryForValueSearch.value = undefined;
    allowableRanges.value = [];
    selectedValue.value = { iri: newValue.iri, name: newValue.name } as SearchResultSummary;
  }
});

onMounted(async () => {
  loadingValue.value = true;
  await processValue();
  loadingValue.value = false;
});

function processValue() {
  if (node.value.iri) {
    selectedValue.value = { iri: node.value.iri, name: node.value.name } as SearchResultSummary;
    valueConstraintOperator.value = getConstraintOperator(node.value);
  } else {
    selectedValue.value = {} as SearchResultSummary;
    valueConstraintOperator.value = "<<";
  }
}

function updateValue(value: SearchResultSummary | undefined) {
  if (value) {
    node.value.iri = value.iri;
    node.value.name = value.name;
    node.value.invalid = false;
    selectedValue.value = value;
  }
}

function deleteValue() {
  if (props.index === 0 && where.value!.is!.length === 1) {
    delete node.value.iri;
    delete node.value.name;
    node.value.descendantsOrSelfOf = true;
  } else where.value!.is!.splice(props.index, 1);
}

function updateValueConstraint(e: { value: string }) {
  setConstraintOperator(node.value, e.value);
}
function addValue() {
  where.value!.is!.push({});
}

async function updateQueryForValueSearch(): Promise<QueryRequest> {
  if (allowableRanges.value.length === 0) {
    await updateValueTreeRoots();
  }
  if (where.value.iri) {
    imQueryForValueSearch.value = {
      query: { iri: QUERY.IS_ALLOWABLE_RANGE },
      argument: [
        {
          parameter: "ranges",
          valueIriList: allowableRanges.value
        }
      ]
    } as QueryRequest;
    return imQueryForValueSearch.value;
  } else return {} as QueryRequest;
}
async function updateIsValidPropertyValue(): Promise<void> {
  if (selectedValue.value) {
    const imQuery = await updateQueryForValueSearch();
    imQuery.askIri = node.value.iri;
    const result = await QueryService.askQuery(imQuery);
    if (!result) {
      node.value.invalid = true;
      toast.add({
        severity: ToastSeverity.ERROR,
        summary: "Invalid property value",
        detail: `Value "${node.value.name}" is not valid for property for this concept";
        }"`,
        life: 3000
      });
    } else node.value.invalid = false;
  }
}

async function updateValueTreeRoots(): Promise<string[]> {
  let roots = [IM.ONTOLOGY_PARENT_FOLDER];
  if (where.value.iri && where.value.iri !== SNOMED.ANY) {
    const results = await EclService.getRangesForProperty(where.value.iri);
    if (results) {
      allowableRanges.value = results.map(c => ({ iri: c }));
      valueTreeRoots.value = results;
      return valueTreeRoots.value;
    }
  }
  allowableRanges.value = [{ iri: IM.ONTOLOGY_PARENT_FOLDER }];
  valueTreeRoots.value = roots;
  return valueTreeRoots.value;
}
</script>

<style scoped>
.value-container {
  display: flex;
  justify-content: flex-start;
  flex: 1 0 0;
  flex-flow: row nowrap;
  overflow: auto;
  align-items: flex-end;
}

.value-text-container {
  flex: 1 1 0%;
  width: 100%;
}

.builder-button {
  width: 2rem;
}
</style>
