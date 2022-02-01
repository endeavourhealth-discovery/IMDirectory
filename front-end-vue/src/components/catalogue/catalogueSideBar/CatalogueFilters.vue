<template>
  <div class="p-field">
    <span class="p-float-label">
      <MultiSelect id="type" v-model="selected" :options="typeOptions" optionLabel="label" display="chip" @change="updateSelectedTypes()" />
      <label for="type">Filter by type:</label>
    </span>
  </div>
</template>

<script lang="ts">
import { SimpleCount } from "@/models/SimpleCount";
import { defineComponent, PropType } from "@vue/runtime-core";

export default defineComponent({
  name: "CatalogueFilters",
  props: { typeOptions: { type: Array as PropType<SimpleCount[]>, required: true } },
  emits: { typesSelected: (payload: SimpleCount[]) => true },
  mounted() {
    this.selected = this.typeOptions;
    this.updateSelectedTypes();
  },
  data() {
    return {
      selected: [] as SimpleCount[]
    };
  },
  methods: {
    updateSelectedTypes(): void {
      this.$emit("typesSelected", this.selected);
    }
  }
});
</script>

<style scoped>
label {
  font-size: 1rem !important;
}

.p-field {
  margin-top: 2rem;
}
</style>
