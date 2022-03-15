<template>
  <div id="entity-panel-header-text" :key="icon">
    <span :style="color" class="p-mx-2">
      <font-awesome-icon v-if="types && types.length" :icon="icon" />
    </span>
    <a v-tooltip.right="'See in viewer app'" class="info-bar-title" @click="navigate">{{ header }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { mapState } from "vuex";
import DirectService from "@/services/DirectService";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { Enums, Helpers } from "im-library";
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType }
} = Helpers;
const { AppEnum } = Enums;

export default defineComponent({
  name: "PanelHeader",
  computed: { ...mapState(["conceptIri"]) },
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
      DirectService.directTo(AppEnum.VIEWER, this.conceptIri, this);
    }
  }
});
</script>

<style scoped>
.info-bar-title {
  cursor: pointer;
  padding-left: 3px;
}
</style>
