<template>
  <component
      :is="!inline ? 'div' : 'span'"
      :style="indentationStyle(inline,depth)">
    <span v-if="match.hasInlineSet">
    <Button class="button-chevron" @click="toggle" >
      <IMFontAwesomeIcon
          :icon="!expandSet ? ['fa-solid','fa-chevron-right'] :  ['fa-solid','fa-chevron-up']"
          style="color: var(--p-blue-500)"
          class="mr-2"
          fixed-width
      />
    </Button>
    </span>
    <span v-if="match.includeIf" class="then">{{ match.includeIf }}</span>
    <span v-if="operator">
      <span v-if="index>0" :class="operator">{{ operator}}</span>
        <span v-else-if="operator===Bool.or" class="either">either</span>
    </span>
    <span v-if="match.exclude" class="field">NOT</span>
    <span v-if="match.orderBy" class="field" v-html="match.orderBy.description"></span>
        <span v-if="match.path"  class="field" v-html="getFormattedPath(match.path)"> </span>
       <span v-if="match.instanceOf" v-html="getFormattedNodes(match.instanceOf)"></span>
    <span v-if="match.match" >(</span>

    <RecursiveMatchDisplay
        v-if="isArrayHasLength(match.match)"
        v-for="(nestedQuery,index) in match.match"
        :inline="false"
        :match="nestedQuery"
        :key="index"
        :index="index"
        :operator="match.boolMatch"
        :depth="1"
    />
    <RecursiveWhereDisplay
        v-if="isArrayHasLength(match.where)"
        v-for="(nestedWhere,index) in match.where"
        :where="nestedWhere"
        :depth = "depth"
        :property-index="index"
        :key="index"
        :index="index"
        :operator="match.boolWhere"
        :expanded="expandSet"
    />
    <RecursiveMatchDisplay
        v-if="match.then"
        :match="match.then"
        :inline="false"
        :index="0"
        :depth="1"
    />



    <div v-if="match.variable" :class="'variable-field'" :style="{ paddingLeft: depth * 3+2 + 'rem' }">
      <span>named {{match.variable}}</span>
    </div>
    <span v-if="match.match" :style="{ paddingLeft: (depth * 3) + 'rem' }">)</span>
   </component>
</template>


<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match,Assignable,IriLD,Node,Bool} from "@im-library/interfaces/AutoGen";
import { onMounted, Ref, ref,watch,defineProps } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import QueryOverlay from "./QueryOverlay.vue";



interface Props {
  match: Match;
  isVariable? : boolean;
  depth: number;
  inline : boolean;
  index : number;
  operator? :Bool;
}

const props = defineProps<Props>();
const op: Ref<any> = ref();
const clickedNodeRef: Ref<Match> = ref({} as Match);
const list: Ref<Match[]> = ref([]);
const op1: Ref<any> = ref();
const expandSet= ref(false);



const toggle = () => {
  expandSet.value= !expandSet.value;
};

function indentationStyle(inline:boolean, depth:number){
  return {
    paddingLeft: !inline ? depth * 2 + 'rem' : '0rem'
  }
}
function getFormattedNodes(values: Node[]) {
  const value= values
      .map(item => {
        const parts = [];
        if (item.qualifier)
          parts.push("<span>"+item.qualifier+"</span>");
        if (item.name)
          parts.push("<span style=\"color : rgb(0,102,102);\">"+item.name+"</span>");
        return parts.join(' ');
      })
      .join(', ');
    return value;
}

function getFormattedPath(paths: IriLD[]) {
  const path= paths
      .map(item => {
        const parts = [];
        if (item.qualifier)
          parts.push("<span>"+item.qualifier+"</span>");
        if (item.name)
          parts.push("<span style=\"color : rgb(0,102,102);\">"+item.description+"</span>");
        return parts.join(' ');
      })
      .join('-> ');
  return path;
}
// Watch for changes in the prop and update the local copy accordingly


</script>


<style scoped>

.button-chevron {
  background-color: transparent;
  border: none;
  cursor: pointer;
}
.feature {
  display: flex;
  flex-flow: column;
  margin-left: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
}

.feature-indent {
  display: flex;
  flex-flow: column;
  margin-left: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
}
.then {
  padding-right: 0.2rem;
  color : rgb(72,32,92)
}
.field {
  padding-right : 0.2rem;
}

.variable-field {
  padding-left : 2rem;
  color : rgb(180, 48, 190);
  padding-right : 0.3rem;
}


.return {
  color: lightseagreen;
  padding-left: 0.5rem;
}

.output {
  color: mediumslateblue;
}
</style>

<style>
.or {
  color: blue;
  padding-right: 0.3rem;
}

.either {
  color: blue;
  padding-right: 0.3rem;
}

.and {
  color: orange;
  padding-right: 0.3rem;
}

.variable {
  color: rgb(78, 2, 150) !important;
}
</style>
