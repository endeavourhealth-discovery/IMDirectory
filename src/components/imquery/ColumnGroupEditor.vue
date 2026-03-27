<template>
  <Dialog :visible="show" modal closable :draggable="false" class="dialog-content" maximizable @hide="onCancel">
    <div class="dialog-content flex h-full flex-col gap-2">
      <!-- Top input section -->
      <div class="top-section flex-none">
        <span>Name of group</span>
        <InputText v-model="match.name" class="name-display" placeholder="Name" type="text" />
      </div>

      <div class="column-group-editor">
        <Splitter class="h-full w-full" layout="horizontal">
          <SplitterPanel class="column-selector">
            <TypeSelector :baseType="baseType" v-model:refreshColumns="refreshColumns" v-model:match="match" v-model:columns="columns" />
          </SplitterPanel>
          <SplitterPanel class="column-selector">
            <FieldSelector :columns="columns" />
          </SplitterPanel>
          <SplitterPanel class="column-selector">
            <div v-if="match.return">
              <span class="header">Check or uncheck columns on left</span>
              <RecursiveReturnDisplay :select="match.return" :parentQuery="match" />
            </div>
            <div v-else>
              <span class="header">Select columns from the tree to add</span>
            </div>
          </SplitterPanel>
        </Splitter>
      </div>

      <div class="button-footer">
        <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
        <Button v-if="edited" autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.top-section {
  flex: 0 0 auto; /* natural height */
}
.dialog-content {
  width: 90vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.column-group-editor {
  display: flex;
  overflow: hidden;
  min-height: 70vh;
  max-height: 70vh;
}

.column-selector {
  flex: 1 1 auto;
  overflow: hidden;
  max-height: 70vh;
}

.button-footer {
  flex: 0 0 auto; /* footer at bottom */
  display: flex;

  justify-content: flex-end;
  gap: 0.5rem;
}
</style>

<script lang="ts" setup>
import { Match, Node, Return } from "vue-library/interfaces";
import { DisplayMode } from "vue-library/enums";
import { Ref, ref, computed, onMounted } from "vue";
import { useCopyToClipboard } from "vue-library/composables";
import { QueryService } from "@/services";
import { IM } from "vue-library/enums";
import type { TreeNode } from "primevue/treenode";
import TypeSelector from "@/components/imquery/TypeSelector.vue";
import Button from "primevue/button";
import RecursiveReturnDisplay from "@/components/query/viewer/RecursiveReturnDisplay.vue";
import FieldSelector from "@/components/imquery/FieldSelector.vue";
interface Props {
  baseType: Node;
  clauseIndex: number;
  show: boolean;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "cancel"): void;
}>();

const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const showFilterSelector = ref(false);
const showColumnSelector = ref(false);
const propertyTree: Ref<TreeNode[]> = ref([]);
const rootNodes: Ref<TreeNode[]> = ref([]);
const columns: Ref<TreeNode[]> = ref([]);
const orderables: Ref<any[] | undefined> = ref();
const orderable: Ref<any> = ref({ label: "Any/latest/earliest", value: "addTest" });
const edited = ref(false);
const nestedReturns: Ref<Return[]> = ref([]);
const hoverEditColumns = ref(false);
const hoverDeleteColumns = ref(false);
const hoverAddFilter = ref(false);
const hoverAddColumns = ref(false);
const refreshColumns = ref(false);
const nestedMatch: Ref<Match> = ref(match.value);

function onUpdate() {
  edited.value = true;
}
function updateOrderable(value: any) {
  orderable.value = value;
  match.value.orderBy = { property: [{ iri: value.iri, direction: value.direction }] };
}

function addColumns() {
  showColumnSelector.value = true;
}

async function onSave() {
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
  emit("saveChanges", match.value);
}

function editColumns() {
  refreshColumns.value = true;
}
function cancelColumns() {
  delete match.value.return;
}

function onCancel() {
  emit("cancel");
}
</script>
