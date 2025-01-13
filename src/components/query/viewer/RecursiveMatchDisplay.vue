<template>
  <component id="recursive-match-display" :is="!inline ? 'div' : 'span'" :style="indentationStyle(inline, depth)">
    <span v-if="match.hasInlineSet">
      <Button class="button-chevron" text :icon="!expandSet ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'" @click="toggle" />
    </span>
    <span v-if="match.includeIf" class="then">{{ match.includeIf }}</span>
    <span v-if="index > 0" :class="operator">{{ operator }}</span>
    <span v-else-if="operator === Bool.or" class="either">either</span>
    <span v-if="match.exclude" class="field">NOT</span>
    <span v-if="match.orderBy" class="field">{{ match.orderBy.description }}</span>
    <span v-if="match.path" class="field" v-html="getFormattedPath(match.path)"></span>
    <span v-if="match.instanceOf">
      <span v-if="match.instanceOf[0].qualifier" v-html="match.instanceOf[0].qualifier"></span>
       <IMViewerLink v-if="match.instanceOf[0]['@id']"
                     :iri="match.instanceOf[0]['@id']" :label="match.instanceOf[0].name" @navigateTo="(iri: string) => emit('navigateTo', iri)"
       />

      <span v-if="match.instanceOf.length > 1">
        <div>
          <span v-for="(item, index) in match.instanceOf" :key="index" style="padding-left: 1.5rem">
            <span v-if="index > 0">
              <ul>
                <li class="tight-spacing">
                  <span class="or">or</span>
                  <IMViewerLink v-if="item['@id']"
                                :iri="item['@id']" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)"
                  />
                </li>
              </ul>
            </span>
          </span>
        </div>
      </span>
    </span>
    <span v-if="match.match">(</span>

    <div v-if="isArrayHasLength(match.match)">
      <RecursiveMatchDisplay
        v-for="(nestedQuery, index) in match.match"
        :inline="false"
        :match="nestedQuery"
        :key="index"
        :index="index"
        :operator="match.boolMatch"
        :depth="1"
      />
    </div>

    <span v-if="isArrayHasLength(match.where)">
      <RecursiveWhereDisplay
        v-for="(nestedWhere, index) in match.where"
        :where="nestedWhere"
        :depth="depth"
        :property-index="index"
        :key="index"
        :index="index"
        :operator="match.boolWhere"
        :expandedSet="expandSet"
      />
    </span>

    <RecursiveMatchDisplay v-if="match.then" :match="match.then" :inline="false" :index="0" :depth="1" />

    <div v-if="match.variable" class="variable-field" :style="{ paddingLeft: depth * 3 + 2 + 'rem' }">
      <span>named {{ match.variable }}</span>
    </div>
    <span v-if="match.match" :style="{ paddingLeft: depth * 3 + 'rem' }">)</span>
  </component>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Match, Assignable, IriLD, Node, Bool } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref, watch } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
interface Props {
  match: Match;
  isVariable?: boolean;
  depth: number;
  inline: boolean;
  index: number;
  operator?: Bool;
}

const props = defineProps<Props>();


const emit = defineEmits({
  navigateTo: (_payload: string) => true
});
const expandSet: Ref<boolean> = ref(false);

function toggle() {
  expandSet.value = !expandSet.value;
}

function indentationStyle(inline: boolean, depth: number) {
  return {
    paddingLeft: !inline ? depth * 2 + "rem" : "0rem"
  };
}
function getFormattedNodes(values: Node[]) {
  const value = values
    .map(item => {
      const parts = [];
      if (item.qualifier) parts.push("<span>" + item.qualifier + "</span>");
      if (item.name) parts.push('<span style="color : rgb(0,102,102);">' + item.name + "</span>");
      return parts.join(" ");
    })
    .join(", ");
  return value;
}

function getFormattedPath(paths: IriLD[]) {
  const path = paths
    .map(item => {
      const parts = [];
      if (item.qualifier) parts.push("<span>" + item.qualifier + "</span>");
      if (item.name) parts.push('<span style="color : rgb(0,102,102);">' + item.name + "</span>");
      return parts.join(" ");
    })
    .join("-> ");
  return path;
}
// Watch for changes in the prop and update the local copy accordingly
</script>

<style scoped>
.tight-spacing {
  margin-top: -1rem;
  margin-bottom: 0.5rem;
}

.then {
  padding-right: 0.2rem;
}
.field {
  padding-right: 0.2rem;
}

.variable-field {
  padding-left: 2rem;
  color: var(--p-amber-700);
  padding-right: 0.3rem;
}

#recursive-match-display:deep(.or) {
  color: var(--p-blue-500);
  padding-right: 0.3rem;
}

#recursive-match-display:deep(.either) {
  color: var(--p-blue-500);
  padding-right: 0.3rem;
}

#recursive-match-display:deep(.and) {
  color: var(--p-orange-500);
  padding-right: 0.3rem;
}

#recursive-match-display:deep(.variable) {
  color: var(--p-orange-500) !important;
}
</style>
