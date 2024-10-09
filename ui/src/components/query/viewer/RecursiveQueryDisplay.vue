<template>
  <div
      :style="{ paddingLeft: '1rem' }">
    <span v-if="!query.match&&!query.where&&!query.return">
      <span v-if="query.name" style="padding-left:2rem;" v-html="query.name"></span>
    </span>

    <span v-if="isArrayHasLength(query.match)||isArrayHasLength(query.where)||isArrayHasLength(query.return)">
        <Button class="button-chevron" @click="matchToggle" >
      <IMFontAwesomeIcon
          :icon="!matchExpand ? ['fa-solid','fa-chevron-right'] :  ['fa-solid','fa-chevron-up']"
          :style="'color: blue'"
          class="mr-2"
          fixed-width
      />
        </Button>
       <span v-if="query.name" v-html="query.name"></span>
      <span v-if="matchExpand&&isArrayHasLength(query.match)">
        <RecursiveMatchDisplay
        v-for="(nestedQuery,index) in query.match"
        :inline="false"
        :match="nestedQuery"
        :key="index"
        :depth="1"
        :expanded="false"
        />
      </span>
    <span v-if="matchExpand&&isArrayHasLength(query.where)">
      <RecursiveWhereDisplay
        v-for="(nestedWhere,index) in query.where"
        :property="nestedWhere"
        :depth = "1"
        :property-index="index"
        :key="index"
        :second-property="index === 1"
      />
    </span>
    <span v-if="matchExpand&&isArrayHasLength(query.return)">
      <div style="color: green;padding-left: 2rem">Fields (columns)</div>
      <RecursiveReturnDisplay
            v-for="(nestedReturn,index) in query.return"
            :select="nestedReturn"
            :inline="false"
            :pathLevel="0"
        />
      </span>
    </span>
  </div>
</template>


<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Query,Match} from "@im-library/interfaces/AutoGen";
import { onMounted, Ref, ref } from "vue";
import RecursiveWhereDisplay from "./RecursiveWhereDisplay.vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";
import RecursiveReturnDisplay from "./RecursiveReturnDisplay.vue";
import QueryOverlay from "./QueryOverlay.vue";

interface Props {
  query: Query;
  matchExpanded:boolean;
  returnExpanded:boolean;
}

const props = defineProps<Props>();
const op: Ref<any> = ref();
const clickedNodeRef: Ref<Match> = ref({} as Match);
const list: Ref<Match[]> = ref([]);
const op1: Ref<any> = ref();
const matchExpand = ref(props.matchExpanded);
const returnExpand= ref(props.returnExpanded);


const matchToggle = () => {
  matchExpand.value= !matchExpand.value;
};



</script>

<style scoped>

.button-chevron {
  background-color: transparent;
  border: none;
  cursor: pointer;
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


</style>
