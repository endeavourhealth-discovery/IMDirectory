<template>
    <span class="property-display">
      <span v-if="operator">
        <span v-if="operator===Bool.and">
          <span v-if="index===1" style="padding-right: 1rem">with</span>
       <span v-else>,</span>
        </span>
       <span v-else-if="index>1&&operator===Bool.or" :class="operator" v-html="operator"></span>
      </span>
      <span v-if="where.name" :class="'field'" v-html="where.name"></span>
        <span v-if="where.valueLabel||where.qualifier">
          <span class="value-field" v-html="getFormattedValue(where)"></span>
         <span v-if="where.relativeTo">
           <span v-if="where.relativeTo.qualifier">
             <span class="field" v-html="where.relativeTo.qualifier"></span>
           </span>
           <span class="node-ref" v-html="where.relativeTo.nodeRef"></span>
         </span>
           <ul v-if="expanded">
              <li v-for="(item, index) in where.is" :key="index">
                <span style="padding-left : 3rem"></span>
                 <span v-if="item.descendantsOrSelfOf"><<</span>
                <span class="field"> {{ item.name }}</span>
                <span v-if="item.code">({{item.code}})</span>
               </li>
           </ul>
        </span>
         <span v-if="where.nodeRef" class="node-ref" v-html="where.nodeRef"></span>

      <div v-if="isArrayHasLength(where.where)"
           :style="indentationStyle(depth+1)">
        <span :class="where.operator"> {{where.operator}}</span>
          <span>(</span>
        <RecursiveWhereDisplay
          v-if="isArrayHasLength(where.where)"
          v-for="(nestedProperty, index) of where.where"
          :where="nestedProperty"
          :index="index"
          :operator="where.boolWhere"
          :key="index"
          :depth="depth+1"
          :expanded="expanded"
        />
         <span>)</span>
    </div>

    <RecursiveMatchDisplay
        v-if="where.match"
        :match="where.match"
        :depth="depth+1"
        :inline="true"
        :index="0"
        :expanded="childExpand"
    />

    </span>
</template>

<script setup lang="ts">
import { isArrayHasLength} from "@im-library/helpers/DataTypeCheckers";
import { Where,Assignable,Bool } from "@im-library/interfaces/AutoGen";
import { Ref, ref,watch } from "vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";

interface Props {
  where: Where;
  index: number;
  depth : number;
  expanded:boolean;
  operator?: Bool;


}

const props = defineProps<Props>();

const op: Ref<any> = ref();
const op1: Ref<any> = ref();
const childExpand= true;
const clickedProperty: Ref<Where> = ref({} as Where);
const list: Ref<Node[]> = ref([]);



function getFormattedValue(value: Assignable) {
  let result="";
  if (value.qualifier) {
    result = value.qualifier+" ";
  }
  if (value.valueLabel) {
    result = result + "<span style=\"color : rgb(0,102,102);\">" + value.valueLabel + "</span>";
  }
  return result
}

function indentationStyle(depth:number) {
  return {
    marginLeft: `${depth}rem`
  };
}
function onNodeRefClick(where: Where, event: any) {
  clickedProperty.value = where;
  op.value.toggle(event);
}


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
  margin-left: 2rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
}

.field {
  padding-right : 0.2rem;
}


.value-field {
  color : rgb(0, 102, 102);
  padding-right : 0.2rem;
}


.node-field {
  color : rgb(180, 48, 190);
  padding-right : 0.3rem;
}

.variable-line {
  margin-left: 1rem !important;
}

.node-ref {
  color: rgb(138, 67, 138) !important;
  cursor: pointer !important;
}
.or {
  color: var(--p-blue-500);
  padding-right: 0.2rem;
}

.and {
  color: orange;
  padding-right: 0.3rem;
}

.property-display {
  margin-left: 0.2rem;
}
</style>
