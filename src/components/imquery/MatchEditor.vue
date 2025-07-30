<template>
  <div>
    <Dialog
      :visible="showMatchEditor"
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
      <div v-else class="description-container">
        <span>Description</span>
        <Textarea v-model="match.description" autoResize placeholder="Description" rows="2" type="text" />
      </div>
      <div v-if="match.instanceOf || match.where" class="where-container">
        <CohortEditor v-if="match.instanceOf" v-model:match="match" v-model:editMode="editCohort" />
        <div v-else-if="match.where && !match.where.and">
          <PropertyEditor
            :data-model-iri="getDataModelFromNodeRef(match, match.where.nodeRef, baseType.iri!)"
            :edit-match="match"
            v-model:property="match.where"
          />
        </div>
        <div v-else-if="match.where && match.where.and" v-for="(item, index) in match.where.and">
          <PropertyEditor
            :data-model-iri="getDataModelFromNodeRef(match, item.nodeRef, baseType.iri!)"
            :edit-match="match"
            v-model:property="match.where.and[index]"
          />
        </div>
      </div>
      <div v-if="match.path">
        <span>Add more properties</span>
      </div>
      <span>
        <MatchTypeSelector :base-type="baseType" v-model:match="match" :rootNodes="rootNodes" @node-selected="onMatchTypeSelected($event)" />
      </span>
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
import { DataModelService, EntityService, QueryService } from "@/services";
import { IM } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { addWhereToMatch, getDataModelFromNodeRef, setReturn } from "@/composables/buildQuery";
import MatchTypeSelector from "@/components/imquery/MatchTypeSelector.vue";
import CohortEditor from "@/components/imquery/CohortEditor.vue";
import PropertyEditor from "@/components/imquery/PropertyEditor.vue";
import setupPropertyTree from "@/composables/setupPropertyTree";
import { isEqual } from "lodash-es";

interface Props {
  index?: number;
  baseType: Node;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const showMatchEditor = defineModel<boolean>("showMatchEditor", { default: false });
const emit = defineEmits<{
  (event: "saveChanges"): void;
  (event: "cancel"): void;
}>();
const { createFeatureTree, getRootNodes } = setupPropertyTree();
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = setupCopyToClipboard(editMatchString);
const templates: Ref<any> = ref();
const loading = ref(true);
const keepAs: Ref<string> = ref("");
const editCohort = ref(false);
const propertyTree: Ref<TreeNode[]> = ref([]);
const rootNodes: Ref<TreeNode[]> = ref([]);
watch(
  () => keepAs,
  () => setReturn(match.value, keepAs.value)
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

async function init() {
  loading.value = true;
  propertyTree.value = await createFeatureTree(props.baseType);
  if (match.value.path) {
    rootNodes.value = await getRootNodes(match.value, propertyTree.value[1].children!);
  }
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
        addWhereToMatch(match.value, node, defaultPropertyShape.path.iri);
        match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
        rootNodes.value = await getRootNodes(match.value, propertyTree.value[1].children!);
      }
    } else {
      addWhereToMatch(match.value, node, node.data.iri);
      match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
      rootNodes.value = await getRootNodes(match.value, propertyTree.value[1].children!);
    }
  }
}
async function getFunctionTemplates() {
  const iri = match.value?.typeOf?.iri;
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [IM.FUNCTION_TEMPLATE]);
    if (isArrayHasLength(entity[IM.FUNCTION_TEMPLATE])) {
      const iris = entity[IM.FUNCTION_TEMPLATE].map((functionTemplate: TTIriRef) => functionTemplate.iri);
      return await EntityService.getPartialEntities(iris, []);
    }
  }
}

async function onSave() {
  match.value = await QueryService.getQueryDisplayFromQuery(match.value, DisplayMode.ORIGINAL);
  emit("saveChanges");
  showMatchEditor.value = false;
}

function onCancel() {
  emit("cancel");
  showMatchEditor.value = false;
}

function onAddFunctionProperty(args: { property: string; value: any }) {
  if (args.property === "orderBy") match.value!.orderBy = args.value;
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
</style>
