<template>
  <div id="entity-panel-header-text">
    <span :style="'color: ' + colour" class="p-mx-2">
      <i v-if="types && types.length" :class="icon" aria-hidden="true" />
    </span>
    <a v-tooltip.right="'See in viewer app'" class="info-bar-title" @click="navigate">{{ header }}</a>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, Ref, watch } from "vue";
import _ from "lodash";
import { TTIriRef } from "im-library/interfaces";
import { getColourFromType, getFAIconFromType } from "im-library/helpers/ConceptTypeMethods";

const props = defineProps({
  types: { type: Array as PropType<Array<TTIriRef>>, required: true },
  header: { type: String, required: true }
});

let icon: Ref<any[]> = ref([]);
let colour = ref("");

watch(
  () => _.cloneDeep(props.types),
  newValue => {
    if (newValue.length > 0) {
      colour.value = getColourFromType(newValue);
      icon.value = getFAIconFromType(newValue);
    }
  }
);

function navigate() {
  console.log("a");
  // DirectService.directTo(Env.VIEWER_URL, this.selectedConceptIri, this, "concept");
}
</script>

<style scoped>
.info-bar-title {
  cursor: pointer;
  padding-left: 3px;
}
</style>
