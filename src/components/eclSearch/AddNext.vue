<template>
  <div class="add-next-container">
    <template v-for="option in options" :key="option">
      <Button icon="fas fa-plus" :label="option" class="p-button-rounded p-button-outlined p-button-danger add-next-button" @click="addItem(option)"> </Button>
    </template>
    <Button v-if="!last" icon="fas fa-minus" class="p-button-rounded p-button-outlined p-button-danger add-next-delete-button" @click="deleteClicked" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { Enums } from "im-library";
import { ECLComponentDetails, ECLNextComponentSummary } from "im-library/dist/types/interfaces/Interfaces";
const { ECLComponent, ECLType } = Enums;

export default defineComponent({
  name: "AddNext",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    last: Boolean,
    value: {
      type: Object as PropType<ECLNextComponentSummary>,
      required: true
    }
  },
  emits: {
    addClicked: (payload: { selectedType: Enums.ECLType; position: number }) => true,
    deleteClicked: (payload: ECLComponentDetails) => true
  },
  mounted() {
    this.generateOptions(this.value);
  },
  data() {
    return {
      options: [] as Enums.ECLType[]
    };
  },
  methods: {
    addItem(selectedOption: Enums.ECLType) {
      this.$emit("addClicked", {
        selectedType: selectedOption,
        position: this.value.previousPosition + 1
      });
    },

    deleteClicked() {
      this.$emit("deleteClicked", {
        id: this.id,
        position: this.position,
        value: null,
        type: ECLType.ADD_NEXT,
        component: ECLComponent.ADD_NEXT,
        label: null
      });
    },

    generateOptions(value: ECLNextComponentSummary) {
      switch (value.previousComponentType) {
        case ECLType.FOCUS_CONCEPT:
          this.options = [ECLType.LOGIC, ECLType.REFINEMENT_GROUP];
          break;
        case ECLType.LOGIC:
          if (value.parentGroup === ECLType.REFINEMENT_GROUP) {
            this.options = [ECLType.REFINEMENT];
          } else {
            this.options = [ECLType.FOCUS_CONCEPT];
          }
          break;
        case ECLType.REFINEMENT_GROUP:
          this.options = [ECLType.LOGIC];
          break;
        case ECLType.REFINEMENT:
          this.options = [ECLType.LOGIC];
          break;
        default:
          break;
      }
    }
  }
});
</script>

<style scoped>
.add-next-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
}

.add-next-button {
  border-style: dashed !important;
}
</style>
