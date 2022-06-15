<template>
  <div id="entity-panel-header-text" :key="icon">
    <span :style="color" class="p-mx-2">
      <i v-if="types && types.length" :class="icon" aria-hidden="true" />
    </span>
    <a v-tooltip.right="'See in viewer app'" class="info-bar-title" @click="navigate">{{ header }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { mapState } from "vuex";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType }
} = Helpers;

export default defineComponent({
  name: "PanelHeader",
  computed: { ...mapState(["selectedConceptIri"]) },
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
  },
  methods: {
    navigate() {
      this.$directService.directTo(this.$env.VIEWER_URL, this.selectedConceptIri, "concept");
    }
  }
});
</script>

<style scoped>
#entity-panel-header-text {
  display: flex;
  flex-flow: row;
  align-items: center;
}

.info-bar-title {
  cursor: pointer;
  padding-left: 3px;
}
</style>
