<template>
  <ProgressSpinner v-if="loading" />
  <Dialog
    v-if="!loading"
    :visible="showDialog"
    :modal="true"
    :closable="false"
    :maximizable="true"
    :style="{
      minWidth: '90vw',
      minHeight: '90vh',
      display: 'flex',
      flexFlow: 'column nowrap'
    }"
    :contentStyle="{ flexGrow: '100', display: 'flex', flexDirection: 'column' }"
    :auto-z-index="true"
    id="query-builder-dialog"
  >
    <template #header>
      <div class="ecl-builder-dialog-header">
        <strong>Query definition builder:</strong>
        <Button icon="fa-regular fa-circle-question" text rounded-sm @click="toggle" />
        <Popover ref="op">Select or drag and drop for grouping</Popover>
      </div>
    </template>
    <BaseTypeEditor v-model:match="query" />
    <template v-if="query.typeOf" v-for="operator in operators" :key="operator">
      <template v-if="query[operator]">
        <template v-for="(nestedMatch, index) in query[operator]" :key="index">
          <BooleanMatchEditor
            v-model:match="query[operator][index]"
            :rootBool="true"
            :depth="0"
            v-model:parentMatch="query"
            :parentIndex="parentIndex"
            :clauseIndex="index"
            :parentOperator="operator as Bool"
            :baseType="query.typeOf!"
            @activateInput="activeInputId = $event"
            @rationalise="rationaliseBooleans"
          />
        </template>
      </template>
    </template>
    <div v-if="query.typeOf">
      <DataSetEditor :query="query" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="fa-solid fa-xmark" severity="secondary" @click="closeBuilderDialog" data-testid="cancel-ecl-builder-button" />
      <Button label="OK" icon="fa-solid fa-check" class="p-button-primary" @click="submit" data-testid="ecl-ok-button" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, ref, watch, onMounted, provide, readonly, nextTick } from "vue";
import QueryService from "@/services/QueryService";
import Swal from "sweetalert2";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import { Bool, Match, Query } from "@/interfaces/AutoGen";
import BooleanMatchEditor from "@/components/imquery/BooleanMatchEditor.vue";
import BaseTypeEditor from "@/components/imquery/BaseTypeEditor.vue";
import { useQueryStore } from "@/stores/queryStore";
import ColumnGroupEditor from "@/components/imquery/ColumnGroupEditor.vue";
import ReturnColumns from "@/components/query/viewer/ReturnColumns.vue";
import ColumnGroupDisplay from "@/components/query/viewer/ColumnGroupDisplay.vue";
import DataSetEditor from "@/components/imquery/DataSetEditor.vue";
import GenericDialog from "@/components/shared/dynamicDialogs/GenericDialog.vue";
import { useDialog } from "primevue/usedialog";
interface Props {
  showDialog?: boolean;
}
const props = defineProps<Props>();
const query = defineModel<Query>("query", { default: {} });
const emit = defineEmits<{
  querySubmitted: [payload: Query];
  eclConversionError: [payload: { error: boolean; message: string }];
  closeDialog: [];
}>();

const dynamicDialog = useDialog();

const activeInputId = ref("");
const build: Ref<Match> = ref({});
const includeTerms = ref(true);
const forceValidation = ref(false);
const queryString = ref("");
const operators = ["rule", "and", "or", "not"] as const;
const { copyToClipboard, onCopy, onCopyError } = useCopyToClipboard(queryString);
const loading = ref(true);
const childLoadingState: Ref<any> = ref({});
const wasDraggedAndDropped = ref(false);
const op = ref();
const parentIndex = ref(0);
const nodeRefMap = ref<{ [key: string]: any }>({});
const queryStore = useQueryStore();
const newColumnGroup: Ref<Match | undefined> = ref(undefined);
const columnGroupIndex = ref(0);
const showColumnGroupEditor = ref(false);
provide("query", query);
provide("wasDraggedAndDropped", wasDraggedAndDropped);
provide("includeTerms", readonly(includeTerms));
provide("forceValidation", readonly(forceValidation));
provide("childLoadingState", childLoadingState);

watch(
  () => props.showDialog,
  val => {
    if (val) init();
  }
);

onMounted(async () => {
  await init();
});

function toggle(event: any) {
  op.value.toggle(event);
}

async function init() {
  queryStore.createReturnMap(query.value);
  loading.value = false;
}
function createDefaultBuild() {
  build.value = {};
}
async function rationaliseBooleans() {
  build.value = await QueryService.flattenBooleans(build.value);
}

async function submit(): Promise<void> {
  emit("querySubmitted", query.value!);
}

function closeBuilderDialog(): void {
  emit("closeDialog");
}

async function displayValidationMessage(invalid: boolean | undefined) {
  if (!invalid) {
    dynamicDialog.open(GenericDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-check",
        title: "Success",
        text: "All entities are valid.",
        confirmButtonText: "Close"
      }
    });
  } else {
    dynamicDialog.open(GenericDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-exclamation",
        title: "Warning",
        text: "Invalid values found. Please review your entries.",
        confirmButtonText: "Close"
      }
    });
  }
}

function stripIds(idBuild: any) {
  if (idBuild) {
    delete idBuild.id;
    if (idBuild.items?.length) {
      for (const [index, item] of idBuild.items.entries()) {
        stripIds(item);
      }
    } else if (idBuild.type === "ExpressionConstraint") {
      if (idBuild.conceptBool) {
        stripIds(idBuild.conceptBool);
      }
      if (idBuild.refinementItems) {
        for (const [index, item] of idBuild.refinementItems.entries()) {
          stripIds(item);
        }
      }
    }
  }
}

function stripValidation(build: any) {
  delete build.validation;
  if (build.items?.length) {
    for (const item of build.items) {
      stripValidation(item);
    }
  } else if (build.refinementItems?.length) {
    for (const item of build.refinementItems) {
      stripValidation(item);
    }
  }
}
</script>

<style scoped>
#query-builder-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow: auto;
}
.addColumnGroup-btn {
  align-self: flex-start;
  width: 220px;
}

.ecl-builder-dialog-header {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  justify-content: space-between;
  font-size: larger;
}
</style>
