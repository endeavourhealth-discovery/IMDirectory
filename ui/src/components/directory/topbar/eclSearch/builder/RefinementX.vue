<template>
  <div class="nested-div">
    <div style="display: flex">
      <InputText style="flex:1" placeholder="Refinement property"></InputText>
      <Dropdown style="width: 12rem" v-model="value.property.descendants" :options="descendantOptions" option-label="label" option-value="value"></Dropdown>
      <Dropdown style="width: 5rem" v-model="value.operator" :options="operatorOptions"></Dropdown>
      <InputText style="flex:1" placeholder="Refinement value"></InputText>
      <Dropdown style="width: 12rem" v-model="value.value.descendants" :options="descendantOptions" option-label="label" option-value="value"></Dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  value: { type: Object, required: true },
  parent: { type: Object, required: false },
});

const descendantOptions = [
  {
    label: 'only',
    value: ''
  },
  {
    label: 'plus descendants',
    value: '<<'
  },
  {
    label: 'descendants only',
    value: '<'
  }
]

const operatorOptions = ["=", "!="]

</script>

<style scoped>
.nested-div {
  padding: 0.5rem;
  border: #ff8c0030 1px solid;
  border-radius: 5px;
  background-color: #ff8c0010;
  margin: 0.5rem;
  flex: 1;
}
</style>
