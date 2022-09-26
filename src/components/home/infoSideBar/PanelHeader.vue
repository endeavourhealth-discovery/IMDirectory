<template>
  <div id="entity-panel-header-text">
    <span :style="color" class="p-mx-2">
      <i v-if="types && types.length" :class="icon" aria-hidden="true" />
    </span>
    <a v-tooltip.right="'See in viewer app'" class="info-bar-title" @click="navigate">{{ header }}</a>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, PropType, Ref, ref, watch } from "vue";
import { mapState, useStore } from "vuex";
import _ from "lodash";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers, Services } from "im-library";
import axios from "axios";
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType }
} = Helpers;
const { DirectService, Env } = Services;

const props = defineProps({
  types: { type: Array as PropType<TTIriRef[]>, required: true },
  header: { type: String, default: "" }
});

const directService = new DirectService(axios);

watch(
  () => _.cloneDeep(props.types),
  newValue => {
    if (newValue.length > 0) {
      color.value = "color: " + getColourFromType(newValue);
      icon.value = getFAIconFromType(newValue);
    }
  }
);

const store = useStore();
const selectedConceptIri = computed(() => store.state.selectedConceptIri);

const icon: Ref<string[]> = ref([]);
const color = ref("");

function navigate() {
  directService.directTo(Env.VIEWER_URL, selectedConceptIri.value, "concept");
}
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
