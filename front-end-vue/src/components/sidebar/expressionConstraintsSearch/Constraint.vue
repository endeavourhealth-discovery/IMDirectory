<template>
  <div class="query-item-container" :id="id">
    <div class="label-container">
      <span class="float-text">Constraint</span>
      <Dropdown v-model="selected" :options="options" optionLabel="name" placeholder="Select constraint">
        <template #value="slotProps">
          <span>{{ slotProps.value.name }}</span>
        </template>
        <template #option="slotProps">
          <span> {{ slotProps.option.symbol }} {{ slotProps.option.name }} </span>
        </template>
      </Dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { ComponentDetails } from "@/models/ecl/ComponentDetails";
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Constraint",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: { type: Object as () => { name: string; symbol: string }, required: false }
  },
  emits: { updateClicked: (payload: ComponentDetails) => true },
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
        { name: "Descendant or self of", symbol: "<<" },
        { name: "Descendant of", symbol: "<" },
        { name: "Self", symbol: "" },
        { name: "Child of", symbol: "<!" },
        { name: "Child or self of", symbol: "<<!" },
        { name: "Ancestor of", symbol: ">" },
        { name: "Ancestor or self of", symbol: ">>" },
        { name: "Parent of", symbol: ">!" },
        { name: "Parent or self of", symbol: ">>!" },
        { name: "Member of", symbol: "^" }
      ] as { name: string; symbol: string }[],
      selected: {} as { name: string; symbol: string }
    };
  },
  methods: {
    onConfirm(): void {
      this.$emit("updateClicked", this.createConstraint());
    },

    createConstraint(): ComponentDetails {
      return {
        id: this.id,
        value: this.selected,
        position: this.position,
        type: ECLType.CONSTRAINT,
        label: this.selected.symbol,
        component: ECLComponent.CONSTRAINT
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
  border: 1px solid #ffc952;
  border-radius: 3px;
  position: relative;
}

.p-dropdown {
  width: 15rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
