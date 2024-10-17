<template>
  <span v-if="index===0&&operator===Bool.or" class="either">either</span>
  <span v-else-if="index===1&&!where.where&&operator===Bool.and" style="padding-right: 1rem">with</span>
  <span v-else-if="index>1&&!where.where&&operator===Bool.and">,</span>
  <span v-else-if="operator===Bool.or" :class="operator" v-html="operator"></span>
      <span v-if="where.name" class="field" v-html="where.name"></span>
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
        <span :class="where.operator"> {{operator}}</span>
          <span>(</span>
        <div>
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
    </div>

    <RecursiveMatchDisplay
        v-if="where.match"
        :match="where.match"
        :depth="depth+1"
        :inline="true"
        :index="0"
        :expanded="childExpand"
    />
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
const childExpand= true;
const list: Ref<Node[]> = ref([]);



function getFormattedValue(value: Assignable) {
  let result="";
  if (value.qualifier) {
    result = value.qualifier+" ";
  }
  if (value.valueLabel) {
    result = result  + value.valueLabel;
  }
  return result
}

function indentationStyle(depth:number) {
  return {
    marginLeft: `${depth}rem`
  };
}



</script>

<style scoped>

.field {
  padding-right : 0.2rem;
}


.value-field {
  color :var(--p-green-700);
  padding-right : 0.2rem;
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
  color: orange;
  padding-right: 0.3rem;
}

.property-display {
  margin-left: 0.2rem;
}
</style>
