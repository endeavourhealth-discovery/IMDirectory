<template>
  <Suspense>
    <InformationManager />
  </Suspense>
</template>

<script lang="ts" setup>
import InformationManager from "./InformationManager.vue";
</script>
<style>
.swal2-container {
  z-index: 999999;
}
</style>
