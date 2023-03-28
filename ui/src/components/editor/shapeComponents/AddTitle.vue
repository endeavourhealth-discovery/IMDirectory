<template>
  <div v-if="show" class="title-container">
    <h5 class="title-center" id="inherited" >Inherited</h5>
    <h5 class="title-center" id="property" >Property</h5>
    <h5 class="title-center" id="prop-type" >Type</h5>
    <h5 class="title-center" id="required" >Required</h5>
    <h5 class="title-center" id="unique" >Unique</h5>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  show: {type: Boolean, required: true}
})

</script>

<style scoped>
.title-container {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: baseline;
  overflow: auto;
}

#property {
  flex-basis: 32.5%;
  margin: 15px;
}

#prop-type {
  flex-basis: 30.5%;
}

#inherited, #required, #unique {
  flex-basis: 7.5%
}

</style>