<template>
  <div>
    <Dialog
      :visible="visible"
      modal
      :draggable="false"
      :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
      class="edit-match-dialog"
      maximizable
    >
      <template #header>
        <div class="flex w-full flex-auto flex-col flex-nowrap gap-1 overflow-auto">
          <span>Name</span>
          <InputText v-model="match.name" class="name-display" placeholder="Name" type="text" />
          <span>Result label</span>
          <div>
            <InputText v-model="keepAs" placeholder="label to keep as reference" type="text" />
          </div>
        </div>
      </template>
      <div v-if="loading" class="flex w-full flex-auto flex-col flex-nowrap">
        <ProgressSpinner />
      </div>
      <div v-else class="flex w-full flex-auto flex-col flex-nowrap gap-1 overflow-auto">
        <span>Description</span>
        <Textarea v-model="match.description" autoResize placeholder="Description" rows="2" type="text" />
        <span v-if="match.instanceOf || match.where">
          <CohortEditor v-if="match.instanceOf" v-model:match="match" v-model:editMode="editCohort" />
          <div v-else-if="match.where">
            <span v-if="!match.where.and">
              <span>Where: {{ match.where }}</span>
            </span>
            <EditProperty :data-model-iri="match.typeOf ? match.typeOf!.iri! :baseType.iri!" :edit-match="match" v-model:property="match.where" />
          </div>
        </span>

        <span v-else>
          <span>Select properties to add</span>
          <MatchTypeSelector :base-type="baseType" @node-selected="onMatchTypeSelected($event)" />
        </span>
      </div>
      <template #footer>
        <div class="button-footer">
          <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="onCancel" />
          <Button autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { DisplayMode, Match, Node, TTIriRef } from "@/interfaces/AutoGen";
import { onMounted, Ref, ref, watch } from "vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import type { MenuItem } from "primevue/menuitem";
import { EntityService, QueryService, DataModelService } from "@/services";
import { IM } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { addWhereToMatch, setReturn } from "@/composables/buildQuery";
import MatchTypeSelector from "@/components/imquery/MatchTypeSelector.vue";
import CohortEditor from "@/components/imquery/CohortEditor.vue";
import EditProperty from "@/components/imquery/EditProperty.vue";

interface Props {
  index?: number;
  baseType: Node;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const visible = ref(true);
const emit = defineEmits<{
  (event: "saveChanges"): void;
  (event: "cancel"): void;
}>();
const keepAsVariable: Ref<string> = ref("");
const showBuildFeature: Ref<boolean> = ref(false);
const showBuildThenFeature: Ref<boolean> = ref(false);
const keepAsEdit: Ref<boolean> = ref(false);
const editMatchString: Ref<string> = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(editMatchString);
const pathItems: Ref<MenuItem[]> = ref([]);
const templates: Ref<any> = ref();
const loading = ref(true);
const keepAs: Ref<string> = ref("");
const editCohort = ref(false);
watch(
  () => keepAs,
  () => setReturn(match.value, keepAs.value)
);

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  setPathItems();
  templates.value = await getFunctionTemplates();
  loading.value = false;
}

async function onMatchTypeSelected(node: TreeNode) {
  if (node.data.iri === "cohort") {
    editCohort.value = true;
  } else {
    if (node.data.range) {
      const defaultPropertyShape = await DataModelService.getDefiningProperty(node.data.range);
      if (defaultPropertyShape.path) {
        addWhereToMatch(match.value, node.data.path, defaultPropertyShape.path.iri);
        QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
      }
    } else {
      addWhereToMatch(match.value, node.data.path, node.data.iri);
      QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
    }
  }
}
async function getFunctionTemplates() {
  const iri = match.value?.typeOf?.iri;
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [IM.FUNCTION_TEMPLATE]);
    if (isArrayHasLength(entity[IM.FUNCTION_TEMPLATE])) {
      const iris = entity[IM.FUNCTION_TEMPLATE].map((functionTemplate: TTIriRef) => functionTemplate.iri);
      const templateEntities = await EntityService.getPartialEntities(iris, []);
      return templateEntities;
    }
  }
}

function setPathItems() {
  pathItems.value = [{ label: props.index ? "Feature " + props.index : "Feature" }];
}

function onSave() {
  emit("saveChanges");
  visible.value = false;
}

function onCancel() {
  emit("cancel");
  visible.value = false;
}

function onAddFunctionProperty(args: { property: string; value: any }) {
  if (args.property === "orderBy") match.value!.orderBy = args.value;
}
</script>

<style scoped>
.edit-match-dialog-content {
  display: flex;
  flex-flow: row;
}

.name-display {
  width: 100%;
}

#immatch-builder-string-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
}

#immatch-builder-container {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

#immatch-build {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1rem;
  flex: 1 1 auto;
  font-size: 12px;
  overflow: auto;
}

.immatch-output-string {
  background-color: var(--p-content-background);
  border: 1px solid var(--p-textarea-border-color);
  border-radius: var(--p-textarea-border-radius);
  padding: 1rem;
  margin: 0;
  height: 100%;
  grow: 100;
  overflow-y: auto;
  tab-size: 4;
}

.immatch-string-container {
  height: 40rem;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.immatch-description-container {
  height: 40rem;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.immatch-description {
  background-color: var(--p-content-background);
  border: 1px solid var(--p-textarea-border-color);
  border-radius: var(--p-textarea-border-radius);
  padding: 1rem;
  margin: 0;
  height: 100%;
  grow: 100;
  overflow-y: auto;
  tab-size: 4;
}

.path-item {
  cursor: pointer;
}

.variable-edit {
  padding-left: 1rem;
}

.variable {
  padding-left: 1rem;
  cursor: pointer;
}

.variable-display {
  align-items: baseline;
  display: flex;
}

.add-button-bar {
  display: flex;
  column-gap: 0.2rem;
}

.edit-match-dialog {
  background-color: var(--p-surface-section);
}
</style>
