<template>
  <span v-if="isArrayHasLength(select)" class="pl-8">
    <div v-for="(item, index) in select" :key="index" class="pl-12">
      <FunctionClauseDisplay v-if="item.function" :functionClause="item.function" />
      <IMViewerLink v-else-if="item.iri" :iri="item.iri" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
      <span v-if="item.as">(displayed as {{ item.as }})</span>
      <template v-if="item.semanticMap">
        <span> using output map </span>
        <IMViewerLink :iri="item.semanticMap.iri" :label="item.semanticMap.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
      </template>
      <span v-if="item.return">
        <span>{</span>
        <RecursiveReturnDisplay :select="item.return" />
        <span>}</span>
      </span>
      <span v-if="item.case">
        <span v-for="(when, whenIndex) in item.case.when" :key="whenIndex">
          <span>if</span>
          <RecursiveWhereDisplay
            v-if="when.iri || when.and || when.or"
            :key="0"
            :depth="1"
            :expandedSet="false"
            :index="0"
            :inline="true"
            :operator="Bool.and"
            :where="when"
          />
          <span v-if="when.exists" class="pl-2">exists</span>
          <span class="pl-2">then</span>
          <span class="pl-2">{{ when.then }}</span>
        </span>
        <span v-if="item.case.else" class="pl-2">else {{ item.case.else }} </span>
      </span>
    </div>
  </span>
</template>

<script lang="ts" setup>
import { Bool } from "@endeavour/vue-library/enums";
import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { Return } from "@endeavour/vue-library/models";

import FunctionClauseDisplay from "@/components/query/viewer/FunctionClauseDisplay.vue";
import RecursiveWhereDisplay from "@/components/query/viewer/RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";

defineProps<{
  select: Return[];
}>();

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
</script>

<style scoped></style>
