<template>
  <span v-if="displayOperator" :class="parentOperator">{{ displayOperator }}</span>
  <span v-if="where.qualifier">{{ where.qualifier.name }} of </span>
  <span class="field">{{ whereName }}</span>
  <span v-if="eclQuery">=</span>
  <span v-if="where.description" class="field">{{ where.description }}</span>
  <span v-if="where.valueLabel && where.is">
    <span class="field">{{ getIsOperator(where.is, eclQuery) }}</span>
    <span class="hover-label flex-auto justify-start p-0" @click="isExpanded = !isExpanded"> {{ where.valueLabel }}</span>
  </span>
  <ValueSentenceDisplay v-if="valueSentence" :valueSentence="valueSentence" />

  <span v-if="isExpanded && isArrayHasLength(where.is)">
    <span>, defined as</span>
    <div>
      <span style="list-style-type: none; padding-left: 0">
        <span v-for="(item, index) in where.is" :key="index" style="padding-left: 1.5rem">
          <ul>
            <li class="tight-spacing">
              <IMFontAwesomeIcon :icon="getTypeIcon(item)" :style="'color:' + getIconColor(item)" />
              <span v-if="item.description" v-html="item.description"></span>
              <IMViewerLink v-if="item.iri" :iri="item.iri" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              <span v-if="item.parameter">"{{ item.parameter }}" passed into query as a parameter at run time</span>
              <span v-if="item.descendantsOrSelfOf">+subtypes</span>
            </li>
          </ul>
        </span>
      </span>
    </div>
  </span>

  <template v-if="boolGroup">
    <div v-for="(nestedProperty, subIndex) in boolGroup" :key="index" class="where-container">
      <span>
        <WhereContentDisplay
          :key="index"
          :bracketed="subIndex === boolGroup!.length - 1"
          :depth="depth + 1"
          :eclQuery="eclQuery"
          :expandedSet="expandedSet"
          :index="subIndex"
          :parentOperator="operator"
          :root="false"
          :where="nestedProperty"
        />
      </span>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { Bool, IM } from "@endeavour/vue-library/enums";
import { getColourFromType, getFAIconFromType, isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { Node, Where } from "@endeavour/vue-library/models";

import ValueSentenceDisplay from "@/components/imquery/ValueSentenceDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { buildValueSentence, getIsOperator, getRelativeTo } from "@/helpers/QueryEditorMethods";
import { getBoolGroup, getBooleanOperator, getDisplayOperator } from "@/helpers/buildQuery";

interface Props {
  where: Where;
  index: number;
  depth: number;
  parentOperator?: Bool;
  expandedSet?: boolean;
  bracketed?: boolean;
  eclQuery?: boolean;
  root?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const isExpanded = ref(props.expandedSet);
const operator = computed(() => {
  return getBooleanOperator("Where", props.where);
});
const valueSentence = computed(() => {
  return buildValueSentence(props.where);
});
const boolGroup = computed(() => {
  return getBoolGroup("Where", props.where);
});
const displayOperator = computed(() => {
  return getDisplayOperator(props.parentOperator, props.index);
});
const relativeTo = computed(() => {
  return getRelativeTo(props.where);
});
const whereName = computed(() => {
  return props.where.name ? props.where.name : "";
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
function getTypeIcon(is: Node) {
  if (is.memberOf) {
    return getFAIconFromType([{ iri: IM.CONCEPT_SET }]);
  } else return getFAIconFromType([{ iri: IM.CONCEPT }]);
}

function getIconColor(is: Node) {
  if (is.memberOf) {
    return getColourFromType([{ iri: IM.CONCEPT_SET }]);
  } else return getColourFromType([{ iri: IM.CONCEPT }]);
}
</script>

<style scoped>
.where-container {
  min-width: 0;
  font-size: 1rem;
  margin-left: 1rem;
}
.tight-spacing {
  margin-top: -1rem;
  margin-bottom: 0.5rem;
  padding-left: 3rem;
}

.field {
  padding-right: 0.2rem;
}

.value-field {
  color: var(--p-green-700);
  padding-right: 0.2rem;
}

.node-ref {
  color: var(--p-amber-700) !important;
  cursor: pointer !important;
}
.or {
  color: var(--p-blue-700);
  padding-right: 0.2rem;
}
.and {
  color: var(--p-orange-700);
  padding-right: 0.3rem;
}

.property-display {
  margin-left: 0.2rem;
}
.hover-label {
  color: var(--p-green-700);
  cursor: pointer;
}
.hover-label:hover {
  text-decoration: underline;
}
</style>
