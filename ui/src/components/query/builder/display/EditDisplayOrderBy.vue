<template>
  <div v-if="editMode">
    <div class="property-input-container">
      <div>
        Get:
        <Dropdown
          v-model="selectedDirection"
          optionLabel="name"
          :options="directionOptions"
          placeholder="Select direction"
          class="w-full md:w-14rem property"
        />
      </div>

      <div>
        Number:
        <InputNumber v-model="selectedLimit" placeholder="Set limit" class="property" />
      </div>

      <div>
        By:
        <Dropdown
          v-model="selectedProperty.iri"
          :options="orderByOptions"
          optionLabel="name"
          optionValue="iri"
          placeholder="Select property"
          class="w-full md:w-14rem property"
        />
      </div>
    </div>
    <div class="button-bar">
      <Button class="button-bar-button" label="Delete" severity="danger" @click="remove()" />
      <Button class="button-bar-button" label="Cancel" severity="secondary" @click="cancel()" />
      <Button class="button-bar-button" label="Save" @click="save()" />
    </div>
  </div>
  <div v-else-if="isObjectHasKeys(orderBy, ['description'])" v-html="orderBy.description" @dblclick="editMode = true"></div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { resolveIri, getNameFromRef } from "@im-library/helpers/TTTransform";
import { ConceptSummary, TTProperty } from "@im-library/interfaces";
import { Match, Order, OrderLimit, Property, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, SHACL } from "@im-library/vocabulary";
import { cloneDeep } from "lodash";
import { Ref, onMounted, ref, watch } from "vue";

interface Props {
  match: Match;
  index: number;
  orderBy: OrderLimit;
  queryTypeIri: string;
  onAddOrderBy: boolean;
}

const props = defineProps<Props>();

const editMode = ref(false);
const orderByOptions: Ref<ConceptSummary[]> = ref([]);
const orderProperties: Ref<ConceptSummary[]> = ref([]);
const directionOptions: Ref<{ name: string; value: Order }[]> = ref([]);
const orderablePropertyTypes = [IM.NAMESPACE + "DateTime", IM.NAMESPACE + "NumericValue"];
const selectedDirection: Ref<{ name: string; value: Order }> = ref({} as { name: string; value: Order });
const selectedProperty: Ref<ConceptSummary> = ref({ iri: "" } as ConceptSummary);
const selectedLimit: Ref<number> = ref(0);

onMounted(async () => await init());

watch(
  () => selectedDirection.value,
  () => (orderByOptions.value = getOrderByOptions())
);

watch(
  () => props.onAddOrderBy,
  () => {
    if (props.onAddOrderBy === true) editMode.value = true;
  }
);

watch(
  () => editMode.value,
  async () => {
    if (editMode.value === true) await init();
  }
);

async function init() {
  if (props.onAddOrderBy === true) editMode.value = true;
  orderProperties.value = await getOrderProperties();
  directionOptions.value = getDirectionOptions();
  populateValues();
}

function getOrderByOptions() {
  let orderByOptions: ConceptSummary[] = [];
  if (selectedDirection.value.name === "earliest" || selectedDirection.value.name === "latest")
    orderByOptions = orderProperties.value.filter(prop => prop.entityType[0]["@id"] === IM.NAMESPACE + "DateTime");
  else if (selectedDirection.value.name === "highest" || selectedDirection.value.name === "lowest")
    orderByOptions = orderProperties.value.filter(prop => prop.entityType[0]["@id"] === IM.NAMESPACE + "NumericValue");
  return orderByOptions;
}

async function getOrderProperties() {
  const orderProperties: ConceptSummary[] = [];
  const dataModelIri = resolveIri(props.match["typeOf"]!["@id"] ?? props.queryTypeIri);
  const entity = await EntityService.getPartialEntity(dataModelIri!, [SHACL.PROPERTY]);
  if (isObjectHasKeys(entity, [SHACL.PROPERTY]))
    for (const prop of entity[SHACL.PROPERTY]) {
      const propType = prop[SHACL.DATATYPE] ?? prop[SHACL.CLASS] ?? prop[SHACL.NODE];
      if (orderablePropertyTypes.includes(propType[0]["@id"])) {
        const propId = prop[SHACL.PATH][0]["@id"];
        const propName = prop[SHACL.PATH][0].name;
        orderProperties.push({ name: propName, iri: propId, entityType: propType } as ConceptSummary);
      }
    }

  return orderProperties;
}

function getDirectionOptions() {
  const directionOptions: { name: string; value: Order }[] = [];
  const hasDateType = orderProperties.value.some(prop => prop.entityType[0]["@id"] === IM.NAMESPACE + "DateTime");
  const hasNumericType = orderProperties.value.some(prop => prop.entityType[0]["@id"] === IM.NAMESPACE + "NumericValue");

  if (hasDateType && hasNumericType) {
    directionOptions.push({ name: "earliest", value: "ascending" });
    directionOptions.push({ name: "lowest", value: "ascending" });
    directionOptions.push({ name: "latest", value: "descending" });
    directionOptions.push({ name: "highest", value: "descending" });
  } else if (hasDateType) {
    directionOptions.push({ name: "earliest", value: "ascending" });
    directionOptions.push({ name: "latest", value: "descending" });
  } else if (hasNumericType) {
    directionOptions.push({ name: "lowest", value: "ascending" });
    directionOptions.push({ name: "highest", value: "descending" });
  }

  return directionOptions;
}

function cancel() {
  if (isEmpty(props.orderBy)) remove();
  editMode.value = false;
}

function save() {
  props.match!.orderBy![props.index] = getNewOrderBy();
  if (isEmpty(props.match!.orderBy![props.index])) remove();
  editMode.value = false;
}

function populateValues() {
  if (props.orderBy.direction) {
    const found = directionOptions.value.find(option => option.value === props.orderBy.direction);
    if (found) selectedDirection.value = found;
  }
  if (props.orderBy["@id"]) {
    const found = orderByOptions.value.find(option => option.iri === props.orderBy["@id"]) ?? ({} as ConceptSummary);
    if (found) selectedProperty.value = found;
  }
  if (props.orderBy.limit) selectedLimit.value = props.orderBy.limit;
}

function getNewOrderBy() {
  const editOrderBy = cloneDeep(props.orderBy);
  if (selectedProperty.value.iri) editOrderBy["@id"] = selectedProperty.value.iri;
  if (selectedDirection.value.value) editOrderBy.direction = selectedDirection.value.value;
  if (selectedLimit.value) editOrderBy.limit = selectedLimit.value;
  return editOrderBy;
}

function isEmpty(orderBy: OrderLimit) {
  if (!isObjectHasKeys(orderBy, ["@id"])) return true;
  const hasProperties = isObjectHasKeys(orderBy);
  const hasValues = orderBy.limit || orderBy["@id"] || orderBy.direction;
  return !hasProperties || !hasValues;
}

function remove() {
  props.match.orderBy?.splice(props.index, 1);
}
</script>

<style scoped>
.edit-mode {
  margin-left: 1rem;
}

.property-input-container {
  display: flex;
  flex-wrap: wrap;
  margin-left: 1rem;
  width: 100%;
  gap: 0.5rem;
}

.property {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  display: flex;
}
</style>
