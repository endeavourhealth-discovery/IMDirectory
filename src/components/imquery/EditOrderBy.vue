<template>
  <div v-if="loading" class="flex">
    <ProgressSpinner />
  </div>
  <div v-else-if="orderBy.property" class="order-by">
    <InputText value="Order by" disabled class="w-full md:w-20" />
    <Select v-model="orderBy.property['@id']" :options="orderProperties" optionLabel="name" optionValue="iri" placeholder="Select property" />
    <Select
      v-model="orderBy.property.direction"
      :options="getDirectionOptions(orderBy.property)"
      optionLabel="name"
      optionValue="value"
      placeholder="Select direction"
    />
    <InputText value="Limit" disabled class="w-full md:w-20" />
    <InputNumber v-model="orderBy.limit" placeholder="Set limit" class="limit" />
    <Button severity="danger" icon="fa-solid fa-trash" @click="deleteOrderBy" />
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Match, Order, OrderDirection, OrderLimit, TTIriRef } from "@/interfaces/AutoGen";
import { IM, SHACL, XSD } from "@/vocabulary";
import { Ref, onMounted, ref, watch } from "vue";
interface OrderProperty {
  name: string;
  iri: string;
  entityType: TTIriRef[];
}
interface Props {
  editMatch: Match;
  orderBy: OrderLimit;
  dmIri: string;
}
const props = defineProps<Props>();
const orderProperties: Ref<OrderProperty[]> = ref([]);
const loading = ref(true);
const orderablePropertyTypes = [IM.DATE_TIME, XSD.INTEGER, XSD.DECIMAL];
onMounted(async () => await init());

watch(
  () => props.dmIri,
  async () => await init()
);

async function init() {
  loading.value = true;
  if (props.dmIri) orderProperties.value = await getOrderProperties();
  loading.value = false;
}

async function getOrderProperties() {
  const orderProperties: OrderProperty[] = [];
  const entity = await EntityService.getPartialEntity(props.dmIri, [SHACL.PROPERTY]);
  if (isObjectHasKeys(entity, [SHACL.PROPERTY]))
    for (const prop of entity[SHACL.PROPERTY]) {
      const propType = prop[SHACL.DATATYPE] ?? prop[SHACL.CLASS] ?? prop[SHACL.NODE];
      if (orderablePropertyTypes.includes(propType[0]["@id"])) {
        const propId = prop[SHACL.PATH][0]["@id"];
        const propName = prop[SHACL.PATH][0].name;
        orderProperties.push({ name: propName, iri: propId, entityType: propType });
      }
    }
  return orderProperties;
}

function getDirectionOptions(property: OrderDirection) {
  const directionOptions: { name: string; value: Order }[] = [];
  const prop = orderProperties.value.find(op => op.iri == property["@id"]);
  if (prop) {
    if (prop.entityType[0]["@id"] === IM.DATE_TIME) {
      directionOptions.push({ name: "earliest", value: Order.ascending });
      directionOptions.push({ name: "latest", value: Order.descending });
    } else if (prop.entityType[0]["@id"] === XSD.INTEGER) {
      directionOptions.push({ name: "lowest", value: Order.ascending });
      directionOptions.push({ name: "highest", value: Order.descending });
    } else {
      directionOptions.push({ name: "first", value: Order.ascending });
      directionOptions.push({ name: "last", value: Order.descending });
    }
  }
  return directionOptions;
}
function deleteOrderBy() {
  delete props.editMatch.orderBy;
}
</script>

<style scoped>
.order-by {
  padding: 1rem;
  display: flex;
}
</style>
