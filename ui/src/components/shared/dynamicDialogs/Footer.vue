<template>
  <Button type="button" label="Close" icon="pi pi-times" @click="closeDialog({ buttonType: 'Close' })" autofocus></Button>
</template>

<script setup>
import { inject } from "vue";

const dialogRef = inject("dialogRef");

const closeDialog = e => {
  dialogRef.value.close(e);
};
</script>
