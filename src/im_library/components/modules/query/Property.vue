<template>
  <div class="property">
    <NodeIcon class="ml10 arrow-right" strokewidth="3" width="14" height="14" icon="arrow_right"></NodeIcon>
    <span class="ml10"> {{ modelValue?.name }} </span>
    <div v-if="modelValue?.inSet" class="horizontal">
      <NodeIcon class="ml10 arrow-right" strokewidth="3" width="14" height="14" icon="arrow_right"></NodeIcon>
      <div class="ml10 inSet-item" v-for="set in modelValue?.inSet">{{ set?.name }}{{ "," }}</div>
    </div>
    <div v-else-if="modelValue?.notInSet" class="horizontal">
      <NodeIcon class="ml10 arrow-right" strokewidth="3" width="14" height="14" icon="arrow_right"></NodeIcon>
      <div class="ml10 inSet-item" v-for="set in modelValue?.notInSet">{{ set?.name }}{{ "," }}</div>
    </div>
    <div v-else-if="modelValue?.value" class="horizontal">
      <NodeIcon class="ml10 arrow-right" strokewidth="3" width="14" height="14" icon="arrow_right"></NodeIcon>
      <div class="ml10 ">
        {{ comparison(modelValue?.value?.comparison) + " " }} {{ modelValue?.value?.valueData + " " }}
        {{ modelValue?.function?.argument[0].valueData?.toLowerCase()
        }}{{modelValue?.function?.argument[0].valueData && modelValue?.value?.valueData > 1 ? "s" : "" }}
      </div>
    </div>
    <div v-else-if="modelValue?.isConcept" class="horizontal">
      <NodeIcon class="ml10 arrow-right" strokewidth="3" width="14" height="14" icon="arrow_right"></NodeIcon>
      <div class="ml10 inSet-item" v-for="concept in modelValue?.isConcept">{{ concept?.name }}{{ "," }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NodeIcon from "./NodeIcon.vue";

export default defineComponent({
  name: "Property",
  props: ["modelValue"],
  components: { NodeIcon },
  methods: {
    comparison(comparison: string): string {
      switch (comparison) {
        case "GREATER_THAN_OR_EQUAL":
          return "greater than or equal to";
        case "LESS_THAN_OR_EQUAL":
          return "less than or equal to";
        case "GREATER_THAN":
          return "greater than";
        case "LESS_THAN":
          return "less than";
        default:
          return comparison;
      }
    }
  }
});
</script>

<style scoped>
.property {
  display: flex;
  /* flex-wrap: wrap; */
}
</style>
