<template>
  <div :class="'query-definition ' + [edit ? 'edit ' : '']">
    <Node template="MainEntity" :object="query" path="select.entityType" valueType="TTIriRef" :highlighted="true" operator="and" :edit="edit">
      <!-- <Node :object="query" path="select.match" valueType="match" operator="and" :highlighted="true" :edit="edit"> </Node> -->
    </Node>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Node from "./Node.vue";
import { mapState } from "vuex";

export default defineComponent({
  name: "QueryDefinition",
  props: ["modelValue", "edit"],
  emits: ["stopEditing"],
  components: { Node },
  computed: {
    ...mapState(["activeClausePath"])
  },
  watch: {
    modelValue(value: any) {
      this.query = value;
    }
  },
  data() {
    return {
      activePath: "",
      query: this.modelValue
    };
  }
});
</script>

<style scoped>
.query-definition::-webkit-scrollbar {
  width: 8px;
}
.query-definition::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
  border-radius: 20px;
}

.query-definition {
  width: 600px;
  min-width: 600px;
  height: 100%;
  max-height: 600px;
  transition: all 0.2s ease-in;
  display: flex;
  overflow-y: auto;
  padding: 1.5rem;
  margin-bottom: 3rem;
  background-color: #ffffff;
  /* background-image: linear-gradient(to right, var(--tw-gradient-stops)); */
  /* transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform; */
  transition-duration: 700ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0.75rem;
  border-width: 1px;
  border-color: #d1d5db;
}

.query-definition.edit {
  border-width: 0;
  box-shadow: none;
}

/* .query-definition:not(.edit):hover {
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
} */
</style>
