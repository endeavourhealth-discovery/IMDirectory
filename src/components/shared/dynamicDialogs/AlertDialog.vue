<template>
  <div class="dynamic-loading-container alert-dialog">
    <IMFontAwesomeIcon :icon="icon" size="4x" class="m-4" />
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <div v-if="html" v-html="html"></div>
    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>
    <div v-if="!reverseButtons" class="m-6 flex flex-row flex-nowrap items-center gap-4">
      <Button v-if="confirmButtonText" @click="confirmButtonClick" class="flex" :label="confirmButtonText" :loading="isLoading" />
      <Button v-if="denyButtonText" @click="denyButtonClick" severity="warning" class="flex" :label="denyButtonText" />
      <Button
        v-if="cancelButtonText || showCancelButton"
        @click="buttonClick"
        severity="secondary"
        class="flex"
        :label="cancelButtonText ? cancelButtonText : 'Cancel'"
      />
    </div>
    <div v-else class="m-6 flex flex-row flex-nowrap items-center gap-4">
      <Button
        v-if="cancelButtonText || showCancelButton"
        @click="buttonClick"
        severity="secondary"
        class="flex"
        :label="cancelButtonText ? cancelButtonText : 'Cancel'"
      />
      <Button v-if="denyButtonText" @click="denyButtonClick" severity="warning" class="flex" :label="denyButtonText" />
      <Button v-if="confirmButtonText" @click="confirmButtonClick" class="flex" :label="confirmButtonText" :loading="isLoading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, inject, onMounted, ref } from "vue";

import { IMFontAwesomeIcon } from "vue-library/components";

import { AlertDialogOptions, TypedDynamicDialogOptions } from "@/interfaces";
import { useDialogStore } from "@/stores/dialogStore";

const dialogRef: Ref<TypedDynamicDialogOptions<AlertDialogOptions>> | undefined = inject("dialogRef");

const dialogStore = useDialogStore();

const title = ref("");
const text = ref("");
const html = ref("");
const icon = ref("");
const confirmButtonText = ref("");
const denyButtonText = ref("");
const cancelButtonText = ref("");
const reverseButtons = ref(false);
const showCancelButton = ref(false);
const preConfirm = ref();

const isLoading = computed(() => dialogStore.isLoading);
const error = computed(() => dialogStore.error);

onMounted(() => {
  if (dialogRef?.value.data) {
    const params = dialogRef.value.data;
    if (params.title) title.value = params.title;
    if (params.text) text.value = params.text;
    if (params.html) html.value = params.html;
    if (params.icon) icon.value = params.icon;
    if (params.confirmButtonText) confirmButtonText.value = params.confirmButtonText;
    if (params.denyButtonText) denyButtonText.value = params.denyButtonText;
    if (params.cancelButtonText) cancelButtonText.value = params.cancelButtonText;
    if (params.reverseButtons) reverseButtons.value = params.reverseButtons;
    if (params.showCancelButton) showCancelButton.value = params.showCancelButton;
    if (params.preConfirm) preConfirm.value = params.preConfirm;
  }
});

function buttonClick() {
  dialogStore.cancel();
}

function confirmButtonClick() {
  dialogStore.confirm(preConfirm.value);
}

function denyButtonClick() {
  dialogStore.deny();
}
</script>

<style scoped>
.dynamic-loading-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}
</style>
}
