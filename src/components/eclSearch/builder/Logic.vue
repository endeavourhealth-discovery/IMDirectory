<template>
  <div class="logic-container" :id="id">
    <div class="label-container">
      <span class="float-text">Logic</span>
      <Dropdown v-model="selected" :options="options" placeholder="Select logic" />
    </div>
    <AddDeleteButtons :show="showButtons" :position="position" :options="getButtonOptions()" @deleteClicked="deleteClicked" @addNextClicked="addNextClicked" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import AddDeleteButtons from "@/components/eclSearch/AddDeleteButtons.vue";
import { Enums } from "im-library";
import { ECLComponentDetails } from "im-library/dist/types/interfaces/Interfaces";
const { ECLComponent } = Enums;

export default defineComponent({
  name: "Logic",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: { type: Object as PropType<{ data: string; parentGroup: Enums.ECLComponent }>, required: true },
    showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
  },
  components: { AddDeleteButtons },
  emits: {
    addNextOptionsClicked: (_payload: any) => true,
    deleteClicked: (_payload: ECLComponentDetails) => true,
    updateClicked: (_payload: ECLComponentDetails) => true
  },
  watch: {
    selected(): void {
      this.onConfirm();
    }
  },
  mounted() {
    if (this.value && this.value.data) {
      this.selected = this.value.data;
    } else {
      this.selected = this.options[0];
    }
  },
  data() {
    return {
      options: ["AND", "OR", "MINUS"] as string[],
      selected: ""
    };
  },
  methods: {
    onConfirm(): void {
      this.$emit("updateClicked", {
        id: this.id,
        value: { data: this.selected, parentGroup: this.value?.parentGroup },
        position: this.position,
        type: ECLComponent.LOGIC,
        queryString: this.selected,
        showButtons: this.showButtons
      });
    },

    deleteClicked(): void {
      this.$emit("deleteClicked", {
        id: this.id,
        value: { data: this.selected, parentGroup: this.value?.parentGroup },
        position: this.position,
        type: ECLComponent.LOGIC,
        queryString: this.selected,
        showButtons: this.showButtons
      });
    },

    addNextClicked(item: any): void {
      this.$emit("addNextOptionsClicked", {
        position: this.position + 1,
        selectedType: item
      });
    },

    getButtonOptions() {
      if (this.value.parentGroup === ECLComponent.REFINEMENT_GROUP) {
        return [ECLComponent.REFINEMENT];
      } else {
        return [ECLComponent.FOCUS_CONCEPT];
      }
    }
  }
});
</script>

<style scoped>
.logic-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.p-button-label {
  padding-left: 0.5rem;
}

.query-item-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.label-container {
  padding: 1rem;
  border: 1px solid #34314c;
  border-radius: 3px;
  position: relative;
}

.p-dropdown {
  width: 7rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
