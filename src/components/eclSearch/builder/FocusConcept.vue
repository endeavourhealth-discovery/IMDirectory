<template>
  <div class="focus-concept-container" :id="id">
    <div class="focus-concept-children-next-container">
      <span class="float-text">Focus concept</span>
      <div v-if="focusConceptBuild && focusConceptBuild.length" class="focus-concept-children-container">
        <template v-for="child of focusConceptBuild" :key="child.id">
          <component
            :is="child.type"
            :value="child.value"
            :id="child.id"
            :position="child.position"
            :showButtons="child.showButtons"
            @updateClicked="updateChild"
          >
          </component>
        </template>
      </div>
      <AddDeleteButtons
        :show="showButtons"
        :position="position"
        :options="getButtonOptions()"
        @deleteClicked="deleteClicked"
        @addNextClicked="addNextClicked"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import Expression from "@/components/eclSearch/builder/Expression.vue";
import Constraint from "@/components/eclSearch/builder/Constraint.vue";
import AddDeleteButtons from "@/components/eclSearch/AddDeleteButtons.vue";
import { Enums, Helpers } from "im-library";
import { ECLComponentDetails } from "im-library/dist/types/interfaces/Interfaces";
const { ECLComponent } = Enums;
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys },
  Sorters: { byPosition },
  EclSearchBuilderMethods: { generateNewComponent }
} = Helpers;

export default defineComponent({
  name: "FocusConcept",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: {
      type: Object as PropType<{
        children: ECLComponentDetails[];
      }>,
      required: false
    },
    showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
  },
  emits: {
    addNextOptionsClicked: (_payload: any) => true,
    deleteClicked: (_payload: ECLComponentDetails) => true,
    updateClicked: (_payload: ECLComponentDetails) => true,
    addClicked: (_payload: any) => true
  },
  components: { Expression, Constraint, AddDeleteButtons },
  watch: {
    focusConceptBuild: {
      handler() {
        this.focusConceptBuild.sort(byPosition);
        this.$emit("updateClicked", this.createFocusConcept());
      },
      deep: true
    }
  },
  mounted() {
    this.setStartBuild();
  },
  data() {
    return {
      focusConceptBuild: [] as ECLComponentDetails[]
    };
  },
  methods: {
    deleteClicked(): void {
      this.$emit("deleteClicked", this.createFocusConcept());
    },

    updateChild(data: any): void {
      const index = this.focusConceptBuild.findIndex(item => item.position === data.position);
      this.focusConceptBuild[index] = data;
    },

    createFocusConcept(): ECLComponentDetails {
      return {
        id: this.id,
        value: {
          children: this.focusConceptBuild
        },
        position: this.position,
        type: ECLComponent.FOCUS_CONCEPT,
        queryString: this.generateFocusConceptQueryString(),
        showButtons: this.showButtons
      };
    },

    generateFocusConceptQueryString(): string {
      let queryString = "";
      if (this.focusConceptBuild.length && this.focusConceptBuild.every(item => typeof item.queryString === "string")) {
        const queryStrings = this.focusConceptBuild.map(item => item.queryString);
        queryString = queryStrings
          .join(" ")
          .replace("/\n /g", "\n")
          .trim();
      }
      return queryString;
    },

    setStartBuild(): void {
      if (this.value && isObjectHasKeys(this.value, ["children"]) && isArrayHasLength(this.value.children)) {
        this.focusConceptBuild = [...this.value.children];
      } else {
        this.focusConceptBuild = [];
        this.focusConceptBuild.push(generateNewComponent(ECLComponent.CONSTRAINT, 0, null, { minus: false, plus: false }));
        this.focusConceptBuild.push(generateNewComponent(ECLComponent.EXPRESSION, 1, null, { minus: false, plus: false }));
      }
    },

    addNextClicked(item: any): void {
      this.$emit("addNextOptionsClicked", { position: this.position + 1, selectedType: item });
    },

    getButtonOptions() {
      return [ECLComponent.LOGIC, ECLComponent.REFINEMENT_GROUP];
    }
  }
});
</script>

<style scoped>
.focus-concept-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.add-focus-concept-button {
  border-style: dashed !important;
}

.focus-concept-children-next-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  gap: 1rem;
}

.focus-concept-children-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  border: 1px solid #47b8e0;
  border-radius: 3px;
  padding: 1rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
