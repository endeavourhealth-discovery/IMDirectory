<template>
  <div id="entity-panel-header-text" :key="icon">
    <span :style="color" class="p-mx-1">
      <font-awesome-icon v-if="types && types.length" :icon="icon" />
    </span>
    <a v-tooltip.right="'See in viewer app'" class="clickable" @click="navigate">{{ header }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
<<<<<<< HEAD:front-end-vue/src/components/concept/PanelHeader.vue
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType }
} = Helpers;
=======
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeMethods";
import { TTIriRef } from "@/models/TripleTree";
import DirectService from "../../services/DirectService";
import { AppEnum } from "../../models/AppEnum";
import { mapState } from "vuex";
>>>>>>> dev:front-end-vue/src/components/infobar/PanelHeader.vue

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
.clickable {
  cursor: pointer;
}
</style>
