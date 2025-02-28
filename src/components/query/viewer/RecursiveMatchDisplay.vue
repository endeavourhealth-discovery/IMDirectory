<template>
  <component id="recursive-match-display" :is="inline ? 'span' : 'div'" :style="offset">
    <span v-if="match.rule">
      <span class="rule">Rule {{ clauseIndex + 1 }}</span>
    </span>
    <span class="paragraph">
      <span v-if="parentMatch.union" class="number">{{ clauseIndex + 1 }}</span>
      <span class="text">
        <span v-if="parentMatch.boolMatch">
          <span v-if="clauseIndex > 0 && !match.rule">
            <span :class="parentMatch.boolMatch">{{ parentMatch.boolMatch }}</span>
          </span>
          <span v-else-if="parentMatch.boolMatch === 'or'">
            <span class="either">Either</span>
          </span>
        </span>
        <span v-if="match.exclude">
          <span v-if="parentMatch.boolMatch && parentMatch.boolMatch === 'and'">
            <span class="not">(exclude if) </span>
          </span>
          <span v-else class="not">or exclude if </span>
        </span>
        <span v-if="match.match && !match.union">(</span>
        <span v-if="match.union">
          <span class="field">Select one of the following</span>
          <span v-if="match.return">
            <span>(as</span>
            <span class="node">{{ match.return?.as }})</span>
          </span>
        </span>
        <span v-if="match.test">
          <span v-if="match.nodeRef">
            <span class="field">From</span>
            <span class="node">{{ match.nodeRef }},</span>
            <span class="field">test that</span>
          </span>
          <span v-else-if="!match.exclude" class="field">Test that:</span>
        </span>
        <span v-if="match.orderBy">{{ match.orderBy.description }}</span>
        <span v-if="match.path" class="field" v-html="getFormattedPath(match.path)"></span>
        <span v-if="match.instanceOf">
          <span v-if="match.instanceOf[0].qualifier" v-html="match.instanceOf[0].qualifier"></span>
          <IMViewerLink
            v-if="match.instanceOf[0]['@id']"
            :iri="match.instanceOf[0]['@id']"
            :label="match.instanceOf[0].name"
            @navigateTo="(iri: string) => emit('navigateTo', iri)"
          />
          <span v-if="match.instanceOf.length > 1">
            <div>
              <span v-for="(item, index) in match.instanceOf" :key="index" style="padding-left: 1.5rem">
                <span v-if="index > 0">
                  <ul>
                    <li class="tight-spacing">
                      <span class="or">or</span>
                      <IMViewerLink v-if="item['@id']" :iri="item['@id']" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
                    </li>
                  </ul>
                </span>
              </span>
            </div>
          </span>
        </span>
        <span v-if="isArrayHasLength(match.match)">
          <span v-for="(nestedQuery, index) in match.match" :key="`nestedQuery-${index}`">
            <RecursiveMatchDisplay
              :inline="index === 0 && !!props.parentMatch && !!props.parentMatch.union"
              :match="nestedQuery"
              :key="`nestedQueryDisplay-${index}`"
              :clause-index="index"
              :parent-operator="match.boolMatch"
              :depth="depth + 1"
              :parent-match="match"
              :bracketed="index === match.match!.length - 1"
            />
          </span>
        </span>
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
        <span v-if="bracketed">)</span>
      </span>
    </span>
    <div v-if="match.rule">
      <span class="field">if true</span>
      <span :class="match.ifTrue">{{ match.ifTrue }},</span>
      <span class="field">if false</span>
      <span :class="match.ifFalse">{{ match.ifFalse }}<br /></span>
    </div>
  </component>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Match, Return, Path, Bool } from "@/interfaces/AutoGen";
import { computed, onMounted, Ref, ref, watch } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
interface Props {
  match: Match;
  isVariable?: boolean;
  depth: number;
  inline: boolean;
  clauseIndex: number;
  parentMatch: Match;
  propertyIndex?: number;
  expanded?: boolean;
  canExpand?: boolean;
  bracketed?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});
const expandSet: Ref<boolean> = ref(false);

const offset = computed(() => {
  return {
    marginLeft: props.inline ? 0.5 + "em" : props.depth - 0.5 + "em"
  };
});

function toggle() {
  expandSet.value = !expandSet.value;
}

function getReturnProperties(ret: Return): string {
  return ret.property
    ? ret.property
        .map(p => p.name?.replace(/\s*\(.*?\)/, "")) // Remove bracketed term
        .join(", ") // Join names with a comma and space
    : "";
}

function getFormattedPath(path: Path): string {
  let formatted = "";
  if (path.qualifier) formatted = "<span>" + path.qualifier + "</span>";
  if (path.name) formatted = formatted + '<span style="color : rgb(0,102,102);">' + path.name + "</span>";
  if (path.node && path.node.path) return formatted + getFormattedPath(path.node.path);
  return formatted;
}
// Watch for changes in the prop and update the local copy accordingly
</script>

<style scoped>
.numbered {
  list-style: none; /* Remove default numbering */
  margin-left: 2em; /* Creates space for manual numbering */
  text-indent: -2em; /* Pulls the number back to the left */
}
.number {
  font-weight: bold;
}
.text {
  display: inline;
}
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
.rule {
  font-weight: bold;
  padding-right: 1rem;
}

.node {
  padding-left: 0.5rem;
  font-style: italic;
  padding-right: 0.3rem;
}
#recursive-match-display:deep(.or) {
  color: var(--p-blue-500);
  padding-right: 1.2rem;
}

#recursive-match-display:deep(.either) {
  color: var(--p-blue-500);
  padding-right: 0.3rem;
}

#recursive-match-display:deep(.and) {
  color: var(--p-orange-500);
  padding-right: 0.3rem;
}
#recursive-match-display:deep(.not) {
  color: var(--p-red-500) !important;
  padding-right: 0.2rem;
}
#recursive-match-display:deep(.variable) {
  color: var(--p-orange-500) !important;
}

#recursive-match-display:deep(.SELECT) {
  color: var(--p-green-500);
  padding-right: 1.2rem;
}

#recursive-match-display:deep(.REJECT) {
  color: var(--p-red-500);
  padding-right: 1.2rem;
}

#recursive-match-display:deep(.NEXT) {
  color: var(--p-purple-500);
  padding-right: 1.2rem;
}
</style>
