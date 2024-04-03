<template>
  <div>
    <Dialog
      v-model:visible="visible"
      header="Edit feature"
      :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
    >
      <div id="imquery-builder-string-container">
        <div id="imquery-builder-container">
          <div id="imquery-build">
            <!-- <EditMatch /> -->
          </div>
        </div>

        <div class="imquery-output-container">
          <Panel header="Output" toggleable collapsed>
            <TabView>
              <TabPanel header="Query JSON">
                <div class="imquery-string-container">
                  <pre :value="editMatchString" class="imquery-output-string">{{ editMatch }}</pre>
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
          <Button label="Cancel" text @click="visible = false" />
          <Button label="Save" autofocus @click="visible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { cloneDeep } from "lodash";
import { Ref, onMounted, ref, watch } from "vue";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import MatchDisplay from "./MatchDisplay.vue";

interface Props {
  showDialog: boolean;
  match: Match | undefined;
}

const props = defineProps<Props>();

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean"
});

const editMatch: Ref<Match | undefined> = ref();
const editMatchString: Ref<string> = ref("");
const visible = ref(false);
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(editMatchString);

watch(
  () => cloneDeep(editMatch.value),
  newValue => {
    editMatchString.value = JSON.stringify(newValue);
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

onMounted(() => {
  setEditMatch();
  editMatchString.value = JSON.stringify(editMatch.value);
});

function setEditMatch() {
  if (isObjectHasKeys(props.match)) editMatch.value = cloneDeep(props.match);
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
</style>
