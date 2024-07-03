<template>
  <div class="property-input">
    <div class="value-field">
      <Dropdown
        :options="[
          { id: 'is', name: 'is' },
          { id: 'isNot', name: 'is not' },
          { id: 'isNull', name: 'is not recorded' },
          { id: 'isNotNull', name: 'is recorded' }
        ]"
        optionValue="id"
        optionLabel="name"
        v-model:model-value="valueField"
        class="value-field-options"
      />
      <Button v-if="isValueList" severity="success" icon="fa-solid fa-plus" class="add-feature-button" @click="values.push({})" />
    </div>
    <div class="value-list-container" v-if="isValueList">
      <div class="value-list" v-if="isArrayHasLength(values)">
        <div class="value-list-item" v-for="[index, value] of values.entries()">
          <EntailmentOptionsSelect :entailment-object="value" @update-entailment="onUpdateEntailment" />
          <SelectButton v-model="isType" :options="['Concept', 'Concept set']" @change="handleIsTypeChange(value)" />
          <AutocompleteSearchBar
            :quick-type-filters-allowed="[IM.CONCEPT, IM.CONCEPT_SET]"
            :selected-quick-type-filter="quickTypeFilter"
            :im-query="imQuery"
            :root-entities="[datatype]"
            :selected="value.summary"
            @update-selected-filters="onUpdateSelectedFilters"
            @update:selected="selected => updateSelectedValue(selected, index)"
          />
          <Button v-if="values.length > 1" severity="danger" icon="fa-solid fa-minus" class="add-feature-button" @click="values.splice(index, 1)" />
        </div>
      </div>
    </div>
  </div>
  <SaveCustomSetDialog v-if="isValueList" :set-members="values" @on-save="onCustomSetSave" />
</template>

<script setup lang="ts">
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import SaveCustomSetDialog from "./SaveCustomSetDialog.vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import EntailmentOptionsSelect from "./EntailmentOptionsSelect.vue";
import { cloneDeep, isEqual } from "lodash-es";
import { Node, SearchResultSummary, Where, Element, QueryRequest, SearchBinding, Query, Match } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import { FilterOptions, SearchOptions } from "@im-library/interfaces";
import { onUnmounted } from "vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import { EntityService, QueryService } from "@/services";
import {
  addBindingsToIMQuery,
  addMemberOfToIMQuery,
  addTypeFilterToIMQuery,
  buildIMQueryFromFilters,
  deleteQueryPredicateIfExists
} from "@/helpers/IMQueryBuilder";

interface ElementWithSummary extends Element {
  summary?: SearchResultSummary;
}

interface Props {
  datatype: string;
  property: Where;
  dataModelIri: string;
}
const props = defineProps<Props>();

const { updateEntailment } = setupIMQueryBuilderActions();
const valueField: Ref<"is" | "isNot" | "isNull" | "isNotNull" | undefined> = ref();
const values: Ref<ElementWithSummary[]> = ref([]);
const isValueList: ComputedRef<boolean> = computed(() => valueField.value === "is" || valueField.value === "isNot");
const quickTypeFilter: Ref<string> = ref(IM.CONCEPT_SET);
const imQuery: Ref<QueryRequest | undefined> = ref();
const conceptSets: Ref<string[]> = ref([]);
const isType: Ref<"Concept" | "Concept set"> = ref("Concept set");

onMounted(async () => await init());
onUnmounted(() => clearValues());

async function init() {
  await setValues();
  buildIMQuery();
  await setConceptSets();
}

function handleIsTypeChange(value: Element) {
  delete value["@id"];
  delete value.name;
  if (isType.value === "Concept") quickTypeFilter.value = IM.CONCEPT;
  else if (isType.value === "Concept set") quickTypeFilter.value = IM.CONCEPT_SET;
}

function buildIMQuery() {
  const filterOptions: SearchOptions = {
    types: [{ "@id": IM.CONCEPT_SET }],
    status: [{ "@id": IM.ACTIVE }],
    binding: [{ node: { "@id": props.dataModelIri }, path: { "@id": props.property["@id"]! } }]
  } as SearchOptions;
  imQuery.value = buildIMQueryFromFilters(filterOptions);
}

async function setConceptSets() {
  if (imQuery.value) {
    const imQueryCopy = cloneDeep(imQuery.value);
    imQueryCopy.page = { pageSize: 10000, pageNumber: 1 };
    const response = await QueryService.queryIMSearch(imQueryCopy);
    if (response.entities) conceptSets.value = response.entities?.map(entity => entity.iri);
  }
}

function clearValues() {
  values.value = [];
}

function onUpdateEntailment(entailmentOption: string) {
  updateEntailment(props.property, entailmentOption);
  quickTypeFilter.value = entailmentOption === "memberOf" ? IM.CONCEPT_SET : IM.CONCEPT;
  isType.value = entailmentOption === "memberOf" ? "Concept set" : "Concept";
}

async function onCustomSetSave(customSetRef: Node) {
  values.value = [];
  values.value.push({ "@id": customSetRef["@id"]!, name: customSetRef.name, summary: await EntityService.getEntitySummary(customSetRef["@id"]!) });
}

function updateSelectedValue(selected: SearchResultSummary | undefined, index: number) {
  if (selected?.iri) values.value[index] = { "@id": selected?.iri, name: selected.name, summary: selected };
  handlePropertyTypeChange();
}

function handlePropertyTypeChange() {
  switch (valueField.value) {
    case "isNot":
      if (!values.value.length) values.value = [{}];
      props.property.isNot = values.value;
      delete props.property.is;
      delete props.property.isNull;
      delete props.property.isNotNull;
      break;
    case "is":
      if (!values.value.length) values.value = [{}];
      props.property.is = values.value;
      delete props.property.isNot;
      delete props.property.isNull;
      delete props.property.isNotNull;
      break;
    case "isNull":
      props.property.isNull = true;
      delete props.property.is;
      delete props.property.isNotNull;
      delete props.property.isNot;
      break;
    case "isNotNull":
      props.property.isNotNull = true;
      delete props.property.is;
      delete props.property.isNull;
      delete props.property.isNot;
      break;
    default:
      break;
  }
}

async function setValues() {
  values.value = [];
  if (props.property.is) {
    valueField.value = "is";
    for (const value of props.property.is) {
      if (value["@id"]) values.value.push({ "@id": value["@id"], name: value.name, summary: await EntityService.getEntitySummary(value["@id"]) });
    }
    if (!values.value.length) values.value.push({});
  } else if (props.property.isNot) {
    valueField.value = "isNot";
    for (const value of props.property.isNot) {
      if (value["@id"]) values.value.push({ "@id": value["@id"], name: value.name, summary: await EntityService.getEntitySummary(value["@id"]) });
    }
    if (!values.value.length) values.value.push({});
  } else if (isObjectHasKeys(props.property, ["isNull"])) valueField.value = "isNull";
  else if (isObjectHasKeys(props.property, ["isNotNull"])) valueField.value = "isNotNull";
  else {
    valueField.value = "is";
    isType.value = "Concept set";
  }
}

function onUpdateSelectedFilters(selectedFilters: FilterOptions) {
  if (!imQuery.value) imQuery.value = { query: {} };
  if (selectedFilters.types.length === 1) {
    if (selectedFilters.types.find(type => type["@id"] === IM.CONCEPT)) {
      deleteQueryPredicateIfExists(imQuery.value.query, IM.BINDING);
      deleteQueryPredicateIfExists(imQuery.value.query, IM.IS_MEMBER_OF);
      isType.value = "Concept";
      quickTypeFilter.value = IM.CONCEPT;
      const conceptSetRefs = conceptSets.value.map(conceptSet => {
        return { "@id": conceptSet };
      });
      addMemberOfToIMQuery(conceptSetRefs, imQuery.value);
    } else if (selectedFilters.types.find(type => type["@id"] === IM.CONCEPT_SET)) {
      isType.value = "Concept set";
      quickTypeFilter.value = IM.CONCEPT_SET;
      deleteQueryPredicateIfExists(imQuery.value.query, IM.IS_MEMBER_OF);
      deleteQueryPredicateIfExists(imQuery.value.query, IM.BINDING);
      const binding: SearchBinding = { node: { "@id": props.dataModelIri }, path: { "@id": props.property["@id"]! } };
      addBindingsToIMQuery([binding], imQuery.value);
    }
    addTypeFilterToIMQuery(selectedFilters.types, imQuery.value);
  } else if (selectedFilters.types.find(t => t["@id"] === IM.CONCEPT) && selectedFilters.types.find(t => t["@id"] === IM.CONCEPT_SET)) {
    deleteQueryPredicateIfExists(imQuery.value.query, IM.BINDING);
    deleteQueryPredicateIfExists(imQuery.value.query, IM.IS_MEMBER_OF);
    const conceptSetRefs = conceptSets.value.map(conceptSet => {
      return { "@id": conceptSet };
    });
    addMemberOfToIMQuery(conceptSetRefs, imQuery.value);
    const binding: SearchBinding = { node: { "@id": props.dataModelIri }, path: { "@id": props.property["@id"]! } };
    addBindingsToIMQuery([binding], imQuery.value);
  }
}
</script>

<style scoped>
.value-list-item {
  display: flex;
}

.value-field {
  display: flex;
  width: 100%;
}

.property-input {
  display: flex;
  flex-flow: column;
}

.value-field-options {
  width: 100%;
}
</style>
