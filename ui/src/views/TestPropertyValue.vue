<template>
  <div class="formgrid grid" v-for="valuePair in propertyValuePairList" :key="valuePair.property">
    <div class="field col">
      <label :for="valuePair.property">Property</label>
      <InputText
        :id="valuePair.property"
        type="text"
        v-model="valuePair.property"
        class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
      />
    </div>
    <div class="field col-6">
      <label :for="(valuePair.value as string)">Value</label>
      <MultiSelect
        v-if="isArrayHasLength(valuePair.value)"
        :id="(valuePair.value as string)"
        type="text"
        v-model="valuePair.value"
        :options="(valuePair.value as any[])"
        optionLabel="name"
        class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
      />
      <InputText
        v-else
        :id="(valuePair.value as string)"
        type="text"
        v-model="(valuePair.value as string)"
        class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { TTIriRef } from "@im-library/interfaces";
import { onMounted, Ref, ref, PropType } from "vue";

const props = defineProps({
  propertyValuePairs: { type: Array as PropType<Array<{ property: string; value: string | TTIriRef[] }>>, required: true }
});

const propertyValuePairList: Ref<{ property: string; value: string | TTIriRef[] }[]> = ref([]);

onMounted(() => {
  for (const valuePair of props.propertyValuePairs) {
    propertyValuePairList.value.push(valuePair);
  }
});
</script>

<style scoped></style>
