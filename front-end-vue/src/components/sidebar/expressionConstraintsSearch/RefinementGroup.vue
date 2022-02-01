<template>
  <div class="refinement-group-container" :id="id">
    <div class="switch-button-container">
      <div class="switch-container">
        <label for="switch">Group</label>
        <InputSwitch v-model="group" />
      </div>
      <AddDeleteButtons :last="last" :position="position" @deleteClicked="deleteClicked" @addNextClicked="addNextClicked" />
    </div>
    <div class="refinement-group-children-next-container">
      <span class="float-text">Refinement group</span>
      <div class="refinement-group-children-container">
        <template v-for="item in refinementGroupBuild" :key="item.id">
          <component
            :is="item.component"
            :value="item.value"
            :id="item.id"
            :position="item.position"
            :last="refinementGroupBuild.length - 2 <= item.position ? true : false"
            @deleteClicked="deleteItem"
            @addClicked="addItem"
            @updateClicked="updateItem"
            @addNextOptionsClicked="addNextOptions"
          >
          </component>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import Refinement from "@/components/sidebar/expressionConstraintsSearch/Refinement.vue";
import AddNext from "@/components/sidebar/expressionConstraintsSearch/AddNext.vue";
import Logic from "@/components/sidebar/expressionConstraintsSearch/Logic.vue";
import AddDeleteButtons from "@/components/sidebar/expressionConstraintsSearch/AddDeleteButtons.vue";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";
import { NextComponentSummary } from "@/models/ecl/NextComponentSummary";
import { ComponentDetails } from "@/models/ecl/ComponentDetails";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { byPosition } from "@/helpers/Sorters";

export default defineComponent({
  name: "RefinementGroup",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: {
      type: Object as PropType<{
        children: ComponentDetails[];
        group: boolean;
      }>,
      required: false
    },
    last: { type: Boolean, required: true }
  },
  emits: {
    addNextOptionsClicked: (payload: NextComponentSummary) => true,
    addClicked: (payload: ComponentDetails) => true,
    deleteClicked: (payload: ComponentDetails) => true,
    updateClicked: (payload: ComponentDetails) => true
  },
  components: { Refinement, AddNext, Logic, AddDeleteButtons },
  watch: {
    refinementGroupBuild: {
      handler(): void {
        this.refinementGroupBuild.sort(byPosition);
        this.$emit("updateClicked", this.createRefinementGroup());
      },
      deep: true
    },
    group(): void {
      this.$emit("updateClicked", this.createRefinementGroup());
    }
  },
  mounted() {
    this.refinementGroupBuild = this.setStartBuild();
  },
  data() {
    return {
      refinementGroupBuild: [] as ComponentDetails[],
      group: false
    };
  },
  methods: {
    onConfirm(): void {
      this.$emit("addClicked", this.createRefinementGroup());
    },

    deleteClicked(): void {
      this.$emit("deleteClicked", this.createRefinementGroup());
    },

    async addNextOptions(data: NextComponentSummary): Promise<void> {
      const nextOptionsComponent = this.getNextOptions(data.previousPosition, data.previousComponentType, ECLType.REFINEMENT_GROUP);
      if (this.refinementGroupBuild[data.previousPosition + 1].type === ECLType.ADD_NEXT) {
        this.refinementGroupBuild[data.previousPosition + 1] = nextOptionsComponent;
      } else {
        this.refinementGroupBuild.splice(data.previousPosition + 1, 0, nextOptionsComponent);
      }
      this.updatePositions();
      await this.$nextTick();
      const itemToScrollTo = document.getElementById(nextOptionsComponent.id);
      itemToScrollTo?.scrollIntoView();
    },

    addNextClicked(): void {
      this.$emit("addNextOptionsClicked", {
        previousComponentType: ECLType.REFINEMENT_GROUP,
        previousPosition: this.position
      });
    },

    addItem(data: { selectedType: ECLType; position: number }): void {
      const newComponent = this.generateNewComponent(data.selectedType, data.position);
      if (!newComponent) return;
      this.refinementGroupBuild[data.position] = newComponent;
      if (this.refinementGroupBuild[this.refinementGroupBuild.length - 1].type !== ECLType.ADD_NEXT) {
        this.refinementGroupBuild.push(
          this.getNextOptions(
            this.refinementGroupBuild.length - 1,
            this.refinementGroupBuild[this.refinementGroupBuild.length - 1].type,
            ECLType.REFINEMENT_GROUP
          )
        );
      }
      this.updatePositions();
    },

    deleteItem(data: ComponentDetails): void {
      const index = this.refinementGroupBuild.findIndex(child => child.position === data.position);
      this.refinementGroupBuild.splice(index, 1);
      if (data.position === 0) {
        this.refinementGroupBuild.unshift(this.setStartBuild()[0]);
      }
      if (index < this.refinementGroupBuild.length - 1 && this.refinementGroupBuild[index].type === ECLType.ADD_NEXT) {
        this.refinementGroupBuild[index] = this.getNextOptions(index - 1, this.refinementGroupBuild[index - 1].type, ECLType.REFINEMENT_GROUP);
      }
      if (this.refinementGroupBuild[this.refinementGroupBuild.length - 1].type !== ECLType.ADD_NEXT) {
        this.refinementGroupBuild.push(
          this.getNextOptions(
            this.refinementGroupBuild.length - 1,
            this.refinementGroupBuild[this.refinementGroupBuild.length - 1].type,
            ECLType.REFINEMENT_GROUP
          )
        );
      } else {
        this.refinementGroupBuild[this.refinementGroupBuild.length - 1] = this.getNextOptions(
          this.refinementGroupBuild.length - 2,
          this.refinementGroupBuild[this.refinementGroupBuild.length - 2].type,
          ECLType.REFINEMENT_GROUP
        );
      }
      this.updatePositions();
    },

    updateItem(data: ComponentDetails): void {
      const index = this.refinementGroupBuild.findIndex(item => item.position === data.position);
      this.refinementGroupBuild[index] = data;
    },

    getNextOptions(position: number, previous: ECLType, group: ECLType | undefined): ComponentDetails {
      return {
        id: this.id + "addNext" + "_" + (position + 1),
        value: {
          previousPosition: position,
          previousComponentType: previous,
          parentGroup: group
        },
        position: position + 1,
        type: ECLType.ADD_NEXT,
        label: "",
        component: ECLComponent.ADD_NEXT
      };
    },

    updatePositions(): void {
      this.refinementGroupBuild.forEach((item: ComponentDetails, index: number) => {
        item.position = index;
      });
    },

    generateNewComponent(type: ECLType, position: number): ComponentDetails | undefined {
      let result;
      switch (type) {
        case ECLType.REFINEMENT:
          result = {
            id: this.id + ECLType.REFINEMENT + "_" + position,
            value: null,
            position: position,
            type: ECLType.REFINEMENT,
            label: "",
            component: ECLComponent.REFINEMENT
          };
          break;
        case ECLType.LOGIC:
          result = {
            id: this.id + ECLType.LOGIC + "_" + position,
            value: null,
            position: position,
            type: ECLType.LOGIC,
            label: "",
            component: ECLComponent.LOGIC
          };
          break;
        default:
          break;
      }
      return result;
    },

    createRefinementGroup(): ComponentDetails {
      return {
        id: this.id,
        value: {
          children: this.refinementGroupBuild,
          group: this.group
        },
        position: this.position,
        type: ECLType.REFINEMENT_GROUP,
        label: this.generateRefinementLabel(),
        component: ECLComponent.REFINEMENT_GROUP
      };
    },

    generateRefinementLabel(): string {
      let label = "";
      if (!isArrayHasLength(this.refinementGroupBuild)) return label;
      const labels = this.refinementGroupBuild.map(item => {
        if (item.type === ECLType.LOGIC) {
          return item.label + "\n\t";
        } else {
          return item.label;
        }
      });
      label = labels
        .join(" ")
        .trim()
        .replace(/\n\t +/, "\n\t");
      if (this.group) {
        return ":\n\t{" + label + "}";
      } else {
        return ":\n\t" + label;
      }
    },

    setStartBuild(): ComponentDetails[] {
      if (this.value && this.value.children) {
        return [...this.value.children];
      } else {
        return [
          {
            component: ECLComponent.REFINEMENT,
            id: this.id + ECLType.REFINEMENT + "_0",
            label: "",
            position: 0,
            type: ECLType.REFINEMENT,
            value: null
          },
          {
            component: ECLComponent.ADD_NEXT,
            id: this.id + ECLType.ADD_NEXT + "_1",
            value: {
              previousPosition: 0,
              previousComponentType: ECLType.REFINEMENT,
              parentGroup: ECLType.REFINEMENT_GROUP
            },
            position: 1,
            type: ECLType.ADD_NEXT,
            label: ""
          }
        ];
      }
    }
  }
});
</script>

<style scoped>
.refinement-group-container {
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
  align-items: flex-start;
  gap: 1rem;
}

.switch-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
}

.refinement-group-children-next-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid #d499b9;
  border-radius: 3px;
  padding: 1rem;
  margin: 0 1em 0 0;
  position: relative;
}

.refinement-group-children-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
