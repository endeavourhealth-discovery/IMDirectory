<template>
  <div class="h-screen w-screen overflow-auto">
    <TopBar>
      <template #content>
        <div class="flex h-full w-full items-center">
          <span class="whitespace-nowrap text-[2rem]"><strong class="text-center">Query runner</strong></span>
        </div>
      </template>
    </TopBar>
    <div class="h-[calc(100% - 3.5rem)] overflow-auto"></div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
</script>

<style scoped></style>
