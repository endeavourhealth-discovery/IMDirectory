<template>
  <span v-if="match.notExists" class="not">Exclude</span>
  <div v-if="match.description">
    <span class="match-description">{{ match.description }} </span>
    <span>defined as:</span>
  </div>
  <span v-if="from">
    <span class="field">and if the above</span>
    <span v-if="match.nodeRef" class="as">({{ match.nodeRef }})</span>
  </span>

  <template v-if="match.is">
    <ul>
      <template v-for="(item, index) in match.is" :key="index" style="padding-left: 1.5rem">
        <span v-if="index > 0">or</span>
        <li class="tight-spacing">
          <span class="field">in</span>
          <IMViewerLink v-if="item.iri" :action="'view'" :iri="item.iri" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </li>
      </template>
    </ul>
  </template>
  <template v-else>
    <span class="field">{{ getFormattedPath(match) }}</span>
    <span v-if="match.orderBy" class="order-by">{{ match.orderBy.description }}</span>
    <template v-if="match.where">
      <template v-if="!boolWhereGroup">
        <WhereContentDisplay :key="0" :depth="depth + (match.nodeRef ? 1 : 0)" :index="0" :root="true" :where="match.where" />
      </template>
      <template v-else>
        <WhereContentDisplay
          :key="0"
          :depth="depth + (match.nodeRef ? 1 : 0)"
          :index="0"
          :parentOperator="whereOperator"
          :root="true"
          :where="boolWhereGroup![0]"
        />
        <div v-for="(nestedProperty, subIndex) in boolWhereGroup!.slice(1)" :key="subIndex + 1" class="where-container">
          <WhereContentDisplay
            :key="0"
            :depth="depth + (match.nodeRef ? 1 : 0)"
            :index="subIndex + 1"
            :parentOperator="whereOperator"
            :root="false"
            :where="boolWhereGroup![subIndex + 1]"
          />
        </div>
      </template>
    </template>
    <div v-if="match.then && !skipThen">
      <span class="above">then with the {{ testFields }} of the above</span>
      <WhereContentDisplay :key="0" :depth="depth + 1" :index="0" :parentOperator="whereOperator" :root="false" :where="match.then" />
    </div>
    <span v-if="match.node">
      <span class="field">(as</span>
      <span class="as">{{ match.node }})</span>
    </span>
  </template>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { Bool } from "@endeavour/vue-library/enums";
import type { Match } from "@endeavour/vue-library/interfaces";

import WhereContentDisplay from "@/components/imquery/WhereContentDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { useDirectService } from "@/composables/useDirectService";
import { getBoolGroup, getBooleanOperator, getTestFields } from "@/helpers/buildQuery";

interface Props {
  match: Match;
  depth: number;
  parentMatch?: Match;
  clauseIndex: number;
  parentOperator?: Bool;
  from?: Match;
  skipThen?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(["navigateTo"]);
const directService = useDirectService();
const whereOperator = computed(() => {
  return getBooleanOperator("Where", props.match.where);
});
const boolWhereGroup = computed(() => {
  return getBoolGroup("Where", props.match.where);
});

const testFields = computed(() => {
  if (props.match.then) return getTestFields(props.match.then);
});
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
.where-container {
  min-width: 0;
  font-size: 1rem;
  margin-left: 2rem;
}
.above {
  padding-right: 0.5rem;
}

.as {
  color: var(--p-amber-700) !important;
}
.field {
  padding-right: 0.2rem;
}

.general-field {
  padding-right: 1rem;
}

.match-description {
  color: var(--p-blue-700);
  padding-right: 1rem;
}
.score {
  padding-left: 2rem;
}
</style>
