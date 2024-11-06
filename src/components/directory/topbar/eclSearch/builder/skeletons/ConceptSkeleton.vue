<template>
  <div class="skeleton-concept-container">
    <Skeleton />
    <Skeleton />
    <Skeleton />
    <Skeleton />
    <Skeleton />
  </div>
  <div v-if="isArrayHasLength(children)" class="children-container">
    <template v-for="(item, index) in value.items">
      <div class="left-container">
        <div v-if="index === 0 && value.items.length > 1">&nbsp;</div>
        <Skeleton v-else class="logic-button-skeleton" />
      </div>
      <ConceptSkeleton v-if="item.type === 'Concept'" :value="item" :parent="props.value" :focus="props.focus" />
      <component v-else :is="getSkeletonComponent(item.type)" :value="item" :parent="value" :focus="value.concept" />
      <div class="remove-group">
        <Skeleton class="delete-button-skeleton" />
      </div>
    </template>
    <div class="add-group">
      <Skeleton class="add-button-skeleton" />
      <Skeleton class="add-button-skeleton" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys, isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { ref, Ref } from "vue";
import BoolGroupSkeleton from "./BoolGroupSkeleton.vue";
import ConceptSkeleton from "./ConceptSkeleton.vue";

interface Props {
  value?: any;
  parent?: any;
  focus?: any;
}
const props = defineProps<Props>();

const children: Ref<any[]> = ref([]);

function processSkeletonProps() {
  if (isObjectHasKeys(props.value, ["items"])) {
    props.value.items.forEach((item: any) => {
      children.value.push(item);
    });
  }
}

function getSkeletonComponent(componentName: string) {
  switch (componentName) {
    case "Concept":
      return ConceptSkeleton;
    case "BoolGroup":
      return BoolGroupSkeleton;
    default:
      throw new Error(`No skeleton component found for: '${componentName}'`);
  }
}
</script>

<style scoped>
.skeleton-concept-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
}
</style>
