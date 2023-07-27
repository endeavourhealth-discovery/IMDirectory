<template>
  <div v-if="editMode">
    <div class="edit-mode">
      <div>
        Order by:
        <Dropdown
          v-model="editOrderBy['@id']"
          :options="orderByOptions"
          optionLabel="name"
          optionValue="@id"
          placeholder="Select order by"
          class="w-full md:w-14rem"
        />
      </div>

      <div>
        Direction:
        <Dropdown v-model="editOrderBy.direction" :options="['ascending', 'descending']" placeholder="Select direction" class="w-full md:w-14rem" />
      </div>

      <div>
        Limit:
        <InputNumber v-model="editOrderBy.limit" placeholder="Add results limit" />
      </div>

      <div class="button-bar">
        <Button
          class="button-bar-button"
          label="Cancel"
          severity="secondary"
          @click="
            {
              editOrderBy = cloneDeep(orderBy);
              editMode = false;
            }
          "
        />
        <Button
          class="button-bar-button"
          label="Save"
          @click="
            {
              match.orderBy![index] = cloneDeep(editOrderBy);
              editMode = false;
            }
          "
        />
      </div>
    </div>
  </div>
  <div v-else-if="orderBy.description" v-html="orderBy.description" @dblclick="editMode = true"></div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { Match, OrderLimit, Property, TTIriRef } from "@im-library/interfaces/AutoGen";
import { cloneDeep } from "lodash";
import { Ref, onMounted, ref } from "vue";
interface Props {
  match: Match;
  index: number;
  orderBy: OrderLimit;
}
const props = defineProps<Props>();

const editMode = ref(false);
const editOrderBy: Ref<OrderLimit> = ref({} as OrderLimit);
const orderByOptions: Ref<TTIriRef[]> = ref([]);

onMounted(() => {
  if (isArrayHasLength(props.match.property)) setOrderByOptionsRecursively(props.match.property!);
  editOrderBy.value = cloneDeep(props.orderBy);
});

function setOrderByOptionsRecursively(properties: Property[]) {
  for (const prop of properties) {
    orderByOptions.value.push({ "@id": prop["@id"], name: getNameFromRef(prop) } as TTIriRef);
    if (isObjectHasKeys(prop, ["match"]) && isArrayHasLength(prop.match?.property)) setOrderByOptionsRecursively(prop.match!.property!);
  }
}
</script>

<style scoped>
.edit-mode {
  margin-left: 1rem !important;
}
</style>
