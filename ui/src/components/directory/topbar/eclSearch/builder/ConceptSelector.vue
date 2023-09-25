<template>
  <div v-if="isAliasIriRef(value.concept)" class="concept-container">
    <AutoComplete
      :forceSelection="true"
      style="flex: 1"
      :input-style="{ flex: 1 }"
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
    <Dropdown style="width: 12rem" v-model="value.descendants" placeholder="only" :options="descendantOptions" option-label="label" option-value="value" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted, PropType, watch, inject, h } from "vue";
import { IM, SNOMED } from "@im-library/vocabulary";
import EclTree from "../EclTree.vue";
import Button from "primevue/button";
import { ConceptSummary } from "@im-library/interfaces";
import { SearchRequest } from "@im-library/interfaces/AutoGen";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";
import { EntityService } from "@/services";
import _ from "lodash";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { builderConceptToEcl } from "@im-library/helpers/EclBuilderConceptToEcl";
import { useDialog } from "primevue/usedialog";
import { isAliasIriRef } from "@im-library/helpers/TypeGuards";

interface Props {
  value:
    | {
        type: string;
        descendants: string;
        conjunction: string;
        items: any[];
        concept: { iri: string; name?: string } | undefined;
        ecl?: string;
      }
    | any;
  parent?: any;
}
const props = defineProps<Props>();

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

const selected: Ref<ConceptSummary | null | string> = ref(null);
const controller: Ref<AbortController | undefined> = ref(undefined);
const suggestions: Ref<any[]> = ref([]);
const loading = ref(false);

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
  if (typeof newValue === "string" || newValue === null) return;
  else if (newValue && !_.isEqual(newValue, oldValue) && newValue.iri && newValue.code != "UNKNOWN") {
    updateConcept(newValue);
  }
});

async function init() {
  if (props.value && props.value.concept) {
    if (isAliasIriRef(props.value.concept)) {
      loading.value = true;
      await search(props.value.concept.iri);
      if (isArrayHasLength(suggestions.value))
        selected.value = suggestions.value.find(result => result.iri === (props.value.concept as { iri: string; name?: string }).iri);
      loading.value = false;
    }
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
      searchRequest.schemeFilter = [SNOMED.NAMESPACE, IM.NAMESPACE];
      searchRequest.statusFilter = [IM.ACTIVE];

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
</script>

<style scoped lang="scss">
.concept-container {
  flex: 1 0 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.tree-button {
  height: 2.357rem !important;
  width: 2.357rem !important;
  padding: 0.5rem !important;
}
</style>
