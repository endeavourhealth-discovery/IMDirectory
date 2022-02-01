<template>
  <div id="entity-panel-header-text" :key="icon">
    <span :style="color" class="p-mx-1">
      <font-awesome-icon v-if="types.length" :icon="icon" />
    </span>
    {{ header }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeMethods";
import { TTIriRef } from "@/models/TripleTree";

export default defineComponent({
  name: "PanelHeader",
  props: {
    types: { type: Array as PropType<Array<TTIriRef>>, required: true },
    header: { type: String, required: true }
  },
  data() {
    return {
      icon: [] as any,
      color: ""
    };
  },
  watch: {
    types(newValue): void {
      if (newValue.length > 0) {
        this.color = "color: " + getColourFromType(newValue);
        this.icon = getFAIconFromType(newValue);
      }
    }
  }
});
</script>
