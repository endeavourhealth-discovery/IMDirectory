<template>
  <div class="dynamic-loading-container">
    <IMFontAwesomeIcon :icon="icon" size="4x" class="m-4" />
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <div v-if="html" v-html="html"></div>
    <div v-if="!reverseButtons" class="m-6 flex flex-row flex-nowrap items-center gap-4">
      <Button v-if="confirmButtonText" @click="confirmButtonClick" class="flex" :label="confirmButtonText" />
      <Button v-if="cancelButtonText" @click="buttonClick" severity="secondary" class="flex" :label="cancelButtonText" />
    </div>
    <div v-else class="m-6 flex flex-row flex-nowrap items-center gap-4">
      <Button v-if="cancelButtonText" @click="buttonClick" severity="secondary" class="flex" :label="cancelButtonText" />
      <Button v-if="confirmButtonText" @click="confirmButtonClick" class="flex" :label="confirmButtonText" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

const dialogRef: any = inject("dialogRef");

const title = ref("");
const text = ref("");
const html = ref("");
const icon = ref("");
const confirmButtonText = ref("");
const cancelButtonText = ref("");
const reverseButtons = ref(false);

const emit = defineEmits(["cancel", "confirm"]);

onMounted(() => {
  if (dialogRef.value) {
    const params = dialogRef.value.data;
    if (params.title) title.value = params.title;
    if (params.text) text.value = params.text;
    if (params.html) html.value = params.html;
    if (params.icon) icon.value = params.icon;
    if (params.confirmButtonText) confirmButtonText.value = params.confirmButtonText;
    if (params.cancelButtonText) cancelButtonText.value = params.cancelButtonText;
    if (params.reverseButtons) reverseButtons.value = params.reverseButtons;
  }
});

function buttonClick() {
  dialogRef.value.close({
    confirm: false
  });
}

function confirmButtonClick() {
  dialogRef.value.close({
    confirm: true
  });
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
