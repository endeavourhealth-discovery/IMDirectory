<template>
  <component id="recursive-where-display" :is="operator === Bool.or && index > 0 ? 'div' : 'span'">
    <span v-if="index === 0 && operator === Bool.or" class="either">either</span>
    <span
      v-else-if="index === 1 && !where.where && operator === Bool.and"
      :style="{
        paddingRight: '1rem',
        paddingLeft: expandedSet ? '3rem' : '0rem'
      }"
    >
      with</span
    >
    <span v-else-if="index > 1 && !where.where && operator === Bool.and"> ,and </span>
    <span v-else-if="operator === Bool.or" :class="operator">{{ operator }}</span>
    <span v-if="where.name" class="field">{{ where.name }}</span>

    <span v-if="where.valueLabel || where.qualifier">
      <span class="value-field" v-html="getFormattedValue(where)"></span>
      <span v-if="where.relativeTo">
        <span v-if="where.relativeTo.qualifier">
          <span class="field">{{ where.relativeTo.qualifier }}</span>
        </span>
        <span class="node-ref">{{ where.relativeTo.nodeRef }}</span>
      </span>
    </span>
    <Button v-if="where.is" class="button-chevron" text :icon="!isExpanded ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="toggle" />
    <span v-if="isExpanded && isArrayHasLength(where.is)">
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

    <div v-if="isArrayHasLength(where.where)" :style="indentationStyle(true, depth + 1)">
      <span v-if="index > 0" :class="where.operator"> {{ operator }}</span>
      <span>(</span>
      <div>
        <RecursiveWhereDisplay
          v-if="isArrayHasLength(where.where)"
          v-for="(nestedProperty, index) of where.where"
          :where="nestedProperty"
          :index="index"
          :operator="where.boolWhere"
          :key="index"
          :depth="depth + 1"
          :expandedSet="expandedSet"
        />
        <span>)</span>
      </div>
    </div>
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

interface Props {
  where: Where;
  index: number;
  depth: number;
  operator?: Bool;
  expandedSet: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

const isExpanded = ref(props.expandedSet);
const childExpand = true;

function toggle() {
  isExpanded.value = !isExpanded.value;
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

function indentationStyle(newLine: boolean, depth: number) {
  return {
    paddingLeft: newLine ? depth * 2 + "rem" : "0rem"
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

.and {
  color: var(--p-orange-700);
  padding-right: 0.3rem;
}

.property-display {
  margin-left: 0.2rem;
}
</style>
