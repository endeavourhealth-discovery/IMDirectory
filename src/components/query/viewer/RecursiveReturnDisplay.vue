<template>
  <span v-if="isArrayHasLength(select.property)">
    <span v-for="(item, index) in select.property">
      <component :is="!inline || index > 0 ? 'div' : 'span'" :style="{ paddingLeft: inline ? '0' : '4rem' }">
        <span v-if="pathLevel === 0 && getAs(item) != null" class="field">title={{ getAs(item) }} ( path=</span>
        <span v-if="item.name">{{ item.name }}</span>
        <span v-if="item.return">-></span>
        <RecursiveReturnDisplay v-if="item.return" :select="item.return" :inline="true" :path-level="pathLevel + 1" />
        <span v-if="item.as">)</span>
      </component>
    </span>
  </span>
</template>

<script setup lang="ts">
import { Return, ReturnProperty } from "@/interfaces/AutoGen";
import { Ref, ref, watch, defineProps } from "vue";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";

interface Props {
  select: Return;
  inline: boolean;
  pathLevel: number;
}

const props = defineProps<Props>();

function getAs(property: ReturnProperty): string | null {
  if (property.as) return property.as;
  if (property.return) {
    if (property.return?.property) {
      for (const subProperty of property.return.property) {
        const as = getAs(subProperty);
        if (as != null) return as;
      }
    }
  }
  return null;
}
</script>

<style scoped>
.field {
  padding-right: 0.2rem;
}
.return {
  color: var(--p-teal-500);
  padding-left: 0.5rem;
}
</style>

<style></style>
