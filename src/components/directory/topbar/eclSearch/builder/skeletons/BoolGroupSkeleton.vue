<template>
  <div class="skeleton-boolgroup-container">
    <template v-for="(item, index) in value.items">
      <div class="component-container">
        <div class="left-container">
          <div v-if="index === 0 && value.items.length > 1">&nbsp;</div>
          <Skeleton v-else class="tag-skeleton" />
        </div>
        <div class="right-container">
          <BoolGroupSkeleton v-if="item.type === 'BoolGroup'" :value="item" :parent="props.value" :focus="props.focus" />
          <component v-else :is="getSkeletonComponent(item.type)" :value="item" :parent="props.value" :focus="props.focus" />
          <div class="remove-group">
            <Skeleton class="delete-button-skeleton" />
          </div>
        </div>
      </div>
    </template>
    <div class="add-group">
      <Skeleton class="add-button-skeleton" />
      <Skeleton class="add-button-skeleton" />
      <Skeleton class="add-button-skeleton" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BoolGroupSkeleton from "./BoolGroupSkeleton.vue";
import ConceptSkeleton from "./ConceptSkeleton.vue";
import RefinementSkeleton from "./RefinementSkeleton.vue";

interface Props {
  value: any;
  parent?: any;
  focus?: any;
}
const props = defineProps<Props>();

function getSkeletonComponent(componentName: string) {
  switch (componentName) {
    case "Concept":
      return ConceptSkeleton;
    case "Refinement":
      return RefinementSkeleton;
    default:
      throw new Error(`No skeleton component found for: '${componentName}'`);
  }
}
</script>

<style scoped>
.skeleton-boolgroup-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  flex: 1;
}

.component-container {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
}

.left-container {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.right-container {
  flex: 1 0 auto;
  display: flex;
}

.tag-skeleton {
  width: 4rem !important;
  height: 1.5rem !important;
}

.add-group {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;
}

.remove-group {
  display: flex;
  align-items: center;
}

.add-button-skeleton {
  width: 8rem !important;
  height: 1.5rem !important;
}

.delete-button-skeleton {
  height: 1.5rem !important;
  width: 1.5rem !important;
}
</style>
