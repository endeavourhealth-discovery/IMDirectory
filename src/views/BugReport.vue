<template>
  <div id="bug-report-main">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>Bug report</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="bug-report-content">
      <h2>Submit a bug report</h2>
      <Card class="bug-report-card">
        <template #content>
          <div class="bug-report-form">
            <div class="field">
              <label for="product">Select app where the issue occurred</label>
              <Select
                v-model="selectedProduct"
                :options="productOptions"
                :class="{ 'p-invalid': productErrorMessage }"
                disabled
                @blur="showErrorMessages.product = true"
              />
              <small v-if="showErrorMessages.product && productErrorMessage" class="p-error">{{ productErrorMessage }}</small>
            </div>
            <div class="field">
              <label for="module">What module of the app were you in when the issue occurred? </label>
              <Select v-model="selectedModule" :options="moduleOptions" :class="{ 'p-invalid': moduleErrorMessage }" @blur="showErrorMessages.module = true" />
              <small>Module can be identified in the browser url after the '#' e.g. http://im.endeavourhealth.net/#/<strong>auth</strong></small>
              <small v-if="showErrorMessages.module && moduleErrorMessage" class="p-error">{{ moduleErrorMessage }}</small>
            </div>
            <div class="field">
              <label for="os">What operating system were you using?</label>
              <Select
                v-model="selectedOS"
                :options="osOptions"
                :class="osErrorMessage && selectedOS !== OperatingSystem.OTHER && 'p-invalid'"
                @blur="showErrorMessages.os = true"
              />

              <div v-if="selectedOS === OperatingSystem.OTHER" class="other-container">
                <label for="osOther">Input operating system name</label>
                <InputText id="osOther" v-model="osOther" :class="osErrorMessage && 'p-invalid'" />
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
                @blur="showErrorMessages.browser = true"
              />
              <div v-if="selectedBrowser === Browser.OTHER" class="other-container">
                <label for="browserOther">Input browser name</label>
                <InputText id="browserOther" v-model="browserOther" :class="browserErrorMessage && 'p-invalid'" />
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
              />
              <small>What should have happened if you hadn't encountered a bug?</small>
              <small v-if="showErrorMessages.expected && expectedResultErrorMessage" class="p-error">{{ expectedResultErrorMessage }}</small>
            </div>
            <div class="field">
              <label for="actualResult">Actual result</label>
              <Textarea v-model="actualResult" :class="{ 'p-invalid': actualResultErrorMessage }" class="text-area" @blur="showErrorMessages.actual = true" />
              <small>What actually happened when you followed the reproduction steps to encounter the bug?</small>
              <small v-if="showErrorMessages.actual && actualResultErrorMessage" class="p-error">{{ actualResultErrorMessage }}</small>
            </div>
            <div class="button-container">
              <Button @click="onSubmit" :loading="loading" label="Submit" />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { useSharedStore } from "@/stores/sharedStore";
import { Ref, computed, onMounted, ref, watch } from "vue";
import { BugReport } from "@/interfaces/AutoGen";
import { TaskModule, TaskState, TaskType, Browser, OperatingSystem, Status } from "@/enums";
import { useUserStore } from "@/stores/userStore";
import WorkflowService from "@/services/WorkflowService";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import GithubService from "@/services/GithubService";

const sharedStore = useSharedStore();
const userStore = useUserStore();
const router = useRouter();

const error = computed(() => sharedStore.error);
const user = computed(() => userStore.currentUser);

const selectedProduct: Ref<"IM"> = ref("IM");
const productErrorMessage = ref("");
const productOptions = ref(["IM"]);
watch(selectedProduct, newValue => {
  if (!newValue) productErrorMessage.value = "Required field";
  else productErrorMessage.value = "";
});

const selectedModule: Ref<TaskModule | ""> = ref("");
const moduleErrorMessage = ref("");
const moduleOptions: Ref<string[]> = ref([]);
watch(selectedModule, newValue => {
  if (!newValue) moduleErrorMessage.value = "Required field";
  else moduleErrorMessage.value = "";
});

const selectedOS: Ref<OperatingSystem | ""> = ref("");
const osErrorMessage = ref("");
const osOptions: Ref<string[]> = ref([]);
const osOther = ref("");
watch([selectedOS, osOther], ([newOS, newOther]) => {
  if (!newOS || (newOS === OperatingSystem.OTHER && !newOther)) osErrorMessage.value = "Required field";
  else osErrorMessage.value = "";
});

const selectedBrowser: Ref<Browser | ""> = ref("");
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

onMounted(() => {
  setOptions();
});

function setOptions() {
  moduleOptions.value = [TaskModule.AUTH, TaskModule.CREATOR, TaskModule.DIRECTORY, TaskModule.EDITOR, TaskModule.QUERY, TaskModule.UPRN];
  osOptions.value = [OperatingSystem.LINUX, OperatingSystem.MACOS, OperatingSystem.WINDOWS];
  osOptions.value.push("Other");
  browserOptions.value = [Browser.CHROME, Browser.EDGE, Browser.FIREFOX, Browser.IE];
  browserOptions.value.push("Other");
}

async function onSubmit() {
  if (allVerified()) {
    loading.value = true;
    const bugReport = {} as BugReport;
    bugReport.product = selectedProduct.value;
    if (selectedModule.value) bugReport.module = selectedModule.value;
    if (selectedOS.value) bugReport.os = selectedOS.value;
    else if (selectedOS.value && selectedOS.value === OperatingSystem.OTHER) bugReport.osOther = osOther.value;
    if (selectedBrowser.value) bugReport.browser = selectedBrowser.value;
    else if (selectedBrowser.value && selectedBrowser.value === Browser.OTHER) bugReport.browserOther = browserOther.value;
    bugReport.status = Status.NEW;
    bugReport.description = description.value;
    bugReport.reproduceSteps = stepsToReproduce.value;
    bugReport.expectedResult = expectedResult.value;
    bugReport.actualResult = actualResult.value;
    if (user.value) bugReport.createdBy = user.value.id;
    if (error.value) bugReport.error = error.value;
    const latestResult = await GithubService.getLatestRelease("IMDirectory");
    if (latestResult) bugReport.version = latestResult.version;
    bugReport.type = TaskType.BUG_REPORT;
    bugReport.state = TaskState.TODO;
    await WorkflowService.createBugReport(bugReport).then(async res => {
      if (!res) {
        await Swal.fire({
          title: "Success",
          text: "Bug report successfully submitted",
          icon: "success",
          confirmButtonText: "Close",
          confirmButtonColor: "#2196F3"
        }).then(async () => {
          loading.value = false;
          await router.push({ path: "/" });
        });
      }
    });
    loading.value = false;
  }
}

function allVerified() {
  return (
    selectedProduct.value &&
    selectedModule.value &&
    ((selectedOS.value && selectedOS.value !== OperatingSystem.OTHER) || (selectedOS.value === OperatingSystem.OTHER && osOther.value)) &&
    ((selectedBrowser.value && selectedBrowser.value !== Browser.OTHER) || (selectedBrowser.value === Browser.OTHER && browserOther.value)) &&
    description.value &&
    stepsToReproduce.value &&
    expectedResult.value &&
    actualResult.value
  );
}
</script>

<style scoped>
#bug-report-main {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

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
