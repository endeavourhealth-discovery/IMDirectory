<template>
  <div v-if="editMode">
    <div class="property-input-container">
      <div v-if="editingOrderBy.property">
        <div class="orderBy">
          <div class="flex-v-center">
            <label class="w-full md:w-4rem property">Order by </label>
          </div>
          <div>
            <Dropdown
              v-model="editingOrderBy.property['@id']"
              :options="orderProperties"
              optionLabel="name"
              optionValue="iri"
              placeholder="Select property"
              class="w-full md:w-14rem property"
            />
          </div>
          <div>
            <Dropdown
              v-model="editingOrderBy.property.direction"
              :options="getDirectionOptions(editingOrderBy.property)"
              optionLabel="name"
              optionValue="value"
              placeholder="Select direction"
              class="w-full md:w-14rem property"
            />
          </div>
        </div>
      </div>
      <div>
        <Button class="property" label="Add order" severity="success" @click="addOrder" />
      </div>
      <div>
        Limit:
        <InputNumber v-model="editingOrderBy.limit" placeholder="Set limit" class="w-full md:w-14rem property" />
      </div>
    </div>
    <div class="button-bar">
      <Button class="button-bar-button" label="Delete" severity="danger" @click="remove()" />
      <Button class="button-bar-button" label="Cancel" severity="secondary" @click="cancel()" />
      <Button class="button-bar-button" label="Save" @click="save()" />
    </div>
  </div>
  <div v-else-if="isObjectHasKeys(editingOrderBy, ['description'])" v-html="editingOrderBy?.description" @dblclick="editMode = true"></div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { useQueryStore } from "@/stores/queryStore";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { resolveIri } from "@im-library/helpers/TTTransform";
import { Match, Order, OrderDirection, OrderLimit, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { IM, SHACL, XSD } from "@im-library/vocabulary";
import { cloneDeep } from "lodash";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";

interface Props {
  match: Match;
  orderBy: OrderLimit;
  onAddOrderBy: boolean;
}

const props = defineProps<Props>();
const queryStore = useQueryStore();
const queryTypeIri: ComputedRef<string> = computed(() => queryStore.$state.returnType);

const editMode = ref(false);

const orderProperties: Ref<SearchResultSummary[]> = ref([]);
const orderablePropertyTypes = [IM.NAMESPACE + "DateTime", IM.NAMESPACE + "NumericValue", XSD.NAMESPACE + "number"];

const editingOrderBy: Ref<OrderLimit> = ref({});

onMounted(async () => await init());

watch(
  () => props.onAddOrderBy,
  () => {
    if (props.onAddOrderBy) editMode.value = true;
  }
);

watch(
  () => editMode.value,
  async () => {
    if (editMode.value === true) await init();
  }
);

async function init() {
  if (props.orderBy) {
    editingOrderBy.value = cloneDeep(props.orderBy);
  }

  if (props.onAddOrderBy) editMode.value = true;
  orderProperties.value = await getOrderProperties();
}

async function getOrderProperties() {
  const orderProperties: SearchResultSummary[] = [];
  const dataModelIri = isObjectHasKeys(props.match?.typeOf, ["@id"]) ? resolveIri(props.match?.typeOf!["@id"]!) : resolveIri(queryTypeIri.value);
  const entity = await EntityService.getPartialEntity(dataModelIri!, [SHACL.PROPERTY]);
  if (isObjectHasKeys(entity, [SHACL.PROPERTY]))
    for (const prop of entity[SHACL.PROPERTY]) {
      const propType = prop[SHACL.DATATYPE] ?? prop[SHACL.CLASS] ?? prop[SHACL.NODE];
      if (orderablePropertyTypes.includes(propType[0]["@id"])) {
        const propId = prop[SHACL.PATH][0]["@id"];
        const propName = prop[SHACL.PATH][0].name;
        orderProperties.push({ name: propName, iri: propId, entityType: propType } as SearchResultSummary);
      }
    }

  return orderProperties;
}

function getDirectionOptions(property: OrderDirection) {
  const directionOptions: { name: string; value: Order }[] = [];
  const prop = orderProperties.value.find(op => op.iri == property["@id"]);
  if (prop) {
    if (prop.entityType[0]["@id"] === IM.NAMESPACE + "DateTime") {
      directionOptions.push({ name: "earliest", value: Order.ascending });
      directionOptions.push({ name: "latest", value: Order.descending });
    } else if (prop.entityType[0]["@id"] === XSD.NAMESPACE + "number") {
      directionOptions.push({ name: "lowest", value: Order.ascending });
      directionOptions.push({ name: "highest", value: Order.descending });
    } else {
      directionOptions.push({ name: "first", value: Order.ascending });
      directionOptions.push({ name: "last", value: Order.descending });
    }
  }
  return directionOptions;
}

function addOrder() {
  if (editingOrderBy.value.property) editingOrderBy.value.property = {};
}

function cancel() {
  editMode.value = false;
}

function save() {
  props.match.orderBy = editingOrderBy.value;
  if (!props.match.orderBy.property && !props.match.orderBy.limit) remove();

  editMode.value = false;
}

function remove() {
  props.match.orderBy = undefined;
}
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  margin-left: 1rem;
  width: 100%;
  gap: 0.5rem;
}

.orderBy {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  gap: 0.5rem;
}

.property {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  display: flex;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.2rem;
}

.flex-v-center {
  display: flex;
  align-items: center;
}
</style>
