<template>
  <span>
    <span v-if="from">
      <span class="field">and if the above</span>
      <span v-if="match.nodeRef" class="as">({{ match.nodeRef }})</span>
    </span>

    <span v-if="parentOperator === Bool.not" class="not">Exclude if </span>
    <span v-if="match.isCohort">
      <span class="field">in</span>
      <IMViewerLink v-if="match.isCohort.iri" :iri="match.isCohort.iri" :label="match.isCohort.name" :action="'view'" />
    </span>
    <span v-if="match.instanceOf">
      <span v-if="match.instanceOf[0].qualifier">{{ match.instanceOf[0].qualifier }}</span>
      <IMViewerLink v-if="match.instanceOf[0].iri" :iri="match.instanceOf[0].iri" :label="match.instanceOf[0].name" :action="'view'" />
      <span v-if="match.instanceOf.length > 1">
        <div>
          <span v-for="(item, index) in match.instanceOf" :key="index" style="padding-left: 1.5rem">
            <span v-if="index > 0">
              <ul>
                <li class="tight-spacing">
                  <span class="or">or</span>
                  <IMViewerLink v-if="item.iri" :iri="item.iri" :label="item.name" :action="'view'" />
                </li>
              </ul>
            </span>
          </span>
        </div>
      </span>
    </span>
    <span class="field">{{ getFormattedPath(match) }}</span>
    <span v-if="match.return && match.return.orderBy" class="order-by">{{ match.return.orderBy.description }}</span>
    <span v-if="match.where">
      <WhereDisplay :where="match.where" :depth="depth + (match.nodeRef ? 1 : 0)" :property-index="0" :key="0" :index="0" :root="true" :inline="true" />
    </span>

    <span v-if="match.return">
      <span class="field">(as</span>
      <span class="as">{{ match.return?.as }})</span>
    </span>
  </span>
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
