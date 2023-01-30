<template>
  <div id="ecl-definition-container">
    <span class="ecl-text" data-testid="eclString">{{ eclString }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref } from "vue";
import { TTBundle } from "@im-library/interfaces";
import { EclService } from "@/services";

const props = defineProps({
  definition: { type: String, required: true }
});

const eclString = ref("");

onMounted(async () => await init());

async function init() {
  const result = await EclService.getEcl(JSON.parse(props.definition));
  if (!result) eclString.value = "Error";
  else eclString.value = result;
}
</script>

<style scoped>
.ecl-text {
  white-space: break-spaces;
}
</style>
