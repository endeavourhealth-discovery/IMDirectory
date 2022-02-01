<template>
  <div id="ecl-definition-container">
    <span class="ecl-text">{{ eclString }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { TTBundle } from "@/models/TripleTree";
import EntityService from "@/services/EntityService";

export default defineComponent({
  name: "EclDefinition",
  props: {
    definition: { type: Object as PropType<TTBundle>, required: true }
  },
  async mounted() {
    await this.init();
  },
  data() {
    return {
      eclString: ""
    };
  },
  methods: {
    async init() {
      const result = await EntityService.getEcl(this.definition);
      if (!result) this.eclString = "Error";
      else this.eclString = result;
    }
  }
});
</script>

<style scoped>
.ecl-text {
  white-space: pre;
}
</style>
