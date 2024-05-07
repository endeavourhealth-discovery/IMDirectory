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
      <Button
        v-if="valueField === 'is' || valueField === 'isNot'"
        severity="success"
        icon="fa-solid fa-plus"
        class="add-feature-button"
        @click="values.push({} as SearchResultSummary)"
      />
    </div>
    <div class="value-list-container" v-if="valueField === 'is' || valueField === 'isNot'">
      <div class="value-list" v-if="isArrayHasLength(values)">
        <div class="value-list-item" v-for="[index, value] of values.entries()">
          <EntailmentOptionsSelect :entailment-object="value as any" />
          <AutocompleteSearchBar :selected="value" :root-entities="[datatype]" @update:selected="selected => updateSelectedValue(selected, index)" />
          <Button v-if="values.length > 1" severity="danger" icon="fa-solid fa-minus" class="add-feature-button" @click="values.splice(index, 1)" />
        </div>
      </div>
    </div>
  </div>
  <SaveCustomSetDialog v-if="valueField === 'is' || valueField === 'isNot'" :set-members="values" @on-save="onCustomSetSave" />
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import SaveCustomSetDialog from "./SaveCustomSetDialog.vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import EntailmentOptionsSelect from "./EntailmentOptionsSelect.vue";
import { Entailment, Node, SearchResultSummary, Where } from "@im-library/interfaces/AutoGen";
import { cloneDeep, isEqual } from "lodash";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
interface Props {
  datatype: string;
  property: Where;
}
const props = defineProps<Props>();

const valueField: Ref<"is" | "isNot" | "isNull" | "isNotNull" | undefined> = ref();
const values: Ref<SearchResultSummary[]> = ref([]);

onMounted(() => {
  setValues();
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

function onCustomSetSave(customSetRef: Node) {
  values.value = [];
  values.value.push({ iri: customSetRef["@id"], name: customSetRef.name } as SearchResultSummary);
}

function updateSelectedValue(selected: SearchResultSummary | undefined, index: number) {
  values.value[index] = selected ?? ({} as SearchResultSummary);
}

function handlePropertyTypeChange() {
  if (valueField.value === "isNot") {
    if (!values.value.length) values.value = [{} as SearchResultSummary];
    props.property.isNot = getNodes(values.value);
    delete props.property.is;
    delete props.property.isNull;
    delete props.property.isNotNull;
  } else if (valueField.value === "is") {
    if (!values.value.length) values.value = [{} as SearchResultSummary];
    props.property.is = getNodes(values.value);
    delete props.property.isNot;
    delete props.property.isNull;
    delete props.property.isNotNull;
  } else if (valueField.value === "isNull") {
    props.property.isNull = true;
    delete props.property.is;
    delete props.property.isNotNull;
    delete props.property.isNot;
  } else if (valueField.value === "isNotNull") {
    props.property.isNotNull = true;
    delete props.property.is;
    delete props.property.isNull;
    delete props.property.isNot;
  }
}

function getNodes(searchResultSummaries: SearchResultSummary[]): Node[] {
  return searchResultSummaries.map(searchResult => {
    const node = {
      "@id": searchResult.iri,
      name: searchResult.name
    } as Node;
    if ((searchResult as Entailment).ancestorsOf) node.ancestorsOf = true;
    if ((searchResult as Entailment).descendantsOf) node.descendantsOf = true;
    if ((searchResult as Entailment).descendantsOrSelfOf) node.descendantsOrSelfOf = true;
    if ((searchResult as Entailment).memberOf) node.memberOf = true;
    return node;
  });
}

function setValues() {
  values.value = [];
  if (props.property.is) {
    valueField.value = "is";
    for (const value of props.property.is) {
      values.value.push({ iri: value["@id"], name: value.name } as SearchResultSummary);
    }
    if (!values.value.length) values.value.push({} as SearchResultSummary);
  } else if (props.property.isNot) {
    valueField.value = "isNot";
    for (const value of props.property.isNot) {
      values.value.push({ iri: value["@id"], name: value.name } as SearchResultSummary);
    }
    if (!values.value.length) values.value.push({} as SearchResultSummary);
  } else if (isObjectHasKeys(props.property, ["isNull"])) valueField.value = "isNull";
  else if (isObjectHasKeys(props.property, ["isNotNull"])) valueField.value = "isNotNull";
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
  /* width: 100%; */
}
.value-field-options {
  width: 100%;
}
</style>
