<template>
  <div class="logic-container" :id="id">
    <div class="label-container">
      <span class="float-text">Logic</span>
      <Dropdown v-model="selected" :options="options" placeholder="Select logic" />
    </div>
    <AddDeleteButtons :last="last" :position="position" @deleteClicked="deleteClicked" @addNextClicked="addNextClicked" />
  </div>
</template>

<script lang="ts">
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { defineComponent } from "vue";
import AddDeleteButtons from "@/components/sidebar/expressionConstraintsSearch/AddDeleteButtons.vue";
import { NextComponentSummary } from "@/models/ecl/NextComponentSummary";
import { ComponentDetails } from "@/models/ecl/ComponentDetails";

export default defineComponent({
  name: "Logic",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: { type: String, required: false },
    last: { type: Boolean, required: true }
  },
  components: { AddDeleteButtons },
  emits: {
    addNextOptionsClicked: (payload: NextComponentSummary) => true,
    deleteClicked: (payload: ComponentDetails) => true,
    updateClicked: (payload: ComponentDetails) => true
  },
  watch: {
    selected(): void {
      this.onConfirm();
    }
  },
  mounted() {
    if (this.value) {
      this.selected = this.value;
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
        value: this.selected,
        position: this.position,
        type: ECLType.LOGIC,
        component: ECLComponent.LOGIC,
        label: this.selected
      });
    },

    deleteClicked(): void {
      this.$emit("deleteClicked", {
        id: this.id,
        value: this.selected,
        position: this.position,
        type: ECLType.LOGIC,
        component: ECLComponent.LOGIC,
        label: this.selected
      });
    },

    addNextClicked(): void {
      this.$emit("addNextOptionsClicked", {
        previousComponentType: ECLType.LOGIC,
        previousPosition: this.position
      });
    }
  }
});
</script>

<style scoped>
.logic-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
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
  margin: 0 1rem 0 0;
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
