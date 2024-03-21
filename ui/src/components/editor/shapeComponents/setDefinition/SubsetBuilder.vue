<template>
  <Panel class="subsets-panel" header="Subsets" toggleable :collapsed="!hasSubSets">
    <div class="subsets-content">
      <div class="title">
        <span class="title">Inclusions</span>
      </div>
      <ArrayBuilder :mode="mode" :shape="inclusionsShape" :value="inclusions" @updateClicked="updateInclusions" />
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import ArrayBuilder from "../ArrayBuilder.vue";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import { COMPONENT, IM, QUERY } from "@im-library/vocabulary";
import { EditorMode } from "@im-library/enums";
import _ from "lodash";

interface Props {
  subsets?: TTIriRef[];
  mode: EditorMode;
  shape: PropertyShape;
}

const props = defineProps<Props>();

const emit = defineEmits({ updateClicked: _payload => true });

const hasSubSets: ComputedRef<boolean> = computed(() => isArrayHasLength(inclusions.value));

const inclusions: Ref<TTIriRef[]> = ref([]);
const inclusionsShape: Ref<PropertyShape> = ref({
  name: "Inclusions",
  minCount: 0,
  builderChild: true,
  componentType: { "@id": COMPONENT.ARRAY_BUILDER },
  arrayButtons: { addOnlyIfLast: true, down: false, minus: true, plus: true, up: false },
  path: { "@id": IM.IS_SUBSET_OF },
  property: [
    {
      argument: [{ parameter: "this", valueIriList: [{ "@id": IM.CONCEPT_SET }, { "@id": IM.VALUESET }] }],
      select: [{ "@id": QUERY.SEARCH_ENTITIES }],
      builderChild: true,
      componentType: { "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER },
      minCount: 0,
      name: "Inclusion",
      order: 1,
      path: { "@id": IM.IS_SUBSET_OF }
    }
  ],
  order: 1
});

watch(
  () => _.cloneDeep(inclusions.value),
  (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
      emit("updateClicked", inclusions.value);
    }
  }
);

onMounted(() => {
  processProps();
});

function processProps() {
  if (props.subsets) {
    inclusions.value = _.cloneDeep(props.subsets);
  }
}

function updateInclusions(data: any) {
  inclusions.value = data[IM.IS_SUBSET_OF];
}
</script>

<style scoped>
.subsets-panel {
  flex: 0 1 auto;
  max-height: 50%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.subsets-panel:deep(.p-toggleable-content) {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.subsets-panel:deep(.p-panel-content) {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.subsets-content {
  flex: 1 1 auto;
  overflow: auto;
}

.subsets-content:deep(#autocomplete-search) {
  border: 1px solid var(--surface-border);
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  padding-top: 0.5rem;
}
</style>
