<template>
  <Panel class="subsets-panel" header="Subsets" toggleable :collapsed="!hasSubSets">
    <div class="subsets-content">
      <div class="title">
        <span class="title">Inclusions</span>
      </div>
      <ArrayBuilder :mode="mode" :shape="inclusionsShape" :value="inclusions" @updateClicked="updateInclusions" />
      <div class="title">
        <span>Exclusions</span>
      </div>
      <ArrayBuilder :mode="mode" :shape="exclusionsShape" :value="exclusions" @updateClicked="updateExclusions" />
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match, Node, PropertyShape, QueryRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import ArrayBuilder from "../ArrayBuilder.vue";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import { COMPONENT, IM, QUERY } from "@im-library/vocabulary";
import { EditorMode } from "@im-library/enums";
import _ from "lodash";

interface Props {
  subsets?: Match[];
  mode: EditorMode;
  shape: PropertyShape;
}

const props = defineProps<Props>();

const emit = defineEmits({ updateClicked: _payload => true });

const hasSubSets: ComputedRef<boolean> = computed(() => isArrayHasLength(inclusions.value) || isArrayHasLength(exclusions.value));

const inclusions: Ref<TTIriRef[]> = ref([]);
const exclusions: Ref<TTIriRef[]> = ref([]);
const inclusionsShape: Ref<PropertyShape> = ref({
  name: "Inclusions",
  minCount: 0,
  builderChild: true,
  componentType: { "@id": COMPONENT.ARRAY_BUILDER },
  arrayButtons: { addOnlyIfLast: true, down: false, minus: true, plus: true, up: false },
  path: { "@id": IM.DEFINITION },
  property: [
    {
      argument: [{ parameter: "this", valueIriList: [{ "@id": IM.CONCEPT_SET }, { "@id": IM.VALUESET }] }],
      select: [{ "@id": QUERY.SEARCH_ENTITIES }],
      builderChild: true,
      componentType: { "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER },
      minCount: 0,
      name: "Inclusion",
      order: 1,
      path: { "@id": IM.DEFINITION }
    }
  ],
  order: 1
});
const exclusionsShape: Ref<PropertyShape> = ref({
  name: "Exclusions",
  minCount: 0,
  builderChild: true,
  componentType: { "@id": COMPONENT.ARRAY_BUILDER },
  arrayButtons: { addOnlyIfLast: true, down: false, minus: true, plus: true, up: false },
  path: { "@id": IM.DEFINITION },
  property: [
    {
      argument: [{ parameter: "this", valueIriList: [{ "@id": IM.CONCEPT_SET }, { "@id": IM.VALUESET }] }],
      select: [{ "@id": QUERY.SEARCH_ENTITIES }],
      builderChild: true,
      componentType: { "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER },
      minCount: 0,
      name: "Inclusion",
      order: 1,
      path: { "@id": IM.DEFINITION }
    }
  ],
  order: 1
});

watch(
  () => _.cloneDeep(inclusions.value),
  (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
      emit("updateClicked", buildSubsets());
    }
  }
);

watch(
  () => _.cloneDeep(exclusions.value),
  (newValue, oldValue) => {
    if (!_.isEqual(newValue, oldValue)) {
      emit("updateClicked", buildSubsets());
    }
  }
);

onMounted(() => {
  processProps();
});

function processProps() {
  if (props.subsets) {
    for (const m of props.subsets) {
      if (m.exclude && m.is)
        exclusions.value = m.is.map(i => {
          return { "@id": i["@id"] } as TTIriRef;
        });
      else if (m.is)
        inclusions.value = m.is.map(i => {
          return { "@id": i["@id"] } as TTIriRef;
        });
    }
  }
}

function updateInclusions(data: any) {
  inclusions.value = data[props.shape.path["@id"]];
}

function updateExclusions(data: any) {
  exclusions.value = data[props.shape.path["@id"]];
}

function buildSubsets() {
  const subsets = [];
  if (isArrayHasLength(inclusions.value)) {
    const inclusionsBuild: Match = {
      is: inclusions.value.map(i => {
        return { "@id": i["@id"] } as Node;
      })
    };
    subsets.push(inclusionsBuild);
  }
  if (isArrayHasLength(exclusions.value)) {
    const exclusionsBuild: Match = {
      is: exclusions.value.map(i => {
        return { "@id": i["@id"] } as Node;
      }),
      exclude: true
    };
    subsets.push(exclusionsBuild);
  }
  return subsets;
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
