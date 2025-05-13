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
            <EditMatch v-model:match="editMatch" :focused-id="editMatch.iri" :is-root-feature="true" @on-update-dialog-focus="updateDialogFocus" />
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
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash-es";
import { Match, TTIriRef } from "@/interfaces/AutoGen";
import { computed, onMounted, Ref, ref, watch } from "vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import MatchDisplay from "./MatchDisplay.vue";
import EditMatch from "./EditMatch.vue";
import type { MenuItem } from "primevue/menuitem";
import { EntityService } from "@/services";
import { IM } from "@/vocabulary";
import FunctionComponent from "./functionTemplates/FunctionComponent.vue";

const props = defineProps<{
  index?: number;
  match: Match;
}>();

const emit = defineEmits<{
  "update:showDialog": [payload: string];
  saveChanges: [payload: Match];
}>();
const showBuildThenFeature: Ref<boolean> = ref(false);
const focusedEditMatch: Ref<Match | undefined> = ref();
const focusedEditMatchString: Ref<string> = ref("");
const visible = defineModel<boolean>("showDialog");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(focusedEditMatchString);
const pathItems: Ref<MenuItem[]> = ref([]);
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
  console.log("IMQUERY EDIT DIALOG MOUNTED with " + props.match.typeOf?.iri);
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
  const iri = editMatch.value?.typeOf?.iri;
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
  if (id === focusedEditMatch.value?.iri) return;
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

function onAddFunctionProperty(property: string, value: any) {
  if (property === "orderBy") editMatch.value!.orderBy = value;
}
</script>

<style scoped>
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
  flex-grow: 100;
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
  flex-grow: 100;
  overflow-y: auto;
  tab-size: 4;
}

.path-item {
  cursor: pointer;
}

.variable-edit {
  padding-left: 1rem;
}

.add-button-bar {
  display: flex;
  column-gap: 0.2rem;
}

.edit-match-dialog {
  background-color: var(--p-surface-section);
}
</style>
