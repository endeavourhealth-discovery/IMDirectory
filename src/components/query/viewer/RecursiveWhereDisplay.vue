<template>
  <component id="recursive-where-display" :is="inline ? 'span' : 'div'">
    <span :style="indentationStyle(inline, depth)">
      <span :class="operator">
        <span>{{ getOperator(operator, index) }}</span>
      </span>
      <span v-if="whereName" class="field">{{ whereName }}</span>
      <span v-if="eclQuery">=</span>
      <span v-if="where.valueLabel || where.qualifier">
        <span v-if="where.qualifier" class="field">{{ where.qualifier }}</span>
        <span v-if="where.valueLabel && where.is" @click="isExpanded = !isExpanded" class="hover-label flex-auto justify-start p-0">
          {{ where.valueLabel }}</span
        >
        <span v-else-if="where.valueLabel" class="field">{{ where.valueLabel }}</span>
      </span>
      <span v-if="where.relativeTo">
        <span v-if="where.relativeTo.qualifier">
          <span class="field">{{ where.relativeTo.qualifier }}</span>
        </span>
        <span class="node-ref">{{ where.relativeTo.nodeRef }}</span>
      </span>
      <span v-if="isExpanded && isArrayHasLength(where.is)">
        <span>, defined as</span>
        <div>
          <span style="list-style-type: none; padding-left: 0">
            <span v-for="(item, index) in where.is" :key="index" style="padding-left: 1.5rem">
              <ul>
                <li class="tight-spacing">
                  <IMFontAwesomeIcon :icon="getTypeIcon(item)" :style="'color:' + getIconColor(item)" />
                  <span v-if="item.qualifier" v-html="item.qualifier"></span>
                  <IMViewerLink v-if="item.iri" :iri="item.iri" :label="item.name" :action="editMode ? 'view' : 'select'" />
                  <span v-if="item.parameter">"{{ item.parameter }}" passed into query as a parameter at run time</span>
                  <span v-if="item.descendantsOrSelfOf">+subtypes</span>
                </li>
              </ul>
            </span>
          </span>
        </div>
      </span>
      <span v-for="(matches, type) in boolGroup" :key="type">
        <span v-if="!root">(</span>
        <span v-for="(nestedProperty, index) in matches" :key="index">
          <span>
            <RecursiveWhereDisplay
              :where="nestedProperty"
              :index="index"
              :operator="type as Bool"
              :key="index"
              :depth="depth + 1"
              :expandedSet="expandedSet"
              :inline="!!root"
              :root="false"
              :eclQuery="eclQuery"
              :editMode="editMode"
              :then="then"
              :bracketed="index === where[type]!.length - 1"
            />
          </span>
        </span>
        <span v-if="!root">)</span>
      </span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Where, Bool, Node } from "@/interfaces/AutoGen";
import { computed, Ref, ref, onMounted } from "vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { IM } from "@/vocabulary/IM";
import { getTypeIcon, getIconColor } from "@/helpers/ConceptTypeVisuals";

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
  then?:boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const whereName: Ref<string | undefined> = ref(undefined);
const isExpanded = ref(props.expandedSet);
const boolGroup = computed(() => {
  return {
    ...(props.where.and ? { and: props.where.and } : {}),
    ...(props.where.or ? { or: props.where.or } : {})
  };
});

onMounted(async () => {
  if (props.where.name && (props.where.name != "concept" ||props.then)) whereName.value = props.where.name;
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

function indentationStyle(inLine: boolean, depth: number) {
  return {
    paddingLeft: inLine ? "0.2rem" : depth + "rem"
  };
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
  color: var(--p-amber-700) !important;
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
