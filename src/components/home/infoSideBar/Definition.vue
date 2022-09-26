<template>
  <div class="content-container">
    <div class="summary-container">
      <template v-for="(config, index) in configs" :key="index">
        <component
          :is="config.type"
          :label="config.label"
          :data="concept[config.predicate]"
          :predicate="config.predicate"
          :size="config.size"
          :id="config.type + index"
          :show="showItem(config, index)"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  components: { TermsTable }
});
</script>

<script setup lang="ts">
import { defineComponent, PropType } from "vue";
import TermsTable from "@/components/home/infoSideBar/TermsTable.vue";
import { DefinitionConfig } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys, isObject }
} = Helpers;

const props = defineProps({
  concept: { type: Object, required: true },
  configs: { type: Array as PropType<Array<DefinitionConfig>>, required: true },
  totalCount: { type: Number as any }
});

function showItem(config: DefinitionConfig, index: number): boolean {
  let dataResults = [];
  if (config.type === "SectionDivider") {
    let i = index - 1;
    while (i > 0) {
      const data = props.concept[props.configs[i].predicate];
      if (props.configs[i].type === "SectionDivider") {
        break;
      }
      dataResults.push(hasData(data));
      i--;
    }
  } else if (config.type === "TextSectionHeader") {
    let i = index + 1;
    while (i < props.configs.length) {
      const data = props.concept[props.configs[i].predicate];
      if (props.configs[i].type === "SectionDivider") {
        break;
      }
      dataResults.push(hasData(data));
      i++;
    }
  } else {
    const data = props.concept[props.configs[index].predicate];
    dataResults.push(hasData(data));
  }
  return !dataResults.every(value => value === false);
}

function hasData(data: any): boolean {
  if (!data) {
    return false;
  } else if (Array.isArray(data)) {
    return isArrayHasLength(data) ? true : false;
  } else if (typeof data === "string") {
    return true;
  } else if (typeof data === "number") {
    return true;
  } else if (isObjectHasKeys(data, ["count"])) {
    return data.count ? true : false;
  } else if (isObjectHasKeys(data, ["entity", "predicates"])) {
    return isObjectHasKeys(data.entity);
  } else if (isObject(data)) {
    return isObjectHasKeys(data) ? true : false;
  } else {
    console.log(`Unexpected data type encountered for function hasData in definition. Data: ${JSON.stringify(data)}`);
    return false;
  }
}
</script>

<style scoped>
.content-container {
  height: 100%;
}

.summary-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  width: 100%;
  row-gap: 0.5rem;
}

.summary-container ::v-deep(.expand-button) {
  height: 1.5rem !important;
  width: 0.75rem !important;
  padding: 0.4375rem 0.7rem !important;
  margin-left: 0.5rem;
}
</style>
