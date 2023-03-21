<template>
  <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
    <div class="focus-container">
      <Tag v-if="value.exclude" value="NOT" severity="danger" class="builder-button conjunction-button" />
      <div v-if="isAliasIriRef(value.concept)" class="concept-container">
        <ConceptSelector :value="value" :parent="value" />
      </div>
      <div v-else-if="isBoolGroup(value.concept)" class="focus-group-container">
        <component :is="getComponent(value.concept.type)" :value="value.concept" :parent="value" @unGroupItems="unGroupItems" />
      </div>
      <div v-else class="add-focus-buttons-container">
        <Button type="button" :severity="hover && 'success'"  :class="!hover && 'p-button-placeholder'" label="Add Concept" @click="addConcept" class="builder-button" />
        <Button type="button" :severity="hover && 'success'"  :class="!hover && 'p-button-placeholder'" label="Add Group" @click="addGroup" class="builder-button" />
      </div>
    </div>
    <Menu ref="menuBool" :model="boolOptions" :popup="true" />
    <div v-for="(item, index) in value.items" class="refinement-container">
      <span class="left-container">
        <div v-if="index === 0" class="spacer">&nbsp;</div>
        <Button v-else-if="index === 1" type="button" :label="value.conjunction" @click="toggleBool" class="builder-button conjunction-button" />
        <Button v-else-if="index > 1" type="button" :label="value.conjunction" severity="secondary" class="builder-button conjunction-button" disabled />
      </span>
      <component v-if="!loading" :is="getComponent(item.type)" :value="item" :parent="value" :focus="value.concept" @unGroupItems="unGroupItems" />
      <component v-else :is="getSkeletonComponent(item.type)" :value="item" :parent="value" :focus="value.concept" />
      <span class="right-container">
        <div v-if="groupWithinConcept" class="group-checkbox">
          <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="group" />
          <label :for="'group' + index">Group</label>
        </div>
        <Button @click="deleteItem(index)" :severity="hover && 'success'"  :class="!hover && 'p-button-placeholder'" icon="pi pi-trash" class="builder-button" />
      </span>
    </div>
    <div class="add-group">
      <Button
          type="button"
          :severity="hover && 'success'"
          :class="!hover && 'p-button-placeholder'"
          label="Add Refinement"
          @click="addRefinement"
          class="builder-button"
      />
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add New Group" @click="addGroup" class="builder-button" />
      <Button
          type="button"
          :severity="groupWithinConcept && 'danger'"
          :class="hover || !groupWithinConcept ? 'p-button-help' : 'p-button-placeholder'"
          :label="groupWithinConcept ? 'Finish Grouping' : 'Group within'"
          @click="processGroup"
          class="builder-button"
      />
      <Button
          v-if="index && index > 0"
          type="button"
          :severity="hover && 'danger'"
          :class="!hover && 'p-button-placeholder'"
          :label="value.exclude ? 'Include' : 'Exclude'"
          @click="toggleExclude"
          class="builder-button"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, PropType, watch, inject } from "vue";
import BoolGroup from "./BoolGroup.vue";
import BoolGroupSkeleton from "./skeletons/BoolGroupSkeleton.vue";
import Refinement from "@/components/directory/topbar/eclSearch/builder/Refinement.vue";
import ConceptSelector from "./ConceptSelector.vue";
import Button from "primevue/button";
import RefinementSkeleton from "./skeletons/RefinementSkeleton.vue";
import _ from "lodash";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";

const props = defineProps({
  value: {
    type: Object as PropType<{
      type: string;
      descendants: string;
      conjunction: string;
      items: any[];
      concept: { iri: string; name?: string } | { conjunction: string; items: any[]; type: string; ecl?: string } | undefined;
      ecl?: string;
      exclude?: boolean;
    }>,
    required: true
  },
  parent: { type: Object as PropType<any>, required: false },
  index: { type: Number, required: false }
});

watch(
    () => _.cloneDeep(props.value),
    () => {
      props.value.ecl = generateEcl();
    }
);

watch(
    () => _.cloneDeep(props.value.concept),
    async (newValue, oldValue) => {
      if (newValue !== oldValue) await init();
    }
);

const includeTerms = inject("includeTerms") as Ref<boolean>;
watch(includeTerms, () => (props.value.ecl = generateEcl()));

const menuBool = ref();
const loading = ref(false);
const groupWithinConcept = ref(false);
const group: Ref<number[]> = ref([]);

const boolOptions = [
  {
    label: "AND",
    command: () => (props.value.conjunction = "AND")
  },
  {
    label: "OR",
    command: () => (props.value.conjunction = "OR")
  }
];

onMounted(async () => {
  await init();
});

async function init() {
  if (props.value && props.value.concept) {
    props.value.ecl = generateEcl();
  }
}

const hover = ref();
function mouseover(event: Event) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: Event) {
  event.stopPropagation();
  hover.value = false;
}

function toggleBool(event: Event) {
  menuBool.value.toggle(event);
}

function toggleExclude() {
  props.value.exclude = !props.value.exclude;
}

function add(item: any) {
  if (!props.value.items) {
    props.value.items = [item];
  } else {
    props.value.items.push(item);
  }
}

function addRefinement() {
  add({ type: "Refinement", property: { descendants: "<<" }, operator: "=", value: { descendants: "<<" } });
}

function addGroup() {
  add({ type: "BoolGroup", conjunction: "AND" });
}

function addConcept() {
  props.value.concept = { iri: "" };
}

function deleteItem(index: number) {
  console.log("Deleting item " + index);
  props.value.items.splice(index, 1);
}

function getComponent(componentName: string) {
  switch (componentName) {
    case "BoolGroup":
      return BoolGroup;
    case "Refinement":
      return Refinement;
    case "Concept":
      return ConceptSelector;
  }
}

function getSkeletonComponent(componentName: string) {
  switch (componentName) {
    case "BoolGroup":
      return BoolGroupSkeleton;
    case "Refinement":
      return RefinementSkeleton;
  }
}

function generateEcl(): string {
  let ecl = "";
  if (isAliasIriRef(props.value.concept)) ecl += builderConceptToEcl(props.value, includeTerms.value);
  else if (isBoolGroup(props.value.concept)) {
    if (props.value.concept.ecl) ecl += props.value.concept.ecl;
    else ecl += "[ UNKNOWN CONCEPT ]";
  }
  if (isArrayHasLength(props.value.items)) {
    ecl += " : \n";
    for (const [index, item] of props.value.items.entries()) {
      if (item.ecl) ecl += item.ecl;
      else ecl += "[ INVALID REFINEMENT ]";
      if (index + 1 !== props.value.items.length) ecl += " \n" + props.value.conjunction + " ";
    }
  }
  return ecl;
}

function processGroup() {
  if (groupWithinConcept.value && group.value.length) {
    const newGroup: { type: string; conjunction: string; items: any[] } = { type: "BoolGroup", conjunction: "AND", items: [] };
    for (const index of group.value.sort((a, b) => a - b).reverse()) {
      const item = props.value.items.splice(index, 1)[0];
      newGroup.items.push(item);
    }
    props.value.items.splice(group.value.sort()[0], 0, newGroup);
  }
  groupWithinConcept.value = !groupWithinConcept.value;
  group.value = [];
}

function unGroupItems(groupedItems: any) {
  const foundItem = props.value.items.find(item => _.isEqual(item, groupedItems));
  const foundItemIndex = props.value.items.findIndex(item => _.isEqual(item, groupedItems));
  if (foundItem) {
    props.value.items.splice(foundItemIndex, 1);
    for (const groupedItem of groupedItems.items) {
      props.value.items.splice(foundItemIndex, 0, groupedItem);
    }
  }
}
</script>

<style scoped lang="scss">
@use "primevue/resources/themes/saga-blue/theme.css";

.p-button-placeholder {
  @extend .p-button-secondary;
  @extend .p-button-outlined;
  color: #00000030 !important;
  border-style: dashed !important;
}

.focus-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.concept-container {
  flex: 1 0 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.focus-group-container {
  flex: 1 0 auto;
  display: flex;
  flex-flow: column nowrap;
}

.refinement-container {
  display: flex;
}

.left-container {
  display: flex;
  align-items: center;
}

.conjunction-button {
  width: 4rem;
  margin: 0;
}

.nested-div {
  padding: 0.5rem;
  border: #ff8c0030 1px solid;
  border-radius: 5px;
  background-color: #ff8c0010;
  margin: 0.5rem;
  flex: 1;
}

.nested-div-hover {
  @extend .nested-div;
  border: #ff8c00 1px solid;
}

.builder-button {
  height: 1.5rem;
  align-self: center;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.add-group {
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  gap: 4px;
}

.group-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.right-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.tree-button {
  height: 2.357rem !important;
  width: 2.357rem !important;
  padding: 0.5rem !important;
}
</style>
