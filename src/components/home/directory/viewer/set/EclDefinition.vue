<template>
  <div id="ecl-definition-container">
    <span class="ecl-text" data-testid="eclString">{{ eclString }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref } from "vue";
import { TTBundle } from "im-library/dist/types/interfaces/Interfaces";
import { Services } from "im-library";
import axios from "axios";
const { EntityService } = Services;

const props = defineProps({
  definition: { type: Object as PropType<TTBundle>, required: true }
});

const entityService = new EntityService(axios);

const eclString = ref("");

onMounted(async () => await init());

async function init() {
  const result = await entityService.getEcl(props.definition);
  if (!result) eclString.value = "Error";
  else eclString.value = result;
}
</script>

<style scoped>
.ecl-text {
  white-space: break-spaces;
}
</style>
