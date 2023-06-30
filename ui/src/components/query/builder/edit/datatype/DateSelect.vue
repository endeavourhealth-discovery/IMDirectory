<template>
  <Dropdown :options="['is', 'between', 'comparison']" v-model:model-value="whereType" />
  <Calendar v-if="whereType === 'is'" v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
  <div v-else-if="whereType === 'between'">
    <Calendar v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <span> and </span>
    <Calendar v-model:model-value="selectedValueB" dateFormat="dd/mm/yy" />
  </div>
  <ComparisonSelect v-else-if="whereType === 'comparison'" :where="where" />
  <Dropdown :options="['get all', 'get latest', 'get earliest']" v-model:model-value="get" />
</template>

<script setup lang="ts">
import ComparisonSelect from "./ComparisonSelect.vue";
import { Where } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";
interface Props {
  where: Where;
}
const props = defineProps<Props>();
const whereType: Ref<string> = ref("is");
const selectedValueA: Ref<any> = ref();
const selectedValueB: Ref<any> = ref();
const get: Ref<any> = ref();

onMounted(() => {
  if (props.where.operator) whereType.value = "comparison";
});
</script>

<style scoped></style>
