<template>
  <component id="recursive-where-display" :is="inline ? 'span' : 'div'">
    <span :style="indentationStyle(inline, depth)">
      <span :class="operator">
        <span>{{ getOperator(operator, index) }}</span>
      </span>
      <span v-if="where.name" class="field">{{ where.name }}</span>
      <span v-if="(where.valueLabel || where.qualifier) && !eclQuery">
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
      <span v-if="(isExpanded || eclQuery) && isArrayHasLength(where.is)">
        <span>, defined as</span>
        <div>
          <span style="list-style-type: none; padding-left: 0">
            <span v-for="(item, index) in where.is" :key="index" style="padding-left: 1.5rem">
              <ul>
                <li class="tight-spacing">
                  <IMFontAwesomeIcon :icon="getTypeIcon(item)" :style="'color:' + getIconColor(item)" />
                  <span v-if="item.qualifier" v-html="item.qualifier"></span>
                  <IMViewerLink v-if="item['@id']" :iri="item['@id']" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
                  <span v-if="item.descendantsOrSelfOf">+subtypes</span>
                </li>
              </ul>
            </span>
          </span>
        </div>
      </span>
      <span v-else-if="where.is && eclQuery">
        <span>=</span>
        <span v-for="(item, index) in where.is" :key="index" style="padding-left: 1.5rem">
          <span v-if="index > 0" class="field">or</span>
          <IMViewerLink v-if="item['@id']" :iri="item['@id']" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
          <span v-if="item.descendantsOrSelfOf">+subtypes</span>
        </span>
      </span>
      <span v-if="isArrayHasLength(where.where)">
        <span>(</span>
        <span v-for="(nestedProperty, index) of where.where" :key="index">
          <span>
            <RecursiveWhereDisplay
              :where="nestedProperty"
              :index="index"
              :operator="where.bool"
              :key="index"
              :depth="depth + 1"
              :expandedSet="expandedSet"
              :inline="false"
              :bracketed="index === where.where!.length - 1"
            />
          </span>
        </span>
      </span>
      <span v-if="bracketed">)</span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Where, Assignable, Bool, Node } from "@/interfaces/AutoGen";
import { Ref, ref, watch } from "vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";
import { IM } from "@/vocabulary/IM";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import setupOverlay from "@/composables/setupOverlay";

interface Props {
  where: Where;
  index: number;
  depth: number;
  operator?: Bool;
  expandedSet: boolean;
  inline: boolean;
  bracketed?: boolean;
  eclQuery?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

const isExpanded = ref(props.expandedSet);
const childExpand = true;
const { OS, showOverlay, hideOverlay } = setupOverlay();
function toggle() {
  isExpanded.value = !isExpanded.value;
}

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
      if (props.where.where) return "and";
      else return "";
    }
  } else {
    if (index < 0) return "and";
    else return "";
  }
}
function getFormattedValue(value: Assignable) {
  let result = "";
  if (value.qualifier) {
    result = value.qualifier + " ";
  }
  if (value.valueLabel) {
    result = result + value.valueLabel;
  }
  return result;
}

function getTypeIcon(is: Node) {
  if (is.memberOf) {
    return getFAIconFromType([{ "@id": IM.CONCEPT_SET }]);
  } else return getFAIconFromType([{ "@id": IM.CONCEPT }]);
}

function getIconColor(is: Node) {
  if (is.memberOf) {
    return getColourFromType([{ "@id": IM.CONCEPT_SET }]);
  } else return getColourFromType([{ "@id": IM.CONCEPT }]);
}

function indentationStyle(inLine: boolean, depth: number) {
  return {
    paddingLeft: inLine ? "0rem" : depth + "rem"
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
