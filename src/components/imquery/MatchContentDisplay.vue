<template>
  <span v-if="from">
    <span class="field">and if the above</span>
    <span v-if="match.nodeRef" class="as">({{ match.nodeRef }})</span>
  </span>
  <span v-if="match.notExists" class="not">Exclude if </span>
  <template v-if="match.is">
    <ul>
      <template v-for="(item, index) in match.is" :key="index" style="padding-left: 1.5rem">
        <span v-if="index > 0">or</span>
        <li class="tight-spacing">
          <span class="field">in</span>
          <IMViewerLink v-if="item.iri" :iri="item.iri" :action="'view'" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </li>
      </template>
    </ul>
  </template>
  <template v-else>
    <span class="field">{{ getFormattedPath(match) }}</span>
    <span v-if="match.orderBy" class="order-by">{{ match.orderBy.description }}</span>
    <span v-if="match.where">
      <WhereDisplay :where="match.where" :depth="depth + (match.nodeRef ? 1 : 0)" :property-index="0" :key="0" :index="0" :root="true" :inline="true" />
    </span>
    <span v-if="match.node">
      <span class="field">(as</span>
      <span class="as">{{ match.node }})</span>
    </span>
  </template>
</template>

<script setup lang="ts">
import { Bool, Match } from "@/interfaces/AutoGen";
import WhereDisplay from "@/components/imquery/WhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import DirectService from "@/services/DirectService";
interface Props {
  match: Match;
  depth: number;
  parentMatch?: Match;
  clauseIndex: number;
  parentOperator?: Bool;
  from?: Match;
}
const props = defineProps<Props>();
const emit = defineEmits(["navigateTo"]);
const directService = new DirectService();
function getFormattedPath(path: any): string {
  let result = "";
  if (path.path) {
    for (let i = 0; i < path.path.length; i++) {
      if (result != "") result = result + " ->";
      result = result + path.path[i].name;
    }
  }
  return result;
}
</script>

<style scoped>
.order-by {
  padding-left: 0.2rem;
}

.as {
  color: var(--p-amber-700) !important;
}
.field {
  padding-right: 0.2rem;
}
</style>
