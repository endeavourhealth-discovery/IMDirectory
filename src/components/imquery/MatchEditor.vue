<template>
  <div v-if="!editMatch.is">
    <Dialog
      :draggable="false"
      :style="{ width: '90vw', height: '95vh', minWidth: '95vw', minHeight: '95vh' }"
      :visible="showEditor"
      closable
      maximizable
      modal
      @hide="cancel"
    >
      <template #default>
        <Tabs v-model:value="activeTab">
          <TabList>
            <Tab value="filter">Filter</Tab>
            <Tab value="columns">
              <span v-if="datasetEntry">Dataset items</span>
              <span v-else>Return columns/scores</span>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="filter">
              <MatchContentEditor
                v-model:match="editMatch"
                :baseType="baseType"
                :depth="depth"
                :index="clauseIndex"
                :parentOperator="parentOperator"
                @addLinked="onAddLinked"
                @cancel="cancel"
                @deleteMatch="deleteMatch"
                @saveChanges="emit('saveChanges', $event)"
                @updateMatch="onUpdate"
              />
            </TabPanel>
            <TabPanel value="columns">
              <ReturnEditor v-if="activeTab === 'columns'" v-model:match="editMatch" :baseType="baseType" @update-match="onUpdate" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </template>
      <template #footer>
        <div class="button-footer">
          <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="cancel" />
          <Button v-if="edited" autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
        </div>
      </template>
    </Dialog>
  </div>
  <div v-if="editMatch.is">
    <CohortEditor
      v-model:match="editMatch"
      :editMode="editCohort"
      :parentOperator="parentOperator"
      @cancel="cancel"
      @updateClauses="onUpdateClauses"
      @updateCohort="onSave"
    />
  </div>
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";

import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import { Bool, DisplayMode, IM } from "@endeavour/vue-library/enums";
import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { Match, Node, TTIriRef } from "@endeavour/vue-library/models";

import { cloneDeep } from "lodash-es";

import CohortEditor from "@/components/imquery/CohortEditor.vue";
import MatchContentEditor from "@/components/imquery/MatchContentEditor.vue";
import ReturnEditor from "@/components/imquery/ReturnEditor.vue";
import { EntityService, QueryService } from "@/services";
import { useDialogStore } from "@/stores/dialogStore";

import AlertDialog from "../shared/dynamicDialogs/AlertDialog.vue";

interface Props {
  baseType: Node;
  match: Match;
  depth: number;
  clauseIndex: number;
  showEditor: boolean;
  editCohort?: boolean;
  datasetEntry?: boolean;
  parentOperator?: Bool;
}

const props = defineProps<Props>();
const editMatch: Ref<Match> = ref(cloneDeep(props.match));
const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "cancel"): void;
  (event: "deleteMatch"): void;
  (event: "addTest", match: Match): void;
  (event: "addLinked", match: Match): void;
}>();
const dialogStore = useDialogStore();
const activeTab = ref(props.datasetEntry ? "columns" : "filter");
const editMatchString: Ref<string> = ref("");
const { onCopy, onCopyError } = useCopyToClipboard(editMatchString);
const edited = ref(false);

async function onUpdate() {
  edited.value = true;
  editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
}

function deleteMatch() {
  emit("deleteMatch");
}

async function onAddLinked() {
  const valid = await saveChanges();
  if (valid) {
    if (!editMatch.value.node) {
      editMatch.value.invalid = true;
      editMatch.value.errorMessage = "Please select a name to this clause  to line to";
      await showInvalid(editMatch.value);
      return;
    }
    emit("addLinked", editMatch.value);
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

async function onUpdateClauses(match: Match) {
  emit("saveChanges", match);
}

async function onSave() {
  const valid = await saveChanges();
  if (valid) {
    emit("saveChanges", editMatch.value);
  }
}

async function showInvalid(match: Match) {
  await dialogStore.open(AlertDialog, {
    props: { modal: true, style: { width: "30vw" }, closable: false },
    data: {
      icon: "fa-regular fa-circle-check",
      title: "Warning",
      text: match.errorMessage + ". Use filter tab to edit.",
      confirmButtonText: "Close"
    }
  });
}

async function saveChanges(): Promise<boolean> {
  const matchCheck = await QueryService.validateQuery(editMatch.value);
  if (matchCheck.invalid) {
    editMatch.value.draft = true;
    await showInvalid(matchCheck);
    return false;
  } else {
    editMatch.value = await QueryService.getQueryDisplayFromQuery(editMatch.value, DisplayMode.ORIGINAL);
    editMatch.value.draft = false;
    return true;
  }
}
function cancel() {
  emit("cancel");
}

function onAddFunctionProperty(args: { property: string; value: any }) {
  if (args.property === "orderBy") {
    editMatch.value!.orderBy = args.value;
  }
}
</script>

<style scoped>
.button-footer {
  height: 2vh;
}
</style>
