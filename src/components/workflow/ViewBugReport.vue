<template>
  <div id="bug-report-content">
    <h2>{{ props.id }}</h2>
    <Card class="bug-report-card">
      <template #content>
        <div v-if="loading"><ProgressSpinner /></div>
        <div v-else class="bug-report-form">
          <TaskViewer :id="id" :edit-mode="editMode" :submit-requested="submitRequested" @updated-task="updateTask" />
          <div class="field">
            <label for="product">Select app where the issue occurred</label>
            <Select
              v-model="selectedProduct"
              :options="productOptions"
              :class="{ 'p-invalid': productErrorMessage }"
              :disabled="!editMode"
              @blur="showErrorMessages.product = true"
            />
            <small v-if="showErrorMessages.product && productErrorMessage" class="p-error">{{ productErrorMessage }}</small>
          </div>
          <div class="field">
            <label for="module">What module of the app were you in when the issue occurred? </label>
            <Select
              v-model="selectedModule"
              :options="moduleOptions"
              :class="{ 'p-invalid': moduleErrorMessage }"
              :disabled="!editMode"
              @blur="showErrorMessages.module = true"
            />
            <small>Module can be identified in the browser url after the '#' e.g. http://im.endeavourhealth.net/#/<strong>auth</strong></small>
            <small v-if="showErrorMessages.module && moduleErrorMessage" class="p-error">{{ moduleErrorMessage }}</small>
          </div>
          <div class="field">
            <label for="os">What operating system were you using?</label>
            <Select
              v-model="selectedOS"
              :options="osOptions"
              :class="osErrorMessage && selectedOS !== OperatingSystem.OTHER && 'p-invalid'"
              :disabled="!editMode"
              @blur="showErrorMessages.os = true"
            />

            <div v-if="selectedOS === OperatingSystem.OTHER" class="other-container">
              <label for="osOther">Input operating system name</label>
              <InputText id="osOther" :disabled="!editMode" v-model="osOther" :class="osErrorMessage && 'p-invalid'" />
            </div>
            <small v-if="showErrorMessages.os && osErrorMessage" class="p-error" :class="selectedOS === OperatingSystem.OTHER && 'error-indented'">{{
              osErrorMessage
            }}</small>
          </div>

          <div class="field">
            <label for="browser">What browser were you using?</label>
            <Select
              v-model="selectedBrowser"
              :options="browserOptions"
              :class="browserErrorMessage && selectedBrowser !== Browser.OTHER && 'p-invalid'"
              :disabled="!editMode"
              @blur="showErrorMessages.browser = true"
            />
            <div v-if="selectedBrowser === Browser.OTHER" class="other-container">
              <label for="browserOther">Input browser name</label>
              <InputText id="browserOther" v-model="browserOther" :class="browserErrorMessage && 'p-invalid'" :disabled="!editMode" />
            </div>
            <small v-if="showErrorMessages.browser && browserErrorMessage" class="p-error" :class="selectedBrowser === Browser.OTHER && 'error-indented'">{{
              browserErrorMessage
            }}</small>
          </div>
          <div class="field">
            <label for="description">Description</label>
            <Textarea
              v-model="description"
              :class="{ 'p-invalid': descriptionErrorMessage }"
              class="text-area"
              @blur="showErrorMessages.description = true"
              :disabled="!editMode"
            />
            <small v-if="showErrorMessages.description && descriptionErrorMessage" class="p-error">{{ descriptionErrorMessage }}</small>
          </div>
          <div class="field">
            <label for="stepsToReproduce">Steps to reproduce</label>
            <Textarea
              v-model="stepsToReproduce"
              :class="{ 'p-invalid': stepsToReproduceErrorMessage }"
              class="text-area"
              @blur="showErrorMessages.steps = true"
              :disabled="!editMode"
            />
            <small>Please detail the necessary steps to encounter the error so it can be effectively reproduced.</small>
            <small v-if="showErrorMessages.steps && stepsToReproduceErrorMessage" class="p-error">{{ stepsToReproduceErrorMessage }}</small>
          </div>
          <div class="field">
            <label for="expectedResult">Expected result</label>
            <Textarea
              v-model="expectedResult"
              :class="{ 'p-invalid': expectedResultErrorMessage }"
              class="text-area"
              @blur="showErrorMessages.expected = true"
              :disabled="!editMode"
            />
            <small>What should have happened if you hadn't encountered a bug?</small>
            <small v-if="showErrorMessages.expected && expectedResultErrorMessage" class="p-error">{{ expectedResultErrorMessage }}</small>
          </div>
          <div class="field">
            <label for="actualResult">Actual result</label>
            <Textarea
              v-model="actualResult"
              :class="{ 'p-invalid': actualResultErrorMessage }"
              class="text-area"
              @blur="showErrorMessages.actual = true"
              :disabled="!editMode"
            />
            <small>What actually happened when you followed the reproduction steps to encounter the bug?</small>
            <small v-if="showErrorMessages.actual && actualResultErrorMessage" class="p-error">{{ actualResultErrorMessage }}</small>
          </div>
          <div class="flex gap-1">
            <Button v-if="canEdit && !editMode" label="Edit" @click="editMode = true" />
            <Button v-if="editMode" label="Cancel" @click="cancelEdit" severity="secondary" />
            <Button v-if="editMode" @click="updateBugReport" :loading="loading" label="Update" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Browser, BugReport, OperatingSystem, Task, TaskModule } from "@/interfaces/AutoGen";
import WorkflowService from "@/services/WorkflowService";
import { computed, onMounted, Ref, ref, watch } from "vue";
import TaskViewer from "./TaskViewer.vue";
import { useUserStore } from "@/stores/userStore";
import { useConfirm } from "primevue/useconfirm";

interface Props {
  id: string;
}

const props = defineProps<Props>();

const userStore = useUserStore();
const confirm = useConfirm();

const currentUser = computed(() => userStore.currentUser);
const canEdit = computed(() => currentUser.value?.username === bugReport.value?.createdBy);
const isAdmin = computed(() => userStore.isAdmin);
const isValidBugReport = computed(
  () =>
    !productErrorMessage.value &&
    !moduleErrorMessage.value &&
    !osErrorMessage.value &&
    !browserErrorMessage.value &&
    !descriptionErrorMessage.value &&
    !stepsToReproduceErrorMessage.value &&
    !expectedResultErrorMessage.value &&
    !actualResultErrorMessage.value
);

const bugReport: Ref<BugReport | undefined> = ref();
const editMode = ref(false);
const submitRequested = ref(false);

const selectedProduct: Ref<"IM"> = ref("IM");
const productErrorMessage = ref("");
const productOptions = ref(["IM"]);
watch(selectedProduct, newValue => {
  if (!newValue) productErrorMessage.value = "Required field";
  else productErrorMessage.value = "";
});

const selectedModule: Ref<TaskModule | undefined> = ref();
const moduleErrorMessage = ref("");
const moduleOptions: Ref<string[]> = ref([]);
watch(selectedModule, newValue => {
  if (!newValue) moduleErrorMessage.value = "Required field";
  else moduleErrorMessage.value = "";
});

const selectedOS: Ref<OperatingSystem | undefined> = ref();
const osErrorMessage = ref("");
const osOptions: Ref<string[]> = ref([]);
const osOther = ref("");
watch([selectedOS, osOther], ([newOS, newOther]) => {
  if (!newOS || (newOS === OperatingSystem.OTHER && !newOther)) osErrorMessage.value = "Required field";
  else osErrorMessage.value = "";
});

const selectedBrowser: Ref<Browser | undefined> = ref();
const browserErrorMessage = ref("");
const browserOptions: Ref<string[]> = ref([]);
const browserOther = ref("");
watch([selectedBrowser, browserOther], ([newBrowser, newOther]) => {
  if (!newBrowser || (newBrowser === Browser.OTHER && !newOther)) browserErrorMessage.value = "Required field";
  else browserErrorMessage.value = "";
});

const description = ref("");
const descriptionErrorMessage = ref("");
watch(description, newValue => {
  if (!newValue) descriptionErrorMessage.value = "Required field";
  else descriptionErrorMessage.value = "";
});

const stepsToReproduce = ref("");
const stepsToReproduceErrorMessage = ref("");
watch(stepsToReproduce, newValue => {
  if (!newValue) stepsToReproduceErrorMessage.value = "Required field";
  else stepsToReproduceErrorMessage.value = "";
});

const expectedResult = ref("");
const expectedResultErrorMessage = ref("");
watch(expectedResult, newValue => {
  if (!newValue) expectedResultErrorMessage.value = "Required field";
  else expectedResultErrorMessage.value = "";
});

const actualResult = ref("");
const actualResultErrorMessage = ref("");
watch(actualResult, newValue => {
  if (!newValue) actualResultErrorMessage.value = "Required field";
  else actualResultErrorMessage.value = "";
});

const showErrorMessages = ref({ product: false, module: false, os: false, browser: false, description: false, steps: false, expected: false, actual: false });
const loading = ref(false);

onMounted(async () => {
  bugReport.value = await WorkflowService.getBugReport(props.id);
  if (bugReport) setValuesFromBugReport(bugReport.value);
  setOptions();
});

function setOptions() {
  moduleOptions.value = [TaskModule.AUTH, TaskModule.CREATOR, TaskModule.DIRECTORY, TaskModule.EDITOR, TaskModule.QUERY, TaskModule.UPRN];
  osOptions.value = [OperatingSystem.LINUX, OperatingSystem.MACOS, OperatingSystem.WINDOWS];
  osOptions.value.push("Other");
  browserOptions.value = [Browser.CHROME, Browser.EDGE, Browser.FIREFOX, Browser.IE];
  browserOptions.value.push("Other");
}

function setValuesFromBugReport(bugReport: BugReport) {
  if (bugReport.product === "IM") selectedProduct.value = bugReport.product;
  if (bugReport.module) selectedModule.value = bugReport.module;
  if (bugReport.os) selectedOS.value = bugReport.os;
  if (bugReport.osOther) osOther.value = bugReport.osOther;
  if (bugReport.browser) selectedBrowser.value = bugReport.browser;
  if (bugReport.browserOther) browserOther.value = bugReport.browserOther;
  if (bugReport.description) description.value = bugReport.description;
  if (bugReport.reproduceSteps) stepsToReproduce.value = bugReport.reproduceSteps;
  if (bugReport.expectedResult) expectedResult.value = bugReport.expectedResult;
  if (bugReport.actualResult) actualResult.value = bugReport.actualResult;
}

async function updateBugReport() {
  submitRequested.value = true;
}

async function updateTask(task: Task) {
  if (isValidBugReport) {
    confirm.require({
      message: "Are you sure you want to update this bug report?",
      header: "Confirm update",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true
      },
      acceptProps: {
        label: "Update"
      },
      accept: async () => {
        const updatedBugReport: BugReport = {
          id: { iri: props.id },
          product: selectedProduct.value,
          module: selectedModule.value,
          os: selectedOS.value,
          osOther: osOther.value,
          browser: selectedBrowser.value,
          browserOther: browserOther.value,
          description: description.value,
          reproduceSteps: stepsToReproduce.value,
          expectedResult: expectedResult.value,
          actualResult: actualResult.value,
          createdBy: task.createdBy,
          type: task.type,
          state: task.state,
          assignedTo: task.assignedTo,
          dateCreated: task.dateCreated,
          history: task.history
        };
        await WorkflowService.updateBugReport(updatedBugReport);
      }
    });
  }
}

function cancelEdit() {
  if (bugReport.value) setValuesFromBugReport(bugReport.value);
  editMode.value = false;
}
</script>

<style scoped>
#bug-report-content {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding: 1rem;
}

.topbar-content {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.bug-report-card {
  width: 80%;
  overflow: auto;
}

.field {
  display: flex;
  flex-flow: column nowrap;
}

.text-area {
  height: 5rem;
}
.title {
  font-size: 2rem;
}

.other-container {
  display: flex;
  flex-flow: column nowrap;
  margin-left: 2rem;
  padding-top: 0.25rem;
}

.error-indented {
  margin-left: 2rem;
}
</style>
