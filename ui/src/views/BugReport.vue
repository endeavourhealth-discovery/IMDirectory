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
      <Card class="bug-report-card">
        <template #content>
          <div class="bug-report-form">
            <div class="field">
              <label for="product">Select app where the issue occurred</label>
              <Dropdown v-model="selectedProduct" :options="productOptions" :class="{ 'p-invalid': productErrorMessage }" disabled />
              <small class="p-error">{{ productErrorMessage || "&nbsp;" }}</small>
            </div>
            <div class="field">
              <label for="module">What module of the app were you in when the issue occurred?</label>
              <Dropdown v-model="selectedModule" :options="moduleOptions" :class="{ 'p-invalid': moduleErrorMessage }" />
              <small class="p-error">{{ moduleErrorMessage || "&nbsp;" }}</small>
            </div>
            <div class="field">
              <label for="os">What operating system were you using?</label>
              <Dropdown v-model="selectedOS" :options="osOptions" :class="{ 'p-invalid': osErrorMessage }" />
              <small class="p-error">{{ osErrorMessage || "&nbsp;" }}</small>
              <InputText v-if="selectedOS === 'Other'" v-model="osOther" />
            </div>

            <div class="field">
              <label for="browser">What browser were you using?</label>
              <Dropdown v-model="selectedBrowser" :options="browserOptions" :class="{ 'p-invalid': browserErrorMessage }" />
              <small class="p-error">{{ browserErrorMessage || "&nbsp;" }}</small>
            </div>
            <div class="field">
              <label for="description">Description</label>
              <Textarea v-model="description" :class="{ 'p-invalid': descriptionErrorMessage }" class="text-area" />
              <small class="p-error">{{ descriptionErrorMessage || "&nbsp;" }}</small>
            </div>
            <div class="field">
              <label for="stepsToReproduce">Steps to reproduce</label>
              <Textarea v-model="stepsToReproduce" :class="{ 'p-invalid': stepsToReproduceErrorMessage }" class="text-area" />
              <small>Please detail the necessary steps to encounter the error so it can be effectively reproduced.</small>
              <small class="p-error">{{ stepsToReproduceErrorMessage || "&nbsp;" }}</small>
            </div>
            <div class="field">
              <label for="expectedResult">Expected result</label>
              <Textarea v-model="expectedResult" :class="{ 'p-invalid': expectedResultErrorMessage }" class="text-area" />
              <small>What should have happened if you hadn't encountered a bug?</small>
              <small class="p-error">{{ expectedResultErrorMessage || "&nbsp;" }}</small>
            </div>
            <div class="field">
              <label for="actualResult">Actual result</label>
              <Textarea v-model="actualResult" :class="{ 'p-invalid': actualResultErrorMessage }" class="text-area" />
              <small>What actually happened when you followed the reproduction steps to encounter the bug?</small>
              <small class="p-error">{{ actualResultErrorMessage || "&nbsp;" }}</small>
            </div>
            <div class="button-container">
              <Button @click="onSubmit" label="Submit" />
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
import { Ref, computed, onMounted, ref } from "vue";
import { enumToArray } from "@im-library/helpers/Converters";
import { Module, OperatingSystem, Browser } from "@im-library/enums/bugReport";

const sharedStore = useSharedStore();

const error = computed(() => sharedStore.error);

const selectedProduct = ref("IM");
const productErrorMessage = ref("");
const productOptions = ref(["IM"]);

const selectedModule = ref("");
const moduleErrorMessage = ref("");
const moduleOptions: Ref<string[]> = ref([]);

const selectedOS = ref("");
const osErrorMessage = ref("");
const osOptions: Ref<string[]> = ref([]);
const osOther = ref("");

const selectedBrowser = ref("");
const browserErrorMessage = ref("");
const browserOptions: Ref<string[]> = ref([]);

const description = ref("");
const descriptionErrorMessage = ref("");

const stepsToReproduce = ref("");
const stepsToReproduceErrorMessage = ref("");

const expectedResult = ref("");
const expectedResultErrorMessage = ref("");

const actualResult = ref("");
const actualResultErrorMessage = ref("");

onMounted(() => {
  setOptions();
});

function setOptions() {
  moduleOptions.value = enumToArray(Module)
    .map(item => item[0].toUpperCase() + item.slice(1))
    .sort();
  osOptions.value = enumToArray(OperatingSystem)
    .map(item => item[0].toUpperCase() + item.slice(1))
    .sort();
  osOptions.value.push("Other");
  browserOptions.value = enumToArray(Browser)
    .map(item => item[0].toUpperCase() + item.slice(1))
    .sort();
  browserOptions.value.push("Other");
}

function onSubmit(values: any) {
  console.log(values);
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
</style>
