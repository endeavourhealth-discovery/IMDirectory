<template>
  <span v-if="isBoolWhere(where)" class="attribute-group-checkbox">
    <Checkbox
      :inputId="'attributeGroup'"
      binary
      name="As role group"
      v-model="isRoleGroup"
      data-testid="attribute-group-check"
      v-tooltip="'select if properties must be in same role group'"
    />
    <label for="attributeGroup">is role group</label>
  </span>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Where } from "@/interfaces/AutoGen";
import { isBoolWhere, getIsRoleGroup, manageRoleGroup } from "@/composables/buildQuery";

const where = defineModel<Where>("where");
const isRoleGroup = ref(getIsRoleGroup(where.value));
watch(isRoleGroup, (newValue, oldValue) => {
  if (newValue != oldValue) {
    if (where.value) {
      manageRoleGroup(where.value, newValue);
    }
  }
});
</script>

<style scoped>
.attribute-group-checkbox {
  margin-top: 0.5rem;
  padding-left: 4rem;
  padding-right: 0.5rem;
}
.attribute-group-checkbox label {
  font-size: 1rem;
  padding-left: 0.5rem;
  line-height: 1.25rem;
  font-weight: normal;
}
</style>
