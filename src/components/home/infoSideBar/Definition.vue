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
  components: {
    TermsTable,
    ArrayObjectNameListboxWithLabel,
    ArrayObjectNameListboxWithLabelAndLoadMore,
    ArrayObjectNameTagWithLabel,
    ArrayObjectNamesToStringWithLabel,
    NumberWithLabel,
    ObjectNameTagWithLabel,
    ObjectNameWithLabel,
    SectionDivider,
    TextDefinition,
    TextHTMLWithLabel,
    TextSectionHeader,
    TextWithLabel
  }
});
</script>

<script setup lang="ts">
import { defineComponent, PropType } from "vue";
import TermsTable from "@/components/home/infoSideBar/TermsTable.vue";
import ArrayObjectNameListboxWithLabel from "@/im_library/components/modules/generics/ArrayObjectNameListboxWithLabel.vue";
import ArrayObjectNameListboxWithLabelAndLoadMore from "@/im_library/components/modules/generics/ArrayObjectNameListboxWithLabelAndLoadMore.vue";
import ArrayObjectNameTagWithLabel from "@/im_library/components/modules/generics/ArrayObjectNameTagWithLabel.vue";
import ArrayObjectNamesToStringWithLabel from "@/im_library/components/modules/generics/ArrayObjectNamesToStringWithLabel.vue";
import NumberWithLabel from "@/im_library/components/modules/generics/NumberWithLabel.vue";
import ObjectNameTagWithLabel from "@/im_library/components/modules/generics/ObjectNameTagWithLabel.vue";
import ObjectNameWithLabel from "@/im_library/components/modules/generics/ObjectNameWithLabel.vue";
import SectionDivider from "@/im_library/components/modules/generics/SectionDivider.vue";
import TextDefinition from "@/im_library/components/modules/generics/TextDefinition.vue";
import TextHTMLWithLabel from "@/im_library/components/modules/generics/TextHTMLWithLabel.vue";
import TextSectionHeader from "@/im_library/components/modules/generics/TextSectionHeader.vue";
import TextWithLabel from "@/im_library/components/modules/generics/TextWithLabel.vue";
import { DefinitionConfig } from "@/im_library/interfaces";
import { DataTypeCheckers } from "@/im_library/helpers";
const { isArrayHasLength, isObjectHasKeys, isObject } = DataTypeCheckers;

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
