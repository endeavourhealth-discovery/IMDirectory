<template>
  <div class="breadcrumb-container">
    <div class="padding-container grid">
      <div class="col-10 table-header">
        <Breadcrumb :home="home" :model="pathItems" />
        <Menu id="path_overlay_menu" ref="pathOverlayMenu" :model="pathOptions" :popup="true" />
      </div>
      <div class="col-2 header-button-group p-buttonset">
        <Button icon="pi pi-angle-left" :disabled="canGoBack" class="go-back p-button-rounded p-button-text p-button-plain" @click="goBack" />
        <Button icon="pi pi-angle-right" :disabled="canGoForward" class="go-forward p-button-rounded p-button-text p-button-plain" @click="goForward" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style scoped></style>
