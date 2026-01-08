<template>
  <div>
    <Dialog
      v-model:visible="showEditor"
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
          <span>Name of group</span>
          <InputText v-model="match.name" class="name-display" placeholder="Name" type="text" />
        </div>
      </template>
      <div v-if="match.where && !showFilterSelector">
        <span>Filter</span>
        <BooleanWhereEditor
          :match="match"
          :base-type="baseType"
          v-model:property="match.where"
          :clauseIndex="0"
          @addProperty="showFilterSelector = true"
          @updateProperty="onUpdate"
        />
      </div>
      <div v-else>
        <Button
          data-testid="add-column-button"
          label="Add filter"
          @click="showFilterSelector = true"
          :severity="hoverAddFilter ? 'success' : 'secondary'"
          :outlined="!hoverAddFilter"
          :class="!hoverAddFilter && 'hover-button'"
          @mouseover="hoverAddFilter = true"
          @mouseout="hoverAddFilter = false"
        />
      </div>
      <div v-if="showFilterSelector && match.return">
        <MatchTypeSelector
          :base-type="baseType"
          v-model:match="match"
          :rootNodes="rootNodes"
          @node-selected="onMatchTypeSelected($event)"
          @cancel="showFilterSelector = false"
        />
      </div>
      <div v-else-if="showFilterSelector && !match.return">
        <span>Select columns before filter</span>
      </div>
      <div v-if="orderables && orderables.length > 0">
        <Select
          class="test-selector"
          :modelValue="orderable"
          :options="orderables"
          :placeholder="`Add Orderables`"
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
      </div>

      <div v-if="match.return && !showColumnSelector" class="column-display" data-testid="return-columns">
        <ReturnColumns :select="match.return" class="pl-8" :parentQuery="match" />
        <Button
          class="edit-ColumnButton"
          data-testid="edit-column-button"
          label="Edit columns"
          @click="showColumnSelector = true"
          :severity="hoverEditColumn ? 'success' : 'secondary'"
          :outlined="!hoverEditColumn"
          :class="!hoverEditColumn && 'hover-button'"
          @mouseover="hoverEditColumn = true"
          @mouseout="hoverEditColumn = false"
        />
      </div>
      <div v-else-if="!match.return && !showColumnSelector">
        <Button
          class="add-ColumnButton"
          data-testid="add-column-button"
          label="Select columns"
          @click="showColumnSelector = true"
          :severity="hoverAddColumn ? 'success' : 'secondary'"
          :outlined="!hoverAddColumn"
          :class="!hoverAddColumn && 'hover-button'"
          @mouseover="hoverAddColumn = true"
          @mouseout="hoverAddColumn = false"
        />
      </div>
      <div>
        <ColumnSelector :baseType="baseType" v-model:match="match" @cancel-column-group="showColumnSelector = false" />
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
import { DisplayMode, Match, Node } from "@/interfaces/AutoGen";
import { Ref, ref } from "vue";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import { QueryService } from "@/services";
import { IM } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { addWhereToMatch, setReturn, hasBoolGroups, addMatchToParent } from "@/helpers/buildQuery";
import MatchTypeSelector from "@/components/imquery/MatchTypeSelector.vue";
import BooleanWhereEditor from "@/components/imquery/BooleanWhereEditor.vue";
import { usePropertyTree } from "@/composables/usePropertyTree";
import { getOrderOptions, getOrderable } from "@/helpers/QueryEditorMethods";
import ColumnSelector from "@/components/imquery/ColumnSelector.vue";
import ReturnColumns from "@/components/query/viewer/ReturnColumns.vue";
import Button from "primevue/button";
interface Props {
  baseType: Node;
  clauseIndex: number;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const showEditor = defineModel<boolean>("showEditor", { default: false });
const showColumnSelector = ref(false);
const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "cancel"): void;
}>();

const { getRootNodes, getDefiningProperty, createPropertyTree, getOrderables} = usePropertyTree();
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const showFilterSelector = ref(false);
const propertyTree: Ref<TreeNode[]> = ref([]);
const rootNodes: Ref<TreeNode[]> = ref([]);
const orderables: Ref<any[] | undefined> = ref();
const orderable: Ref<any> = ref({ label: "Any/latest/earliest", value: "addTest" });
const edited = ref(false);
const hoverEditColumn = ref(false);
const hoverAddFilter = ref(false);
const hoverAddColumn = ref(false);
function onUpdate() {
  edited.value = true;
}
function updateOrderable(value: any) {
  orderable.value = value;
  match.value.orderBy = { property: [{ iri: value.iri, direction: value.direction }] };
}

async function onMatchTypeSelected(node: TreeNode) {
  showFilterSelector.value = false;
  if (node.data.typeOf) {
    if (node.children && node.children.length === 0) {
      await createPropertyTree(node.data.typeOf, node);
    }
    const definingProperty = getDefiningProperty(node);
    if (definingProperty) {
      addWhereToMatch(match.value, node, definingProperty);
      match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
      if (!orderables.value) orderables.value = getOrderOptions(getOrderables(rootNodes.value[0]));
      edited.value = true;
    }
  } else {
    addWhereToMatch(match.value, node, node.data.iri);
    match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
    rootNodes.value = await getRootNodes(match.value, propertyTree.value[1].children!);
    if (!orderables.value) orderables.value = getOrderOptions(getOrderables(rootNodes.value[0]));
    edited.value = true;
  }
}

async function onSave() {
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
  emit("saveChanges", match.value);
  showEditor.value = false;
}

function onCancel() {
  emit("cancel");
  showEditor.value = false;
}
</script>

<style scoped>
.name-display {
  width: 100%;
}
.column-display {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
}
.edit-ColumnButton {
  align-self: flex-start; /* keeps button pinned to top of the row */
  height: auto;
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
