<template>
  <div>
    <Dialog
      v-model:visible="showMatchEditor"
      modal
      closable
      :draggable="false"
      :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
      class="edit-match-dialog"
      maximizable
      @hide="onCancel"
    >
      <template #header>
        <div class="flex w-full flex-auto flex-col flex-nowrap gap-1 overflow-auto">
          <strong v-if="from">This is a test on the previous clause : ({{ from?.return?.as }})</strong>
          <span>Name</span>
          <InputText v-model="editMatch.name" class="name-display" placeholder="Name" type="text" />
          <span>Result label</span>
          <div>
            <InputText v-model="keepAs" placeholder="label to keep as reference" type="text" />
          </div>
        </div>
      </template>
      <div v-if="loading" class="flex w-full flex-auto flex-col flex-nowrap">
        <ProgressSpinner />
      </div>
      <div v-else class="description-container">
        <span>Description</span>
        <Textarea v-model="editMatch.description" autoResize placeholder="Description" rows="2" type="text" />
      </div>
      <div>With the following conditions</div>
      <div v-if="editMatch.isCohort || editMatch.where" class="where-container">
        <CohortEditor v-if="editMatch.isCohort && !showPropertySelector" v-model:match="editMatch" v-model:editMode="editCohort" @updateProperty="onUpdate" />
        <div v-else-if="editMatch.where && !showPropertySelector">
          <BooleanWhereEditor
            :match="editMatch"
            :base-type="baseType"
            v-model:property="editMatch.where"
            :clauseIndex="0"
            @addProperty="showPropertySelector = true"
            @updateProperty="onUpdate"
          />
        </div>
      </div>
      <div v-if="showPropertySelector">
        <MatchTypeSelector
          :base-type="baseType"
          v-model:match="editMatch"
          :rootNodes="rootNodes"
          :from="from"
          @node-selected="onMatchTypeSelected($event)"
          @cancel="showPropertySelector = false"
        />
      </div>
      <div v-if="orderables && orderables.length > 0 && isDefined()">
        <Select
          class="test-selector"
          :modelValue="orderable"
          :options="orderables"
          :placeholder="`Add Test`"
          scroll-height="50rem"
          option-label="label"
          option-value="value"
          data-testid="order-selector"
          @update:modelValue="updateOrderable"
        >
          <template #value="slotProps">
            <div class="test-selector">
              <div>{{ orderable.label }}</div>
            </div>
          </template>
          <template #dropdownicon="slotProps">
            <div class="test-dropdown">
              <i class="pi pi-chevron-down text-white-600 text-xl"></i>
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
              <div>{{ slotProps.option.label }}</div>
            </div>
          </template>
        </Select>
        <Button v-if="!editMatch.then" data-testid="add-test-button" label="Add test" @click="addThen" />
      </div>
      <div v-if="editMatch.then">
        <div>Then test</div>
        <div v-if="!hasBoolGroups(editMatch.then)" class="match-display">
          <MatchContentDisplay :match="editMatch.then" :parentMatch="editMatch" :from="editMatch" :depth="0" :clauseIndex="0" :expandSet="false" />
        </div>
        <div v-else>Multiple tests - see main editor</div>
      </div>
      <template #footer>
        <div class="button-footer">
          <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
          <Button v-if="edited" autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Bool, DisplayMode, Match, Node, TTIriRef, NodeShape, PropertyShape, Return } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref, watch } from "vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import { DataModelService, EntityService, QueryService } from "@/services";
import { IM } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { addWhereToMatch, setReturn, hasBoolGroups, addMatchToParent } from "@/composables/buildQuery";
import MatchTypeSelector from "@/components/imquery/MatchTypeSelector.vue";
import CohortEditor from "@/components/imquery/CohortEditor.vue";
import BooleanWhereEditor from "@/components/imquery/BooleanWhereEditor.vue";
import setupPropertyTree from "@/composables/setupPropertyTree";
import { cloneDeep, isEqual } from "lodash-es";
import { getOrderOptions, getOrderable } from "@/helpers/QueryEditorMethods";
import BooleanMatchEditor from "@/components/imquery/BooleanMatchEditor.vue";
import MatchContentDisplay from "@/components/imquery/MatchContentDisplay.vue";
interface Props {
  baseType: Node;
  from?: Match;
  depth: number;
  clauseIndex: number;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const showMatchEditor = defineModel<boolean>("showMatchEditor", { default: false });
const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "cancel"): void;
}>();
const editMatch: Ref<Match> = ref({});
const { createFeatureTree, getRootNodes, getDefiningProperty, createPropertyTree, getOrderables } = setupPropertyTree();
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = setupCopyToClipboard(editMatchString);
const templates: Ref<any> = ref();
const showPropertySelector = ref(false);
const loading = ref(true);
const keepAs: Ref<string> = ref("");
const editCohort = ref(false);
const propertyTree: Ref<TreeNode[]> = ref([]);
const rootNodes: Ref<TreeNode[]> = ref([]);
const orderables: Ref<any[] | undefined> = ref();
const orderable: Ref<any> = ref({ label: "Any/latest/earliest", value: "addTest" });
const edited = ref(false);
watch(
  () => keepAs,
  () => setReturn(editMatch.value, keepAs.value)
);
watch(props.baseType, async (newValue, oldValue) => {
  if (!isEqual(newValue, oldValue)) {
    propertyTree.value = await createFeatureTree(props.baseType);
    rootNodes.value = propertyTree.value;
  }
});

onMounted(async () => {
  await init();
});
function onUpdate() {
  edited.value = true;
}

async function init() {
  loading.value = true;
  editMatch.value = cloneDeep(match.value);
  propertyTree.value = await createFeatureTree(props.baseType);
  if (props.from) {
    rootNodes.value = await getRootNodes(props.from, propertyTree.value[1].children!);
  } else if (editMatch.value.path) {
    rootNodes.value = await getRootNodes(editMatch.value, propertyTree.value[1].children!);
    orderables.value = getOrderOptions(getOrderables(rootNodes.value[0]));
  } else {
    rootNodes.value = propertyTree.value;
    orderables.value = getOrderOptions(getOrderables(rootNodes.value[1]));
  }
  templates.value = await getFunctionTemplates();
  loading.value = false;
  if (!isDefined()) showPropertySelector.value = true;
  else {
    orderables.value = getOrderOptions(getOrderables(rootNodes.value[rootNodes.value.length - 1]));
    if (editMatch.value.return && editMatch.value.return.orderBy) {
      orderable.value = getOrderable(editMatch.value, orderables.value);
    }
  }
}

function isDefined(): boolean {
  return !!(editMatch.value.isCohort || editMatch.value.where);
}

function updateOrderable(value: any) {
  orderable.value = value;
  if (!editMatch.value.return) editMatch.value.return = {} as Return;
  editMatch.value.return.orderBy = { property: [{ iri: value.iri, direction: value.direction }] };
}

function addThen() {
  if (!editMatch.value.return) {
    const as = keepAs ? keepAs : "Match_" + props.depth + "_" + props.clauseIndex;
    editMatch.value.return = {
      as: as
    } as Return;
  }
  if (!editMatch.value.then) editMatch.value.then = { nodeRef: editMatch.value.return!.as! } as Match;
  showMatchEditor.value = false;
}

async function onMatchTypeSelected(node: TreeNode) {
  showPropertySelector.value = false;
  if (node.data.iri === "cohort") {
    editCohort.value = true;
  } else {
    if (node.data.typeOf) {
      if (node.children && node.children.length === 0) {
        await createPropertyTree(node.data.typeOf, node);
      }
      const definingProperty = getDefiningProperty(node);
      if (definingProperty) {
        addWhereToMatch(editMatch.value, node, definingProperty);
        editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
        rootNodes.value = await getRootNodes(editMatch.value, propertyTree.value[1].children!);
        if (!orderables.value) orderables.value = getOrderOptions(getOrderables(rootNodes.value[0]));
        edited.value = true;
      }
    } else {
      addWhereToMatch(editMatch.value, node, node.data.iri);
      editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
      rootNodes.value = await getRootNodes(editMatch.value, propertyTree.value[1].children!);
      if (!orderables.value) orderables.value = getOrderOptions(getOrderables(rootNodes.value[0]));
      edited.value = true;
    }
  }
}

async function getFunctionTemplates() {
  const iri = editMatch.value?.typeOf?.iri;
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [IM.FUNCTION_TEMPLATE]);
    if (isArrayHasLength(entity[IM.FUNCTION_TEMPLATE])) {
      const iris = entity[IM.FUNCTION_TEMPLATE].map((functionTemplate: TTIriRef) => functionTemplate.iri);
      return await EntityService.getPartialEntities(iris, []);
    }
  }
}

async function onSave() {
  editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
  emit("saveChanges", editMatch.value);
  showMatchEditor.value = false;
}

function onCancel() {
  emit("cancel");
  showMatchEditor.value = false;
}

function onAddFunctionProperty(args: { property: string; value: any }) {
  if (args.property === "orderBy") {
    if (!editMatch.value.return) editMatch.value.return = {} as Return;
    editMatch.value!.return.orderBy = args.value;
  }
}
</script>

<style scoped>
.name-display {
  width: 100%;
}
.description-container {
  display: flex;
  flex-flow: column;
}
.where-container {
  display: flex;
  flex-flow: column;
  gap: 1rem;
}

.edit-match-dialog {
  background-color: var(--p-surface-section);
}
.test-selector {
  background-color: rgb(16, 185, 129);
  color: white;
}
.test-dropdown {
  color: white;
}
</style>
