<template>
  <div>
    <span class="field">Function:</span>
    <IMViewerLink v-if="functionClause.iri" :iri="functionClause.iri" :label="functionClause.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
    <span>(</span>
  </div>
  <template v-if="functionClause.argument">
    <div v-for="(argument, index) in functionClause.argument" :key="index" class="pl-12">
      <template v-if="argument.valuePath">
        <IMViewerLink
          v-if="argument.valuePath.iri"
          :iri="argument.valuePath.iri"
          :label="argument.valuePath.name"
          @navigateTo="(iri: string) => emit('navigateTo', iri)"
        />
      </template>
      <template v-if="argument.valueIri">
        <IMViewerLink
          v-if="argument.valueIri.iri"
          :iri="argument.valueIri.iri"
          :label="argument.valueIri.name"
          @navigateTo="(iri: string) => emit('navigateTo', iri)"
        />
      </template>
      <template v-if="argument.valueIriList">
        <span v-for="(valueIri, index) in argument.valueIriList" :key="index">
          <IMViewerLink v-if="valueIri.iri" :iri="valueIri.iri" :label="valueIri.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
          <span v-if="index > 0">,</span>
        </span>
      </template>
    </div>
  </template>
  <span>) </span>
</template>

<script setup lang="ts">
import type { FunctionClause, Node } from "@endeavour/vue-library/interfaces";

import IMViewerLink from "@/components/shared/IMViewerLink.vue";

const props = defineProps<{
  functionClause: FunctionClause;
}>();
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
</script>

<style scoped>
.field {
  margin-right: 2rem;
}
</style>
