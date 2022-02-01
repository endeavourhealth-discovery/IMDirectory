<template>
  <div class="refinement-container" :id="id">
    <div class="switch-button-container">
      <AddDeleteButtons :last="last" :position="position" @deleteClicked="deleteClicked" @addNextClicked="addNextClicked" />
    </div>
    <div class="refinement-children-next-container">
      <span class="float-text">Refinement</span>
      <div v-if="refinementBuild && refinementBuild.length" class="refinement-children-container">
        <template v-for="child in refinementBuild" :key="child.id">
          <component :is="child.component" :value="child.value" :id="child.id" :position="child.position" @updateClicked="updateChild"> </component>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import Expression from "@/components/sidebar/expressionConstraintsSearch/Expression.vue";
import Constraint from "@/components/sidebar/expressionConstraintsSearch/Constraint.vue";
import Operator from "@/components/sidebar/expressionConstraintsSearch/Operator.vue";
import AddDeleteButtons from "@/components/sidebar/expressionConstraintsSearch/AddDeleteButtons.vue";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";
import { NextComponentSummary } from "@/models/ecl/NextComponentSummary";
import { ComponentDetails } from "@/models/ecl/ComponentDetails";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { byPosition } from "@/helpers/Sorters";

export default defineComponent({
  name: "Refinement",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: {
      type: Object as PropType<{
        children: ComponentDetails[];
      }>,
      required: false
    },
    last: { type: Boolean, required: true }
  },
  emits: {
    addNextOptionsClicked: (payload: NextComponentSummary) => true,
    deleteClicked: (payload: ComponentDetails) => true,
    updateClicked: (payload: ComponentDetails) => true
  },
  components: { Expression, Constraint, Operator, AddDeleteButtons },
  watch: {
    refinementBuild: {
      handler(): void {
        this.refinementBuild.sort(byPosition);
        this.$emit("updateClicked", this.createRefinement());
      },
      deep: true
    }
  },
  mounted() {
    this.setStartBuild();
  },
  data() {
    return {
      refinementBuild: [] as ComponentDetails[]
    };
  },
  methods: {
    deleteClicked(): void {
      this.$emit("deleteClicked", this.createRefinement());
    },

    updateChild(data: ComponentDetails): void {
      const index = this.refinementBuild.findIndex(item => item.position === data.position);
      this.refinementBuild[index] = data;
    },

    addNextClicked(): void {
      this.$emit("addNextOptionsClicked", {
        previousComponentType: ECLType.REFINEMENT,
        previousPosition: this.position,
        parentGroup: ECLType.REFINEMENT_GROUP
      });
    },

    createRefinement(): ComponentDetails {
      return {
        id: this.id,
        value: {
          children: this.refinementBuild
        },
        position: this.position,
        type: ECLType.REFINEMENT,
        label: this.generateRefinementLabel(),
        component: ECLComponent.REFINEMENT
      };
    },

    generateRefinementLabel(): string {
      let label = "";
      if (isArrayHasLength(this.refinementBuild) && this.refinementBuild.every(item => typeof item.label === "string")) {
        const labels = this.refinementBuild.map(item => item.label);
        label = labels
          .join(" ")
          .replace("/\n /g", "\n")
          .replace("/  /g", " ")
          .trim();
      }
      return label;
    },

    setStartBuild(): void {
      if (this.value && isObjectHasKeys(this.value, ["children"]) && isArrayHasLength(this.value.children)) {
        this.refinementBuild = [...this.value.children];
      } else {
        this.refinementBuild = [
          {
            component: ECLComponent.CONSTRAINT,
            id: this.id + ECLType.CONSTRAINT,
            label: "",
            position: 0,
            type: ECLType.CONSTRAINT,
            value: null
          },
          {
            component: ECLComponent.EXPRESSION,
            id: this.id + ECLType.EXPRESSION,
            label: "",
            position: 1,
            type: ECLType.EXPRESSION,
            value: null
          },
          {
            component: ECLComponent.OPERATOR,
            id: this.id + ECLType.OPERATOR,
            label: "",
            position: 2,
            type: ECLType.OPERATOR,
            value: null
          },
          {
            component: ECLComponent.CONSTRAINT,
            id: this.id + ECLType.CONSTRAINT,
            label: "",
            position: 3,
            type: ECLType.CONSTRAINT,
            value: null
          },
          {
            component: ECLComponent.EXPRESSION,
            id: this.id + ECLType.EXPRESSION,
            label: "",
            position: 4,
            type: ECLType.EXPRESSION,
            value: null
          }
        ];
      }
    }
  }
});
</script>

<style scoped>
.refinement-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}

.add-refinement-button {
  border-style: dashed !important;
}

.switch-button-container {
  order: 2;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.switch-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
}

.refinement-children-next-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid #56a902;
  border-radius: 3px;
  padding: 1rem;
  margin: 0 1em 0 0;
  position: relative;
}

.refinement-children-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
}

.buttons-container {
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  gap: 0.5rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
