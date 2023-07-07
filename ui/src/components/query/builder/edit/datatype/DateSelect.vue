<template>
  <Dropdown :options="['is', 'between', 'comparison']" v-model:model-value="propertyType" />
  <Calendar v-if="propertyType === 'is'" v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
  <div v-else-if="propertyType === 'between'">
    <Calendar v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <span> and </span>
    <Calendar v-model:model-value="selectedValueB" dateFormat="dd/mm/yy" />
  </div>
  <ComparisonSelect v-else-if="propertyType === 'comparison'" :property="property" />
  <Dropdown :options="['get all', 'get latest', 'get earliest']" v-model:model-value="get" />
</template>

<script setup lang="ts">
import ComparisonSelect from "./ComparisonSelect.vue";
import { Property } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";
interface Props {
  property: Property;
}
const props = defineProps<Props>();
const propertyType: Ref<string> = ref("is");
const selectedValueA: Ref<any> = ref();
const selectedValueB: Ref<any> = ref();
const get: Ref<any> = ref();

onMounted(() => {
  if (props.property.operator) propertyType.value = "comparison";
});
</script>

<style scoped></style>
