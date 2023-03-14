<template>
  <div>
    in:
    <li v-for="item of inValue">
      {{ item.name || item["@id"] || item["@set"] || item["@type"] }}
    </li>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  inValue: { type: Array<any>, required: true }
});
</script>

<style scoped></style>
