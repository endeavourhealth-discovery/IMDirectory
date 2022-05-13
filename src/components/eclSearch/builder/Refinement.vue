<template>
  <div class="refinement-container" :id="id">
    <div class="switch-button-container"></div>
    <div class="refinement-children-next-container">
      <span class="float-text">Refinement</span>
      <div v-if="refinementBuild && refinementBuild.length" class="refinement-children-container">
        <template v-for="child in refinementBuild" :key="child.id">
          <component
            :is="child.type"
            :value="child.value"
            :id="child.id"
            :position="child.position"
            :showButtons="child.showButtons"
            @updateClicked="updateChild"
          />
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
import Operator from "@/components/eclSearch/builder/Operator.vue";
import AddDeleteButtons from "@/components/eclSearch/AddDeleteButtons.vue";
import { Enums, Helpers } from "im-library";
import { ECLComponentDetails } from "im-library/dist/types/interfaces/Interfaces";
const { ECLComponent } = Enums;
const {
  DataTypeCheckers: { isArrayHasLength, isObjectHasKeys },
  Sorters: { byPosition },
  EclSearchBuilderMethods: { addItem, updateItem, updatePositions, generateNewComponent }
} = Helpers;

export default defineComponent({
  name: "Refinement",
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
    updateClicked: (_payload: ECLComponentDetails) => true
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
      refinementBuild: [] as ECLComponentDetails[]
    };
  },
  methods: {
    deleteClicked(): void {
      this.$emit("deleteClicked", this.createRefinement());
    },

    updateChild(data: ECLComponentDetails): void {
      updateItem(data, this.refinementBuild);
    },

    addNextClicked(item: any): void {
      this.$emit("addNextOptionsClicked", {
        position: this.position + 1,
        selectedType: item
      });
    },

    createRefinement(): ECLComponentDetails {
      return {
        id: this.id,
        value: {
          children: this.refinementBuild
        },
        position: this.position,
        type: ECLComponent.REFINEMENT,
        queryString: this.generateRefinementQueryString(),
        showButtons: this.showButtons
      };
    },

    generateRefinementQueryString(): string {
      let queryString = "";
      if (isArrayHasLength(this.refinementBuild) && this.refinementBuild.every(item => typeof item.queryString === "string")) {
        const queryStrings = this.refinementBuild.map(item => item.queryString);
        queryString = queryStrings
          .join(" ")
          .replace("/\n /g", "\n")
          .replace("/  /g", " ")
          .trim();
      }
      return queryString;
    },

    setStartBuild(): void {
      if (this.value && isObjectHasKeys(this.value, ["children"]) && isArrayHasLength(this.value.children)) {
        this.refinementBuild = [...this.value.children];
      } else {
        this.refinementBuild = [
          generateNewComponent(ECLComponent.CONSTRAINT, 0, null, { minus: false, plus: false }),
          generateNewComponent(ECLComponent.EXPRESSION, 1, null, { minus: false, plus: false }),
          generateNewComponent(ECLComponent.OPERATOR, 2, null, { minus: false, plus: false }),
          generateNewComponent(ECLComponent.CONSTRAINT, 3, null, { minus: false, plus: false }),
          generateNewComponent(ECLComponent.EXPRESSION, 4, null, { minus: false, plus: false })
        ];
      }
    },

    getButtonOptions() {
      return [ECLComponent.LOGIC];
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
