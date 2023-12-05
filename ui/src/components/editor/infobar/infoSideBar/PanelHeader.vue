<template>
  <div id="entity-panel-header-text">
    <span>
      <IMFontAwesomeIcon v-if="types && types.length" :icon="icon" :style="'color: ' + colour" class="p-mx-2" />
    </span>
    <a v-tooltip.right="'See in viewer app'" class="info-bar-title">{{ header }}</a>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from "vue";
import _ from "lodash";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

interface Props {
  types: TTIriRef[];
  header: string;
}

const props = defineProps<Props>();

const icon: Ref<any[]> = ref([]);
const colour = ref("");

watch(
  () => _.cloneDeep(props.types),
  newValue => {
    if (newValue.length > 0) {
      colour.value = getColourFromType(newValue);
      icon.value = getFAIconFromType(newValue);
    }
  }
);
</script>

<style scoped>
.info-bar-title {
  cursor: pointer;
  padding-left: 3px;
}
</style>
