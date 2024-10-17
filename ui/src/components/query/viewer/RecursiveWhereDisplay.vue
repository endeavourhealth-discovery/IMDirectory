<template>
    <span class="property-display">

      <span v-html="getOperator(property.inlineOperator,propertyIndex,secondProperty)"></span>
      <span v-if="property.name" :class="'field'" v-html="property.name"></span>
        <span v-if="property.valueLabel||property.qualifier">
          <span class="'value-field'" v-html="getFormattedValue(property)"></span>
         <span v-if="property.relativeTo">
           <span v-if="property.relativeTo.qualifier">
             <span class="field" v-html="property.relativeTo.qualifier"></span>
           </span>
           <span class="node-ref" v-html="property.relativeTo.nodeRef"></span>
         </span>
           <ul v-if="expanded">
              <li v-for="(item, index) in property.is" :key="index">
                 <span v-if="item.descendantsOrSelfOf" style="padding-left : 3rem"><<</span>
                <span class="field"> {{ item.name }}</span>
                <span v-if="item.code">({{item.code}})</span>
               </li>
           </ul>
        </span>
         <span v-if="property.nodeRef" class="node-ref" v-html="property.nodeRef"></span>

      <div v-if="isArrayHasLength(property.where)"
           :style="indentationStyle(depth+1)">
        <span :class="property.operator"> {{property.operator}}</span>
          <span>(</span>
        <RecursiveWhereDisplay
          v-if="isArrayHasLength(property.where)"
          v-for="(nestedProperty, index) of property.where"
          :property="nestedProperty"
          :property-index="index"
          :key="index"
          :depth="depth+1"
          :second-property="false"
          :expanded="expanded"
        />
         <span>)</span>
    </div>

    <RecursiveMatchDisplay
        v-if="property.match"
        :match="property.match"
        :depth="depth+1"
        :inline="true"
        :expanded="childExpand"
    />

    </span>
</template>

<script setup lang="ts">
import { isArrayHasLength} from "@im-library/helpers/DataTypeCheckers";
import { Where,Assignable } from "@im-library/interfaces/AutoGen";
import { Ref, ref,watch } from "vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";

interface Props {
  property: Where;
  propertyIndex?: any;
  depth : number;
  secondProperty: boolean;
  expanded:boolean;


}

const props = defineProps<Props>();

const op: Ref<any> = ref();
const op1: Ref<any> = ref();
const childExpand= true;
const clickedProperty: Ref<Where> = ref({} as Where);
const list: Ref<Node[]> = ref([]);


function getOperator(operator:any, index:number,secondProperty : boolean){
  if (index===1&&secondProperty)
    return "with ";
  else if (operator==="or"&& index >0)
    return "or ";
  else if (index>0)
    return ", ";
  else
    return "";
}

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
function onNodeRefClick(property: Where, event: any) {
  clickedProperty.value = property;
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
  color: blue;
  padding-right: 0.3rem;
}

.and {
  color: orange;
  padding-right: 0.3rem;
}

.property-display {
  margin-left: 0.2rem;
}
</style>
