<template>
  <div class="query-item-container" :id="id">
    <div class="label-container">
      <span class="float-text">Operator</span>
      <Dropdown v-model="selected" :options="options" optionLabel="name" placeholder="Select operator">
        <template #value="slotProps">
          <span>{{ slotProps.value.name }}</span>
        </template>
        <template #option="slotProps">
          <span>{{ slotProps.option.name }}</span>
        </template>
      </Dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { Enums } from "im-library";
import { ECLComponentDetails } from "im-library/dist/types/interfaces/Interfaces";
const { ECLComponent, ECLType } = Enums;

export default defineComponent({
  name: "Operator",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: {
      type: Object as PropType<{
        symbol: string;
        name: string;
      }>,
      required: false
    }
  },
  emits: { updateClicked: (payload: ECLComponentDetails) => true },
  watch: {
    selected() {
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
      options: [
        { symbol: "=", name: "Equals" },
        { symbol: "!=", name: "Not equals" }
      ] as { symbol: string; name: string }[],
      selected: { symbol: "=", name: "Equals" } as { symbol: string; name: string },
      edit: false
    };
  },
  methods: {
    onConfirm() {
      this.$emit("updateClicked", this.createOperator());
    },

    createOperator(): ECLComponentDetails {
      return {
        id: this.id,
        value: this.selected,
        position: this.position,
        type: ECLType.OPERATOR,
        component: ECLComponent.OPERATOR,
        label: this.selected.symbol
      };
    }
  }
});
</script>

<style scoped>
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

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
