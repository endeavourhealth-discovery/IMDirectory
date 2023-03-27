<template>
  <div class="text-container">
    <div v-for="(display, index) in textQuery.display">
      {{ display }}
    </div>
    <TextQuery v-if="isArrayHasLength(textQuery.where)" v-for="where of textQuery.where" :text-query="where" :parent="textQuery" />
    <TextQuery v-else-if="isObjectHasKeys(textQuery.from)" :text-query="textQuery.from" :parent="textQuery" />
    <div v-if="isObjectHasKeys(textQuery.orderBy)">
      <div v-for="(display, index) in textQuery.orderBy.display">
        {{ display }}
      </div>
    </div>
    <div v-if="isObjectHasKeys(textQuery.then)">
      <div v-for="(display, index) in textQuery.then.display">
        {{ display }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ITextQuery } from "@im-library/interfaces/query/TextQuery";
import { onMounted, watch, PropType, ComputedRef, computed } from "vue";
const props = defineProps({
  textQuery: { type: Object as PropType<any>, required: true },
  parent: { type: Object as PropType<any>, required: true }
});

const hasBool: ComputedRef<boolean> = computed(() => {
  return isObjectHasKeys(props.parent, ["bool"]);
});

onMounted(async () => {});
</script>

<style scoped>
.text-container {
  padding-left: 1rem;
}
</style>
