<template>
  <div :class="[hover ? 'nested-div-hover' : 'nested-div']" @mouseover="mouseover" @mouseout="mouseout">
    <div class="concept-content-container">
      <AutoComplete
        :forceSelection="true"
        style="flex: 1"
        input-style="flex:1"
        field="name"
        dataKey="iri"
        v-model="selected"
        :suggestions="suggestions"
        @complete="search($event.query)"
        placeholder="Search..."
        :optionDisabled="disableOption"
        :disabled="loading"
      />
      <Button :disabled="!value.concept?.iri" icon="fa-solid fa-sitemap" @click="openTree('concept')" class="tree-button" />
      <ProgressSpinner v-if="loading" class="loading-icon" stroke-width="8" />
      <Dropdown style="width: 12rem" v-model="value.descendants" :options="descendantOptions" option-label="label" option-value="value" />
    </div>
    <Menu ref="menuBool" :model="boolOptions" :popup="true" />
    <template v-for="(item, index) in value.items">
      <div style="display: flex">
        <span class="left-container">
          <div v-if="index === 0 && value.items.length > 1">&nbsp;</div>
          <Button v-else-if="index === 1" type="button" :label="value.conjunction" @click="toggleBool" class="builder-button" />
          <Button v-else-if="index > 1" type="button" :label="value.conjunction" class="p-button-secondary builder-button" disabled />
        </span>
        <component v-if="!loading" :is="getComponent(item.type)" :value="item" :parent="value" :focus="value.concept" />
        <component v-else :is="getSkeletonComponent(item.type)" :value="item" :parent="value" :focus="value.concept" />
        <span class="right-container">
          <div v-if="groupWithinConcept" class="group-checkbox">
            <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="group" />
            <label :for="'group' + index">Group</label>
          </div>
          <Button @click="deleteItem(index)" :class="[hover ? 'p-button-danger' : 'p-button-placeholder']" icon="pi pi-trash" class="builder-button" />
        </span>
      </div>
    </template>
    <div class="add-group">
      <Button
        type="button"
        :class="[hover ? 'p-button-success' : 'p-button-placeholder']"
        label="Add Refinement"
        @click="addRefinement"
        class="builder-button"
      />
      <Button type="button" :class="[hover ? 'p-button-success' : 'p-button-placeholder']" label="Add New Group" @click="addGroup" class="builder-button" />
      <Button
        type="button"
        :class="[hover ? 'p-button-help' : 'p-button-placeholder', groupWithinConcept ? 'p-button-danger' : 'p-button-help']"
        :label="groupWithinConcept ? 'Finish Grouping' : 'Group within'"
        @click="processGroup"
        class="builder-button"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, PropType, watch, inject, h } from "vue";
import BoolGroup from "./BoolGroup.vue";
import BoolGroupSkeleton from "./skeletons/BoolGroupSkeleton.vue";
import Refinement from "@/components/directory/topbar/eclSearch/builder/Refinement.vue";
import EclTree from "../EclTree.vue";
import Button from "primevue/button";
import RefinementSkeleton from "./skeletons/RefinementSkeleton.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/models/AutoGen";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { EntityService } from "@/services";
import _ from "lodash";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { useDialog } from "primevue/usedialog";

const props = defineProps({
  value: {
    type: Object as PropType<{
      type: string;
      descendants: string;
      conjunction: string;
      items: any[];
      concept: { iri: string; name?: string } | undefined;
      ecl?: string;
    }>,
    required: true
  },
  parent: { type: Object as PropType<any>, required: false }
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

let treeDialog = useDialog();

const includeTerms = inject("includeTerms") as Ref<boolean>;
watch(includeTerms, () => (props.value.ecl = generateEcl()));

const selected: Ref<ConceptSummary | null> = ref(null);
const controller: Ref<AbortController | undefined> = ref(undefined);
const suggestions: Ref<any[]> = ref([]);
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
  },
  {
    label: "NOT",
    command: () => (props.value.conjunction = "MINUS")
  }
];

const descendantOptions = [
  {
    label: "only",
    value: ""
  },
  {
    label: "plus descendants",
    value: "<<"
  },
  {
    label: "descendants only",
    value: "<"
  }
];

onMounted(async () => {
  await init();
});

watch(selected, (newValue, oldValue) => {
  console.log(newValue);
  console.log(oldValue);
  if (newValue && !_.isEqual(newValue, oldValue) && newValue.iri && newValue.code != "UNKNOWN") {
    console.log("here");
    updateConcept(newValue);
  } else if (undefined) updateConcept(undefined);
  else return;
});

async function init() {
  if (props.value && props.value.concept && props.value.concept.iri) {
    loading.value = true;
    await search(props.value.concept.iri);
    if (isArrayHasLength(suggestions.value)) selected.value = suggestions.value.find(result => result.iri === props.value.concept?.iri);
    loading.value = false;
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

function add(item: any) {
  if (!props.value.items) {
    props.value.items = [item];
  } else {
    props.value.items.push(item);
  }
}

async function search(term: string) {
  if (term.length > 2) {
    if (term.toLowerCase() === "any") {
      suggestions.value = [{ iri: "any", name: "ANY", code: "any" }];
    } else {
      const searchRequest = {} as SearchRequest;
      searchRequest.termFilter = term;
      searchRequest.sortField = "weighting";
      searchRequest.page = 1;
      searchRequest.size = 100;
      searchRequest.schemeFilter = ["http://snomed.info/sct#"];

      if (controller.value) {
        controller.value.abort();
      }
      controller.value = new AbortController();
      suggestions.value = await EntityService.advancedSearch(searchRequest, controller.value);
      controller.value = undefined;
    }
  } else if (term === "*") {
    suggestions.value = [{ iri: "any", name: "ANY", code: "any" }];
  } else suggestions.value = [{ iri: null, name: "3 character minumum", code: "UNKNOWN" }];
}

function disableOption(data: any) {
  return data.code === "UNKNOWN";
}

function addRefinement() {
  add({ type: "Refinement", property: { descendants: "<<" }, operator: "=", value: { descendants: "<<" } });
}

function addGroup() {
  add({ type: "BoolGroup", conjunction: "AND" });
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
  ecl += builderConceptToEcl(props.value, includeTerms.value);
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

function updateConcept(concept: any) {
  props.value.concept = concept;
  props.value.ecl = generateEcl();
}

function openTree(type: string) {
  const dialogProps = {
    style: { width: "80vw", height: "80vh" },
    closable: false,
    maximizable: true,
    modal: true,
    contentStyle: { flex: "1 1 auto", display: "flex" },
    dismissableMask: true,
    autoZIndex: false
  };
  const dialogRef = treeDialog.open(EclTree, {
    props: dialogProps,
    templates: {
      footer: () => {
        return [h(Button, { label: "Close", icon: "pi pi-times", onClick: () => dialogRef.close() })];
      }
    },
    data: { type: "concept", currentValue: props.value.concept },
    onClose(options) {
      if (options?.data?.type === "concept") {
        selected.value = options.data.entity;
      }
    }
  });
}

function processGroup() {
  if (groupWithinConcept.value && group.value.length) {
    const newGroup: { type: string; conjunction: string; items: any[] } = { type: "BoolGroup", conjunction: "AND", items: [] };
    for (const index of group.value.sort((a, b) => a - b).reverse()) {
      const item = props.value.items.splice(index, 1)[0];
      newGroup.items.push(item);
    }
    props.value.items.push(newGroup);
  }
  groupWithinConcept.value = !groupWithinConcept.value;
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

.concept-content-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.left-container {
  display: flex;
  align-items: center;
}

.left-container > * {
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
  margin-right: 4px;
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
