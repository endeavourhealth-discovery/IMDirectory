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
        <div v-if="isType === 'Entity'" class="value-list-item" v-for="[index, value] of values.entries()">
          <EntailmentOptionsSelect :entailment-object="value" @update-entailment="onUpdateEntailment" />
          <SelectButton v-model="isType" :options="['Entity', 'Cluster code']" @change="handleIsTypeChange(value)" />
          <AutocompleteSearchBar
            :quick-type-filters-allowed="[IM.CONCEPT, IM.CONCEPT_SET]"
            :selected-quick-type-filter="quickTypeFilter"
            :os-query="osQuery"
            @update-selected-filters="onUpdateSelectedFilters"
            :selected="{ iri: value['@id'], name: value.name } as SearchResultSummary"
            :root-entities="[datatype]"
            @update:selected="selected => updateSelectedValue(selected, index)"
          />
          <Button v-if="values.length > 1" severity="danger" icon="fa-solid fa-minus" class="add-feature-button" @click="values.splice(index, 1)" />
        </div>
        <div v-else class="value-list-item" v-for="[index, value] of values.entries()">
          <EntailmentOptionsSelect :entailment-object="value" @update-entailment="onUpdateEntailment" />
          <SelectButton v-model="isType" :options="['Entity', 'Cluster code']" />
          <InputText v-model="value.parameter" @change="handlePropertyTypeChange" />
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
import { Node, SearchResultSummary, Where, Element, SearchRequest } from "@im-library/interfaces/AutoGen";
import { cloneDeep, isEqual } from "lodash-es";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import { FilterOptions } from "@im-library/interfaces";
import { onUnmounted } from "vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import { EntityService } from "@/services";
interface Props {
  datatype: string;
  property: Where;
  dataModelIri: string;
}
const props = defineProps<Props>();

const { updateEntailment } = setupIMQueryBuilderActions();
const valueField: Ref<"is" | "isNot" | "isNull" | "isNotNull" | undefined> = ref();
const values: Ref<Element[]> = ref([]);
const isValueList: ComputedRef<boolean> = computed(() => valueField.value === "is" || valueField.value === "isNot");
const quickTypeFilter: Ref<string> = ref(IM.CONCEPT_SET);
const osQuery: Ref<SearchRequest | undefined> = ref();
const conceptSets: Ref<string[]> = ref([]);
const isType: Ref<"Entity" | "Cluster code"> = ref("Entity");

onMounted(async () => {
  setValues();
  buildOSQuery();
  await setConceptSets();
});

onUnmounted(() => {
  clearValues();
});

watch(
  () => valueField.value,
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      handlePropertyTypeChange();
    }
  }
);

watch(
  () => cloneDeep(values.value),
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      handlePropertyTypeChange();
    }
  }
);

watch(
  () => cloneDeep(props.property),
  () => setValues()
);

function handleIsTypeChange(value: Element) {
  if (isType.value === "Cluster code") delete value["@id"];
  else if (isType.value === "Entity") delete value.parameter;
  delete value.name;
}

function buildOSQuery() {
  if (!osQuery.value) osQuery.value = { typeFilter: [IM.CONCEPT_SET], statusFilter: [IM.ACTIVE] };
  osQuery.value.bindingFilter = [{ node: { "@id": props.dataModelIri }, path: { "@id": props.property["@id"]! } }];
}

async function setConceptSets() {
  if (osQuery.value) {
    const osQueryCopy = cloneDeep(osQuery.value);
    osQueryCopy.size = 10000;
    const response = await EntityService.advancedSearch(osQueryCopy);
    if (response.entities) conceptSets.value = response.entities?.map(entity => entity.iri);
  }
}

function clearValues() {
  values.value = [];
}

function onUpdateEntailment(entailmentOption: string) {
  updateEntailment(props.property, entailmentOption);
  quickTypeFilter.value = entailmentOption === "memberOf" ? IM.CONCEPT_SET : IM.CONCEPT;
}

function onCustomSetSave(customSetRef: Node) {
  values.value = [];
  values.value.push({ "@id": customSetRef["@id"]!, name: customSetRef.name });
}

function updateSelectedValue(selected: SearchResultSummary | undefined, index: number) {
  if (selected?.iri) values.value[index] = { "@id": selected?.iri, name: selected.name };
}

function handlePropertyTypeChange() {
  if (isType.value === "Cluster code")
    for (const value of values.value) {
      value.name = value.parameter;
    }
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

function setValues() {
  values.value = [];
  if (props.property.is) {
    valueField.value = "is";
    for (const value of props.property.is) {
      if (value["@id"]) values.value.push({ "@id": value["@id"], name: value.name });
      else if (value.parameter) {
        values.value.push({ parameter: value.parameter, name: value.name ?? value.parameter });
        isType.value = "Cluster code";
      }
    }
    if (!values.value.length) values.value.push({});
  } else if (props.property.isNot) {
    valueField.value = "isNot";
    for (const value of props.property.isNot) {
      if (value["@id"]) values.value.push({ "@id": value["@id"], name: value.name });
      else if (value.parameter) {
        values.value.push({ parameter: value.parameter, name: value.name ?? value.parameter });
        isType.value = "Cluster code";
      }
    }
    if (!values.value.length) values.value.push({});
  } else if (isObjectHasKeys(props.property, ["isNull"])) valueField.value = "isNull";
  else if (isObjectHasKeys(props.property, ["isNotNull"])) valueField.value = "isNotNull";
  else {
    valueField.value = "is";
    isType.value = "Entity";
  }
}

function onUpdateSelectedFilters(selectedFilters: FilterOptions) {
  if (!osQuery.value) osQuery.value = {};
  if (selectedFilters.types) {
    if (selectedFilters.types.find(type => type["@id"] === IM.CONCEPT)) {
      delete osQuery.value.bindingFilter;
      osQuery.value.memberOf = conceptSets.value;
    } else if (selectedFilters.types.find(type => type["@id"] === IM.CONCEPT_SET)) {
      delete osQuery.value.memberOf;
      osQuery.value.bindingFilter = [{ node: { "@id": props.dataModelIri }, path: { "@id": props.property["@id"]! } }];
    }
    osQuery.value.typeFilter = selectedFilters.types.map(type => type["@id"]);
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
