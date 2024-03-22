<template>
  <div v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else id="ecl-definition-container">
    <span
      class="ecl-text"
      data-testid="eclString"
      v-tooltip.left="'Copy to clipboard'"
      v-clipboard:copy="copyToClipboard()"
      v-clipboard:success="onCopy"
      v-clipboard:error="onCopyError"
      >{{ eclString }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { EclService } from "@/services";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";

interface Props {
  definition: string;
}

const props = defineProps<Props>();

const eclString = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(eclString);

const loading = ref(true);
onMounted(async () => await init());

async function init() {
  loading.value = true;
  const result = await EclService.getEcl(JSON.parse(props.definition));
  if (!result) eclString.value = "Error";
  else eclString.value = result;
  loading.value = false;
}
</script>

<style scoped>
.ecl-text {
  white-space: break-spaces;
  cursor: pointer;
}

.loading-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 20rem;
}
</style>
