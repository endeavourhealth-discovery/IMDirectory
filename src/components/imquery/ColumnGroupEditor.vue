<template>
  <Dialog v-model:visible="show" modal closable :draggable="false" class="edit-match-dialog" maximizable @hide="onCancel">
    <div class="flex w-full flex-auto flex-col flex-nowrap gap-1 overflow-auto">
      <span>Name of group</span>
      <InputText v-model="match.name" class="name-display" placeholder="Name" type="text" />
    </div>
    <div class="column-group-editor">
      <Splitter class="h-full w-full" layout="horizontal">
        <SplitterPanel class="column-selector">
          <ColumnSelector :baseType="baseType" v-model:refreshColumns="refreshColumns" v-model:match="match" />
        </SplitterPanel>
        <SplitterPanel class="column-display">
          <div v-if="match.return">
            <span class="header">Add columns from left</span>
            <RecursiveReturnDisplay :select="match.return" :parentQuery="match" />
          </div>
          <div v-else>
            <span class="header">Select columns from the tree to add</span>
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
    <template #footer>
      <div class="button-footer">
        <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
        <Button v-if="edited" autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.edit-match-dialog .p-dialog-content) {
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  flex: 1 1 auto !important;
  max-height: 90vh !important;
  min-height: 70vh !important;
}

.column-selector {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.column-group-editor {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  max-height: 85vh;
}
</style>

<script lang="ts" setup>
import { DisplayMode, Match, Node } from "@/interfaces/AutoGen";
import { Ref, ref, computed } from "vue";
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
import Button from "primevue/button";
import RecursiveReturnDisplay from "@/components/query/viewer/RecursiveReturnDisplay.vue";
interface Props {
  baseType: Node;
  clauseIndex: number;
}

const show = defineModel<boolean>("show", { default: false });
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "cancel"): void;
}>();

const { getRootNodes, getDefiningProperty, createPropertyTree, getOrderables } = usePropertyTree();
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const showFilterSelector = ref(false);
const showColumnSelector = ref(false);
const propertyTree: Ref<TreeNode[]> = ref([]);
const rootNodes: Ref<TreeNode[]> = ref([]);
const orderables: Ref<any[] | undefined> = ref();
const orderable: Ref<any> = ref({ label: "Any/latest/earliest", value: "addTest" });
const edited = ref(false);
const hoverEditColumns = ref(false);
const hoverDeleteColumns = ref(false);
const hoverAddFilter = ref(false);
const hoverAddColumns = ref(false);
const refreshColumns = ref(false);

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
function addColumns() {
  showColumnSelector.value = true;
}

async function onSave() {
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
  emit("saveChanges", match.value);
  show.value = false;
}

function editColumns() {
  refreshColumns.value = true;
}
function cancelColumns() {
  delete match.value.return;
}

function onCancel() {
  show.value = false;
}
</script>
