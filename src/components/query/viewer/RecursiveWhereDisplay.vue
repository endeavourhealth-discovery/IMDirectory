<template>
  <span :class="{ and: operator === Bool.and, or: operator === Bool.or }">
    <span>{{ getOperator(operator, index) }}</span>
  </span>
  <span v-if="where.qualifier">{{ where.qualifier.name }} of </span>
  <span v-if="whereName" class="field">{{ whereName }}</span>
  <span v-if="where.valueLabel && where.is">
    <span class="field">{{ getIsOperator(where.is, eclQuery) }}</span>
    <span class="hover-label flex-auto justify-start p-0" @click="isExpanded = !isExpanded"> {{ where.valueLabel }}</span>
  </span>
  <span v-if="valueSentence">
    <ValueSentenceDisplay :value-sentence="valueSentence" />
  </span>
  <span v-if="isExpanded && isArrayHasLength(where.is)">defined as</span>
  <div v-if="isExpanded && isArrayHasLength(where.is)">
    <ul class="where-is-list">
      <li v-for="(item, index) in where.is" :key="index" class="tight-spacing">
        <IMFontAwesomeIcon :icon="getTypeIcon(item)" :style="'color:' + getIconColor(item)" />
        <span v-if="item.description" v-html="item.description"></span>
        <IMViewerLink v-if="item.iri" :action="editMode ? 'view' : 'select'" :iri="item.iri" :label="item.name" />
        <span v-if="item.parameter">"{{ item.parameter }}" passed into query as a parameter at run time</span>
        <span v-if="item.descendantsOrSelfOf">+subtypes</span>
      </li>
    </ul>
  </div>
  <template v-for="(wheres, type) in boolGroup" :key="type">
    <span v-if="!root">(</span>
    <template v-for="(nestedProperty, index) in wheres" :key="index">
      <div :style="{ marginLeft: `${depth * 12}px` }">
        <RecursiveWhereDisplay
          :bracketed="!root && index === wheres!.length - 1"
          :depth="depth + 1"
          :eclQuery="eclQuery"
          :editMode="editMode"
          :expandedSet="expandedSet"
          :index="index"
          :inline="false"
          :operator="type as Bool"
          :root="false"
          :where="nestedProperty"
        />
      </div>
    </template>
  </template>
  <span v-if="bracketed">)</span>
</template>

<script lang="ts" setup>
import { Ref, computed, ref } from "vue";

import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { Bool } from "@endeavour/vue-library/enums";
import { getIconColor, getTypeIcon, isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { Where } from "@endeavour/vue-library/models";

import ValueSentenceDisplay from "@/components/imquery/ValueSentenceDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { buildValueSentence, getIsOperator, getRelativeTo } from "@/helpers/QueryEditorMethods";

interface Props {
  where: Where;
  index: number;
  depth: number;
  operator?: Bool;
  expandedSet: boolean;
  inline: boolean;
  bracketed?: boolean;
  eclQuery?: boolean;
  root?: boolean;
  editMode?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const whereName: Ref<string | undefined> = computed(() => {
  if (props.where.name) return props.where.name;
});
const isExpanded = ref(props.expandedSet);
const relativeTo = computed(() => {
  return getRelativeTo(props.where);
});
const boolGroup = computed(() => {
  return {
    ...(props.where.and ? { and: props.where.and } : {}),
    ...(props.where.or ? { or: props.where.or } : {})
  };
});
const valueSentence = computed(() => {
  return buildValueSentence(props.where);
});

function getOperator(operator: Bool | undefined, index: number): string {
  if (operator === "or") {
    if (index === 0) {
      return "Either";
    } else {
      return "or";
    }
  } else if (operator === "and") {
    if (index > 0) {
      return "and";
    } else {
      return "";
    }
  } else {
    if (index < 0) return "and";
    else return "";
  }
}
</script>

<style scoped>
.tight-spacing {
  margin-top: -1rem;
  margin-bottom: 0.5rem;
  padding-left: 3rem;
}

.field {
  padding-right: 0.2rem;
}

.or {
  color: var(--p-blue-700);
  padding-right: 0.2rem;
}

.and {
  color: #707824;
  font-style: italic;
  padding-right: 0.3rem;
}

.hover-label {
  color: var(--p-green-700);
  cursor: pointer;
}
.hover-label:hover {
  text-decoration: underline;
}
.where-is-list {
  list-style-type: none;
  padding-left: 1.5rem;
  margin: 0;
}
</style>
