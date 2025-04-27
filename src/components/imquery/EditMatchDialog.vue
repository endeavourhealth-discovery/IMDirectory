<template>
  <div>
    <Dialog
      v-model:visible="visible"
      modal
      :draggable="false"
      :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
      class="edit-match-dialog"
      maximizable
    >
      <template #header>
        <div class="flex items-center">
          <Button v-if="pathItems && pathItems.length > 1" icon="fa-solid fa-chevron-left" text @click="goBack" />
          <Breadcrumb :model="pathItems" class="grow">
            <template #item="{ item }">
              <div class="path-item" @click="updateDialogFocusFromBreadcrumb(item.key)">{{ item.label }}</div>
            </template>
            <template #separator> /</template>
          </Breadcrumb>
          <div v-if="editMatch" class="variable-edit flex-none">
            <InputText v-model="editMatch.name" placeholder="Name" type="text" />
            <InputText v-model="editMatch.variable" placeholder="Keep as reference" type="text" />
          </div>
        </div>
      </template>
      <div v-if="loading" class="flex w-full flex-auto flex-col flex-nowrap">
        <ProgressSpinner />
      </div>
      <div v-else class="flex w-full flex-auto flex-col flex-nowrap gap-1 overflow-auto">
        <Textarea v-if="editMatch" v-model="matchJson" autoResize placeholder="Description" rows="3" type="text" />
        <div id="imquery-builder-container">
          <div id="imquery-build">
            <EditMatch v-model:match="editMatch" :focused-id="editMatch['@id']" :is-root-feature="true" @on-update-dialog-focus="updateDialogFocus" />
            <div class="add-button-bar">
              <Button class="add-feature-button" icon="fa-solid fa-plus" label="Add test" severity="secondary" @click="showBuildThenFeature = true" />
              <Button
                v-if="!focusedEditMatch?.orderBy"
                class="add-feature-button"
                icon="fa-solid fa-arrow-down-z-a"
                label="Add order by"
                @click="focusedEditMatch!.orderBy = { description: '', limit: 0, property: {} }"
              />
              <FunctionComponent :function-templates="templates" @add-function-property="onAddFunctionProperty" />
            </div>
          </div>
        </div>

        <div class="imquery-output-container">
          <Panel collapsed header="Output" toggleable>
            <Tabs value="0">
              <TabList>
                <Tab value="0">Query JSON</Tab>
                <Tab value="1">Description</Tab>
              </TabList>
              <TabPanels>
                <TabPanel value="0">
                  <div class="imquery-string-container">
                    <pre class="imquery-output-string">{{ focusedEditMatch }}</pre>
                    <Button
                      v-clipboard:copy="copyToClipboard()"
                      v-clipboard:error="onCopyError"
                      v-clipboard:success="onCopy"
                      v-tooltip.left="'Copy to clipboard'"
                      icon="fa-solid fa-copy"
                    />
                  </div>
                </TabPanel>
                <TabPanel value="1">
                  <div class="imquery-description-container">
                    <div class="imquery-description">
                      <MatchDisplay v-if="editMatch" :match="editMatch" class="feature-description" />
                    </div>
                    <Button
                      v-clipboard:copy="copyToClipboard()"
                      v-clipboard:error="onCopyError"
                      v-clipboard:success="onCopy"
                      v-tooltip.left="'Copy to clipboard'"
                      icon="fa-solid fa-copy"
                    />
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Panel>
        </div>
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
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash-es";
import { DisplayMode, Match, TTIriRef } from "@/interfaces/AutoGen";
import { computed, inject, onMounted, Ref, ref, watch } from "vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import MatchDisplay from "./MatchDisplay.vue";
import EditMatch from "./EditMatch.vue";
import type { MenuItem } from "primevue/menuitem";
import { EntityService, QueryService } from "@/services";
import { IM } from "@/vocabulary";
import FunctionComponent from "./functionTemplates/FunctionComponent.vue";

interface Props {
  index?: number;
  match: Match;
}

const props = defineProps<Props>();

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean",
  saveChanges: (payload: Match) => payload
});
const keepAsVariable: Ref<string> = ref("");
const showBuildFeature: Ref<boolean> = ref(false);
const showBuildThenFeature: Ref<boolean> = ref(false);
const keepAsEdit: Ref<boolean> = ref(false);
const focusedEditMatch: Ref<Match | undefined> = ref();
const focusedEditMatchString: Ref<string> = ref("");
const visible = defineModel<boolean>("showDialog");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(focusedEditMatchString);
const pathItems: Ref<MenuItem[]> = ref([]);
const variableMap = inject("variableMap") as Ref<{ [key: string]: any }>;
const templates: Ref<any> = ref();
const loading = ref(true);
const editMatch: Ref<Match> = ref(cloneDeep(props.match));
const matchJson = computed(() => JSON.stringify(editMatch));
watch(
  () => cloneDeep(focusedEditMatch.value),
  newValue => {
    focusedEditMatchString.value = JSON.stringify(newValue);
  }
);

watch(
  () => props.index,
  () => setPathItems()
);

onMounted(async () => {
  console.log("IMQUERY EDIT DIALOG MOUNTED with " + props.match.typeOf?.["@id"]);
  await init();
});

async function init() {
  loading.value = true;
  editMatch.value = cloneDeep(props.match);
  setPathItems();
  templates.value = await getFunctionTemplates();
  loading.value = false;
}

async function getFunctionTemplates() {
  const iri = editMatch.value?.typeOf?.["@id"];
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [IM.FUNCTION_TEMPLATE]);
    if (isArrayHasLength(entity[IM.FUNCTION_TEMPLATE])) {
      const iris = entity[IM.FUNCTION_TEMPLATE].map((functionTemplate: TTIriRef) => functionTemplate["@id"]);
      const templateEntities = await EntityService.getPartialEntities(iris, []);
      return templateEntities;
    }
  }
}

function setPathItems() {
  pathItems.value = [{ label: props.index ? "Feature " + props.index : "Feature" }];
}

function updateDialogFocus(match: Match) {
  editMatch.value = match;
  onSave();
}

function goBack() {
  pathItems.value.pop();
  focusedEditMatch.value = pathItems.value[pathItems.value.length - 1].editMatch;
}

function updateDialogFocusFromBreadcrumb(id: string | undefined) {
  if (!id) return;
  if (id === focusedEditMatch.value?.["@id"]) return;
  let index = pathItems.value.length - 1;
  let found = false;
  while (!found && index > -1) {
    if (id === pathItems.value[index].key) {
      found = true;
      focusedEditMatch.value = pathItems.value[index].editMatch;
    } else {
      pathItems.value.pop();
      --index;
    }
  }
}

function onSave() {
  const newEditMatch = cloneDeep(editMatch.value);
  if (newEditMatch && JSON.stringify(newEditMatch) !== JSON.stringify(editMatch.value)) {
    emit("saveChanges", newEditMatch);
  }
  visible.value = false;
}

function onCancel() {
  init();
  visible.value = false;
}

function onMatchAdd(match: Match) {
  if (!editMatch.value) editMatch.value = {};
  if (!editMatch.value.match?.length) editMatch.value.match = [];
  editMatch.value.match.push(match);
}

function saveVariable() {
  udpateVariableMap();
  if (focusedEditMatch.value) focusedEditMatch.value.variable = keepAsVariable.value;
  keepAsEdit.value = false;
}

function deleteVariable() {
  if (focusedEditMatch.value?.variable) {
    delete variableMap.value[focusedEditMatch.value.variable];
    delete focusedEditMatch.value.variable;
  }
  keepAsVariable.value = "";
  keepAsEdit.value = false;
}

function udpateVariableMap() {
  if (focusedEditMatch.value?.variable) delete variableMap.value[focusedEditMatch.value.variable];
  variableMap.value[keepAsVariable.value] = focusedEditMatch.value;
}

function onAddFunctionProperty(property: string, value: any) {
  if (property === "orderBy") editMatch.value!.orderBy = value;
}
</script>

<style scoped>
.edit-match-dialog-content {
  display: flex;
  flex-flow: row;
}

#imquery-builder-string-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
}

#imquery-builder-container {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

#imquery-build {
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

.imquery-output-string {
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

.imquery-string-container {
  height: 40rem;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.imquery-description-container {
  height: 40rem;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.imquery-description {
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
