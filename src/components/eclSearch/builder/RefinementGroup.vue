<template>
  <div class="refinement-group-container" :id="id">
    <div class="refinement-group-children-next-container">
      <span class="float-text">Refinement group</span>
      <div class="refinement-group-children-container">
        <template v-for="item in refinementGroupBuild" :key="item.id">
          <component
            :is="item.type"
            :value="item.value"
            :id="item.id"
            :position="item.position"
            :showButtons="item.showButtons"
            @deleteClicked="deleteItem"
            @addClicked="addItem"
            @updateClicked="updateItem"
            @addNextOptionsClicked="addItem"
          >
          </component>
        </template>
      </div>
      <div class="switch-button-container">
        <div class="switch-container">
          <label for="switch">Group</label>
          <InputSwitch v-model="group" />
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
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import Refinement from "@/components/eclSearch/builder/Refinement.vue";
import Logic from "@/components/eclSearch/builder/Logic.vue";
import AddDeleteButtons from "@/components/eclSearch/AddDeleteButtons.vue";
import { Enums, Helpers } from "im-library";
import { ECLComponentDetails } from "im-library/dist/types/interfaces/Interfaces";
const { ECLComponent } = Enums;
const {
  DataTypeCheckers: { isArrayHasLength },
  Sorters: { byPosition },
  EclSearchBuilderMethods: { addItem, updateItem, updatePositions, generateNewComponent }
} = Helpers;

export default defineComponent({
  name: "RefinementGroup",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: {
      type: Object as PropType<{
        children: ECLComponentDetails[];
        group: boolean;
      }>,
      required: false
    },
    showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
  },
  emits: {
    addNextOptionsClicked: (_payload: any) => true,
    addClicked: (_payload: ECLComponentDetails) => true,
    deleteClicked: (_payload: ECLComponentDetails) => true,
    updateClicked: (_payload: ECLComponentDetails) => true
  },
  components: { Refinement, Logic, AddDeleteButtons },
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
    this.setStartBuild();
  },
  data() {
    return {
      refinementGroupBuild: [] as ECLComponentDetails[],
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

    addNextClicked(item: any): void {
      this.$emit("addNextOptionsClicked", {
        position: this.position + 1,
        selectedType: item
      });
    },

    addItem(data: { selectedType: Enums.ECLComponent; position: number; value: any }): void {
      if (data.selectedType === ECLComponent.LOGIC) {
        data.value = { data: data.value, parentGroup: ECLComponent.REFINEMENT_GROUP };
      }
      addItem(data, this.refinementGroupBuild, { minus: true, plus: true });
    },

    deleteItem(data: ECLComponentDetails): void {
      const index = this.refinementGroupBuild.findIndex(child => child.position === data.position);
      this.refinementGroupBuild.splice(index, 1);
      if (this.refinementGroupBuild.length === 0) {
        this.setStartBuild();
        return;
      }
      updatePositions(this.refinementGroupBuild);
    },

    updateItem(data: ECLComponentDetails): void {
      updateItem(data, this.refinementGroupBuild);
    },

    createRefinementGroup(): ECLComponentDetails {
      return {
        id: this.id,
        value: {
          children: this.refinementGroupBuild,
          group: this.group
        },
        position: this.position,
        type: ECLComponent.REFINEMENT_GROUP,
        queryString: this.generateRefinementGroupQueryString(),
        showButtons: this.showButtons
      };
    },

    generateRefinementGroupQueryString(): string {
      let queryString = "";
      if (!isArrayHasLength(this.refinementGroupBuild)) return queryString;
      const queryStrings = this.refinementGroupBuild.map(item => {
        if (item.type === ECLComponent.LOGIC) {
          return item.queryString + "\n\t";
        } else {
          return item.queryString;
        }
      });
      queryString = queryStrings
        .join(" ")
        .trim()
        .replace(/\n\t +/, "\n\t");
      if (this.group) {
        return ":\n\t{" + queryString + "}";
      } else {
        return ":\n\t" + queryString;
      }
    },

    setStartBuild(): void {
      if (this.value && this.value.children) {
        this.refinementGroupBuild = [...this.value.children];
      } else {
        this.refinementGroupBuild = [generateNewComponent(ECLComponent.REFINEMENT, 0, null, { minus: false, plus: true })];
      }
    },

    getButtonOptions() {
      return [ECLComponent.LOGIC];
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
