<template>
  <div class="property-container">
    <div class="property-title"><InputText :value="uiProperty?.propertyName" disabled /></div>
    <div v-if="uiProperty?.propertyType === 'class' || uiProperty?.propertyType === 'node'" class="property-input">
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
        />
      </div>
      <div class="value-list-container" v-if="valueField === 'is' || valueField === 'isNot'">
        <div class="value-list" v-if="isArrayHasLength(values)">
          <div class="value-list-item" v-for="[index, value] of values.entries()">
            <Button v-if="values.length > 1" severity="danger" icon="fa-solid fa-minus" class="add-feature-button" @click="values.splice(index, 1)" />
            <EntailmentOptionsSelect :entailment-object="value as any" />
            <AutocompleteSearchBar
              :selected="value"
              :root-entities="[uiProperty.valueType]"
              @update:selected="selected => updateSelectedValue(selected, index)"
            />
            <Button v-if="!index" severity="success" icon="fa-solid fa-plus" class="add-feature-button" @click="values.push({} as SearchResultSummary)" />
          </div>
        </div>
      </div>
      <SaveCustomSetDialog v-if="valueField === 'is' || valueField === 'isNot'" :set-members="values" @on-save="onCustomSetSave" />
    </div>
    <DatatypeSelect v-else-if="uiProperty?.propertyType === 'datatype'" :datatype="uiProperty.valueType" :property="property" />
    <Button @click="$emit('deleteProperty')" severity="danger" icon="fa-solid fa-trash" />
  </div>
</template>

<script setup lang="ts">
import { Entailment, Node, SearchResultSummary, Where } from "@im-library/interfaces/AutoGen";
import { UIProperty } from "@im-library/interfaces";
import { Ref, onMounted, ref, watch } from "vue";
import { QueryService } from "@/services";
import DatatypeSelect from "../query/builder/edit/datatype/DatatypeSelect.vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import SaveCustomSetDialog from "../query/builder/edit/dialogs/SaveCustomSetDialog.vue";
import EntailmentOptionsSelect from "../query/builder/edit/EntailmentOptionsSelect.vue";
import { cloneDeep, isEqual } from "lodash";

interface Props {
  property: Where;
  dataModelIri: string;
}

const props = defineProps<Props>();
const uiProperty: Ref<UIProperty | undefined> = ref();
const valueField: Ref<"is" | "isNot" | "isNull" | "isNotNull" | undefined> = ref();
const values: Ref<SearchResultSummary[]> = ref([]);
const emit = defineEmits({ deleteProperty: () => true });

onMounted(async () => {
  await init();
});

watch(
  () => cloneDeep(props.property),
  async () => await init()
);

watch(
  () => valueField.value,
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      handlePropertyTypeChange();
    }
  }
);

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

async function init() {
  if (props.dataModelIri && props.property["@id"]) {
    uiProperty.value = await QueryService.getDataModelProperty(props.dataModelIri, props.property["@id"]);
  }

  setValues();
}

function setValues() {
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

function onCustomSetSave(customSetRef: Node) {
  values.value = [];
  values.value.push({ iri: customSetRef["@id"], name: customSetRef.name } as SearchResultSummary);
}

function updateSelectedValue(selected: SearchResultSummary | undefined, index: number) {
  values.value[index] = selected ?? ({} as SearchResultSummary);
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
</script>

<style scoped>
.property-container {
  display: flex;
  flex-flow: row;
  margin-left: 1rem;
}
.property-input-container {
  margin-left: 0 !important;
}
.property-label {
  padding: 0.1rem;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}

.property-input {
  display: flex;
}

.value-list-container {
  display: flex;
}

.value-list {
  display: flex;
  flex-flow: column;
}

.single-value {
  display: flex;
}

.value-list-item {
  display: flex;
}

.property {
  display: flex;
}
</style>
