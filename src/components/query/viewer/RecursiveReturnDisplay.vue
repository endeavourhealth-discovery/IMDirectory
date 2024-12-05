<template>
  <div v-if="isArrayHasLength(select.property)" class="pl-8">
    <div v-for="(item, index) in select.property">
      <div class="flex flex-row items-center gap-2">
        <Button
          v-if="item.return"
          class="button-chevron"
          text
          :icon="!expandReturn ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'"
          @click="toggle"
        />
        <div v-else class="w-10"></div>
        <div v-tooltip="item['@id']">{{ item.name }}</div>
        <div v-if="item.as" class="font-bold">[{{ item.as }}]</div>
      </div>
      <div v-if="item.return && expandReturn">
        <RecursiveReturnDisplay :select="item.return" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Return } from "@/interfaces/AutoGen";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { ref } from "vue";

interface Props {
  select: Return;
}

const props = defineProps<Props>();

const expandReturn = ref(true);

function toggle() {
  expandReturn.value = !expandReturn.value;
}
</script>

<style scoped></style>
