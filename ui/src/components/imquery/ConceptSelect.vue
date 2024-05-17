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
          <EntailmentOptionsSelect :entailment-object="value" />
          <AutocompleteSearchBar
            :selected="{ iri: value['@id'], name: value.name } as SearchResultSummary"
            :root-entities="[datatype]"
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
import { Node, SearchResultSummary, Where, Element } from "@im-library/interfaces/AutoGen";
import { cloneDeep, isEqual } from "lodash";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
interface Props {
  datatype: string;
  property: Where;
}
const props = defineProps<Props>();

const valueField: Ref<"is" | "isNot" | "isNull" | "isNotNull" | undefined> = ref();
const values: Ref<Element[]> = ref([]);
const isValueList: ComputedRef<boolean> = computed(() => valueField.value === "is" || valueField.value === "isNot");

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
  values.value.push({ "@id": customSetRef["@id"]!, name: customSetRef.name });
}

function updateSelectedValue(selected: SearchResultSummary | undefined, index: number) {
  if (selected?.iri) values.value[index] = { "@id": selected?.iri, name: selected.name };
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

function setValues() {
  values.value = [];
  if (props.property.is) {
    valueField.value = "is";
    for (const value of props.property.is) {
      values.value.push({ "@id": value["@id"], name: value.name });
    }
    if (!values.value.length) values.value.push({});
  } else if (props.property.isNot) {
    valueField.value = "isNot";
    for (const value of props.property.isNot) {
      values.value.push({ "@id": value["@id"], name: value.name });
    }
    if (!values.value.length) values.value.push({});
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
}

.value-field-options {
  width: 100%;
}
</style>
