<template>
  <div
      style="padding-left: 2rem">
    <span v-if="match.name" >
       <Button class="button-chevron" @click="toggle" >
      <IMFontAwesomeIcon
          :icon="!matchExpanded ? ['fa-solid','fa-chevron-right'] :  ['fa-solid','fa-chevron-up']"
          style="color: var(--p-blue-500)"
          class="mr-2"
          fixed-width
      />
          </Button>
    <span v-if="index>0" :class="operator">{{operator}}</span>
    <span>{{match.name}}</span>
    <div v-if="matchExpanded" >
      <span style="padding-left: 2rem;color: grey">details:</span>
      <RecursiveMatchDisplay
          :inline="false"
          :match="match"
          :depth="1"
          :index="0"
          :expanded="true"
          />
    </div>
    </span>

    <span v-else>
      <RecursiveMatchDisplay
          :inline="false"
          :match="match"
          :depth="1"
          :index="0"
          :expanded="true"
      />
    </span>

  </div>
</template>


<script setup lang="ts">
import { Match,Bool} from "@im-library/interfaces/AutoGen";
import { Ref, ref,watch,defineProps } from "vue";
import RecursiveMatchDisplay from "./RecursiveMatchDisplay.vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

interface Props {
  match: Match;
  expanded:boolean;
  operator? : Bool;
  index:number;
}


const props = defineProps<Props>();
const op: Ref<any> = ref();
const list: Ref<Match[]> = ref([]);
const matchExpanded = ref(props.expanded);

const toggle = () => {
  matchExpanded.value= !matchExpanded.value;
};




watch(() => props.expanded, (newValue:boolean) => {
  matchExpanded.value = newValue;
});

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

</style>

