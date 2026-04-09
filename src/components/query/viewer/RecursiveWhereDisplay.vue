<template>
  <span :class="operator">
    <span>{{ getOperator(operator, index) }}</span>
  </span>
  <span v-if="where.qualifier">{{ where.qualifier.name }} of </span>
  <span v-if="whereName" class="field">{{ whereName }}</span>
  <span v-if="where.valueLabel && where.is">
    <span class="field">{{ getIsOperator(where.is, eclQuery) }}</span>
    <span @click="isExpanded = !isExpanded" class="hover-label flex-auto justify-start p-0"> {{ where.valueLabel }}</span>
  </span>
  <span v-if="valueSentence">
    <ValueSentenceDisplay :value-sentence="valueSentence" />
  </span>
  <span v-if="isExpanded && isArrayHasLength(where.is)">
    <span>, defined as</span>
    <div>
      <span style="list-style-type: none; padding-left: 0">
        <span v-for="(item, index) in where.is" :key="index" style="padding-left: 1.5rem">
          <ul>
            <li class="tight-spacing">
              <IMFontAwesomeIcon :icon="getTypeIcon(item)" :style="'color:' + getIconColor(item)" />
              <span v-if="item.description" v-html="item.description"></span>
              <IMViewerLink v-if="item.iri" :iri="item.iri" :label="item.name" :action="editMode ? 'view' : 'select'" />
              <span v-if="item.parameter">"{{ item.parameter }}" passed into query as a parameter at run time</span>
              <span v-if="item.descendantsOrSelfOf">+subtypes</span>
            </li>
          </ul>
        </span>
      </span>
    </div>
  </span>
  <template v-for="(wheres, type) in boolGroup" :key="type">
    <span v-if="!root">(</span>
    <template v-for="(nestedProperty, index) in wheres" :key="index">
      <div :style="{ marginLeft: `${depth * 12}px` }">
        <RecursiveWhereDisplay
          :where="nestedProperty"
          :index="index"
          :operator="type as Bool"
          :depth="depth + 1"
          :expandedSet="expandedSet"
          :inline="false"
          :root="false"
          :eclQuery="eclQuery"
          :editMode="editMode"
          :bracketed="!root && index === wheres!.length - 1"
        />
      </div>
    </template>
  </template>
  <span v-if="bracketed">)</span>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Where, Bool, Node } from "@/interfaces/AutoGen";
import { computed, Ref, ref, onMounted } from "vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { getRelativeTo, buildValueSentence, getIsOperator } from "@/helpers/QueryEditorMethods";
import { IM } from "@/vocabulary/IM";
import { getTypeIcon, getIconColor } from "@/helpers/ConceptTypeVisuals";
import ValueSentenceDisplay from "@/components/imquery/ValueSentenceDisplay.vue";

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

const whereName: Ref<string | undefined> = ref(props.where.name);
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

.value-field {
  color: var(--p-green-700);
  padding-right: 0.2rem;
}

.node-ref {
  font-style: italic;
  cursor: pointer !important;
}
.or {
  color: var(--p-blue-700);
  padding-right: 0.2rem;
}
.op {
  padding-right: 1rem;
}

.and {
  color: #707824;
  font-style: italic;
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
