<template>
  <div v-if="editMode">
    <div class="property-input-container">
      <div>
        Order by:
        <Dropdown
          v-model="editOrderBy['@id']"
          :options="orderByOptions"
          optionLabel="name"
          optionValue="iri"
          placeholder="Select order by"
          class="w-full md:w-14rem property"
        />
      </div>

      <div>
        Direction:
        <Dropdown
          v-model="editOrderBy.direction"
          optionLabel="name"
          optionValue="value"
          :options="directionOptions"
          placeholder="Select direction"
          class="w-full md:w-14rem property"
        />
      </div>

      <div>
        Limit:
        <InputNumber v-model="editOrderBy.limit" placeholder="Add results limit" class="property" />
      </div>
    </div>
    <div class="button-bar">
      <Button class="button-bar-button" label="Delete" severity="danger" @click="remove()" />
      <Button class="button-bar-button" label="Cancel" severity="secondary" @click="cancel()" />
      <Button class="button-bar-button" label="Save" @click="save()" />
    </div>
  </div>
  <div v-else-if="orderBy.description" v-html="orderBy.description" @dblclick="editMode = true"></div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { ConceptSummary } from "@im-library/interfaces";
import { Match, Order, OrderLimit, Property, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, SHACL } from "@im-library/vocabulary";
import { cloneDeep } from "lodash";
import { Ref, onMounted, ref } from "vue";
interface Props {
  match: Match;
  index: number;
  orderBy: OrderLimit;
  queryTypeIri: string;
}
const props = defineProps<Props>();

const editMode = ref(false);
const editOrderBy: Ref<OrderLimit> = ref({} as OrderLimit);
const orderByOptions: Ref<ConceptSummary[]> = ref([]);
const directionOptions: Ref<{ name: string; value: Order }[]> = ref([]);

const orderablePropertyTypes = [IM.NAMESPACE + "DateTime", IM.NAMESPACE + "NumericValue"];

onMounted(async () => {
  await setOrderByOptions();
  setDirectionOptions();
  editOrderBy.value = cloneDeep(props.orderBy);
});

async function setOrderByOptions() {
  const dataModelIri = resolveIri(props.match["@type"] ?? props.queryTypeIri);
  const entity = await EntityService.getPartialEntity(dataModelIri!, [SHACL.PROPERTY]);
  if (isObjectHasKeys(entity, [SHACL.PROPERTY]))
    for (const prop of entity[SHACL.PROPERTY]) {
      const propType = prop[SHACL.DATATYPE] ?? prop[SHACL.CLASS] ?? prop[SHACL.NODE];
      if (orderablePropertyTypes.includes(propType[0]["@id"])) {
        const propId = prop[SHACL.PATH][0]["@id"];
        const propName = prop[SHACL.PATH][0].name;
        orderByOptions.value.push({ name: propName, iri: propId, entityType: propType } as ConceptSummary);
      }
    }
}

function setDirectionOptions() {
  const hasDateType = orderByOptions.value.some(prop => prop.entityType[0]["@id"] === IM.NAMESPACE + "DateTime");
  const hasNumericType = orderByOptions.value.some(prop => prop.entityType[0]["@id"] === IM.NAMESPACE + "NumericValue");

  if (hasDateType && hasNumericType) {
    directionOptions.value.push({ name: "earliest/lowest", value: "ascending" });
    directionOptions.value.push({ name: "latest/highest", value: "descending" });
  } else if (hasDateType) {
    directionOptions.value.push({ name: "earliest", value: "ascending" });
    directionOptions.value.push({ name: "latest", value: "descending" });
  } else if (hasNumericType) {
    directionOptions.value.push({ name: "lowest", value: "ascending" });
    directionOptions.value.push({ name: "highest", value: "descending" });
  }
}

function cancel() {
  editOrderBy.value = cloneDeep(props.orderBy);
  editMode.value = false;
}

function save() {
  props.match!.orderBy![props.index] = cloneDeep(editOrderBy.value);
  editMode.value = false;
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
