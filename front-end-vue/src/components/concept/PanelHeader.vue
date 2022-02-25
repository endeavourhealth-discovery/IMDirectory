<template>
  <div id="entity-panel-header-text" :key="icon">
    <span :style="color" class="p-mx-1">
      <font-awesome-icon v-if="types && types.length" :icon="icon" />
    </span>
    {{ header }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType }
} = Helpers;

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
