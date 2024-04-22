<template>
  <div>
    <Dialog
      v-model:visible="visible"
      maximizable
      :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
    >
      <template #header>
        <Button v-if="pathItems && pathItems.length > 1" icon="fa-solid fa-chevron-left" text @click="goBack" />

        <Breadcrumb :model="pathItems">
          <template #item="{ item }">
            <div class="path-item" @click="updateDialogFocusFromBreadcrumb(item.key)">{{ item.label }}</div>
          </template>
          <template #separator> / </template>
        </Breadcrumb>
        <div v-if="!keepAsEdit" class="variable-display">
          <div v-if="focusedEditMatch?.variable" style="padding-left: 1rem">as</div>
          <div v-if="focusedEditMatch?.variable" class="variable" @click="keepAsEdit = true">{{ focusedEditMatch?.variable }}</div>
          <Button v-else icon="fa-solid fa-tag" label="Label as a variable" text @click="keepAsEdit = true" />
        </div>
        <div class="variable-edit" v-else>
          <InputText type="text" placeholder="value" v-model="focusedEditMatch!.variable" />
          <Button icon="fa-solid fa-check" @click="keepAsEdit = false" />
          <Button
            icon="fa-solid fa-trash-can"
            severity="danger"
            @click="
              {
                delete focusedEditMatch!.variable;
                keepAsEdit = false;
              }
            "
          />
        </div>
      </template>
      <div id="imquery-builder-string-container">
        <div id="imquery-builder-container">
          <div id="imquery-build" v-if="focusedEditMatch">
            <EditMatch
              :edit-match="focusedEditMatch"
              :is-root-feature="true"
              :focused-id="focusedEditMatch['@id']"
              :match-type-of-iri="focusedEditMatch.typeOf?.['@id'] ?? queryBaseTypeIri"
              @on-update-dialog-focus="updateDialogFocus"
            />
            <AddMatch
              v-model:show-add-feature="showAddFeature"
              v-model:show-add-population="showAddPopulation"
              v-model:show-build-feature="showBuildFeature"
              v-model:show-build-then-feature="showBuildThenFeature"
              :edit-match="focusedEditMatch"
              :match-type-of-iri="focusedEditMatch.typeOf?.['@id'] ?? queryBaseTypeIri"
            />
            <div class="add-button-bar">
              <Button
                v-if="!focusedEditMatch?.then"
                label="Add test"
                @click="showBuildThenFeature = true"
                severity="secondary"
                icon="fa-solid fa-plus"
                class="add-feature-button"
              />
              <Button label="Add population" @click="showAddPopulation = true" severity="help" icon="fa-solid fa-plus" class="add-feature-button" />
              <Button label="Add existing feature" @click="showAddFeature = true" severity="success" icon="fa-solid fa-plus" class="add-feature-button" />
              <Button
                label="Build feature"
                @click="showBuildFeature = true"
                severity="warning"
                icon="fa-solid fa-screwdriver-wrench"
                class="add-feature-button"
              />
              <Button
                v-if="!focusedEditMatch?.orderBy"
                label="Add order by"
                @click="focusedEditMatch!.orderBy = { description: '', limit: 0, partitionBy: {}, property: {} }"
                icon="fa-solid fa-arrow-down-z-a"
                class="add-feature-button"
              />
            </div>
          </div>
        </div>

        <div class="imquery-output-container">
          <Panel header="Output" toggleable collapsed>
            <TabView>
              <TabPanel header="Query JSON">
                <div class="imquery-string-container">
                  <pre class="imquery-output-string">{{ focusedEditMatch }}</pre>
                  <Button
                    icon="fa-solid fa-copy"
                    v-tooltip.left="'Copy to clipboard'"
                    v-clipboard:copy="copyToClipboard()"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onCopyError"
                  />
                </div>
              </TabPanel>
              <TabPanel header="Description">
                <div class="imquery-description-container">
                  <div class="imquery-description"><MatchDisplay v-if="editMatch" class="feature-description" :match="editMatch" /></div>
                  <Button
                    icon="fa-solid fa-copy"
                    v-tooltip.left="'Copy to clipboard'"
                    v-clipboard:copy="copyToClipboard()"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onCopyError"
                  />
                </div>
              </TabPanel>
            </TabView>
          </Panel>
        </div>
      </div>
      <template #footer>
        <div class="button-footer">
          <Button label="Cancel" text @click="onCancel" />
          <Button label="Save" autofocus @click="onSave" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { cloneDeep } from "lodash";
import { Ref, onMounted, ref, watch } from "vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import MatchDisplay from "./MatchDisplay.vue";
import EditMatch from "./EditMatch.vue";
import { MenuItem } from "primevue/menuitem";
import AddMatch from "./AddMatch.vue";

interface Props {
  showDialog: boolean;
  match: Match | undefined;
  index: number;
  queryBaseTypeIri: string;
}

const props = defineProps<Props>();

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean",
  saveChanges: (payload: Match | undefined) => payload
});

const showAddPopulation: Ref<boolean> = ref(false);
const showBuildFeature: Ref<boolean> = ref(false);
const showBuildThenFeature: Ref<boolean> = ref(false);
const showAddFeature: Ref<boolean> = ref(false);
const keepAsEdit: Ref<boolean> = ref(false);
const editMatch: Ref<Match | undefined> = ref();
const focusedEditMatch: Ref<Match | undefined> = ref();
const focusedEditMatchString: Ref<string> = ref("");
const visible = ref(false);
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(focusedEditMatchString);
const pathItems: Ref<MenuItem[]> = ref([]);

watch(
  () => cloneDeep(focusedEditMatch.value),
  newValue => {
    focusedEditMatchString.value = JSON.stringify(newValue);
  }
);

watch(
  () => props.showDialog,
  newValue => {
    visible.value = newValue;
  }
);

watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});

watch(
  () => cloneDeep(props.match),
  () => setEditMatch()
);

watch(
  () => props.index,
  () => setPathItems()
);

onMounted(() => {
  init();
});

function init() {
  setEditMatch();
  focusedEditMatchString.value = JSON.stringify(focusedEditMatch.value);
  setPathItems();
}

function setPathItems() {
  pathItems.value = [{ label: "Feature " + props.index }];
}

function setEditMatch() {
  if (isObjectHasKeys(props.match)) editMatch.value = cloneDeep(props.match);
  focusedEditMatch.value = editMatch.value;
}

function updateDialogFocus(items: MenuItem[]) {
  if (!isArrayHasLength(items) || items[items.length - 1].editMatch?.["@id"] === focusedEditMatch.value?.["@id"]) return;
  pathItems.value = items;
  focusedEditMatch.value = items[items.length - 1].editMatch;
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
  emit("saveChanges", cloneDeep(editMatch.value));
  visible.value = false;
}

function onCancel() {
  init();
  visible.value = false;
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
  background-color: var(--surface-a);
  border: 1px solid var(--surface-border);
  border-radius: 3px;
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
  background-color: var(--surface-a);
  border: 1px solid var(--surface-border);
  border-radius: 3px;
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
  column-gap: 1rem;
}
</style>
