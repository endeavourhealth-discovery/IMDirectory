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
    <BaseTypeSelector v-model:match="query" />
    <span v-if="query.rule">
      <span v-for="(nestedMatch, index) in query.rule" :key="index">
        <MatchClauseDisplay
          v-model:match="query.rule[index]"
          :rootBool="true"
          :depth="0"
          :parentIndex="parentIndex"
          :clauseIndex="index"
          :parentOperator="Bool.rule"
          :activeInputId="activeInputId"
          @activateInput="activeInputId = $event"
          @rationalise="rationaliseBooleans"
        />
      </span>
    </span>
    <span v-else-if="query.typeOf" id="query-builder-container">
      <ProgressSpinner v-if="loading" />
      <MatchClauseDisplay
        v-else
        v-model:match="query"
        :rootBool="true"
        :parentIndex="parentIndex"
        :depth="0"
        :clauseIndex="0"
        :parentOperator="Bool.and"
        :activeInputId="activeInputId"
        @activateInput="activeInputId = $event"
        @rationalise="rationaliseBooleans"
      />
      <small style="color: red" v-if="!build.or && !build.and && !build.where && !build.instanceOf && !loading">
        *Move pointer over panel above to add concepts, refinements and groups.
      </small>
    </span>
    <template #footer>
      <Button label="Cancel" icon="fa-solid fa-xmark" severity="secondary" @click="closeBuilderDialog" data-testid="cancel-ecl-builder-button" />
      <Button label="OK" icon="fa-solid fa-check" class="p-button-primary" @click="submit" data-testid="ecl-ok-button" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, ref, watch, onMounted, provide, readonly, nextTick } from "vue";
import QueryService from "@/services/QueryService";
import { useDialog } from "primevue/usedialog";
import Swal from "sweetalert2";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import { Bool, Match, Query } from "@/interfaces/AutoGen";
import MatchClauseDisplay from "@/components/imquery/MatchClauseDisplay.vue";
import BaseTypeSelector from "@/components/imquery/BaseTypeSelector.vue";

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
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(queryString);
const loading = ref(true);
const childLoadingState: Ref<any> = ref({});
const wasDraggedAndDropped = ref(false);
const op = ref();
const parentIndex = ref(0);

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
    await Swal.fire({
      icon: "success",
      title: "Success",
      backdrop: true,
      showClass: { popup: "swal-popup" },
      text: "All entities are valid.",
      confirmButtonText: "Close",
      confirmButtonColor: "#689F38"
    });
  } else {
    await Swal.fire({
      icon: "warning",
      title: "Warning",
      text: "Invalid values found. Please review your entries.",
      confirmButtonText: "Close",
      confirmButtonColor: "#689F38"
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

.ecl-builder-dialog-header {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  justify-content: space-between;
  font-size: larger;
}
</style>
