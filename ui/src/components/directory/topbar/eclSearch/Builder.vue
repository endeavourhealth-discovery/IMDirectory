<template>
  <Dialog
    v-if="!eclConversionError.error"
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
    id="ecl-builder-dialog"
    :contentStyle="{ flexGrow: '100', display: 'flex' }"
    :auto-z-index="false"
  >
    <template #header>
      <h3>ECL Builder:</h3>
    </template>
    <div id="builder-string-container">
      <div id="query-builder-container">
        <div id="query-build">
          <ProgressSpinner v-if="loading" />
          <BoolGroup v-else :value="build" :rootBool="true" />
        </div>
        <small style="color: red" v-if="(!build.items || build.items.length == 0) && !loading"
          >*Move pointer over panel above to add concepts, refinements and groups.</small
        >
      </div>
      <div id="build-string-container">
        <h3>Output:</h3>
        <div class="field-checkbox">
          <Checkbox inputId="includeTerms" v-model="includeTerms" :binary="true" />
          <label for="includeTerms">Include terms</label>
        </div>
        <div class="string-copy-container">
          <pre class="output-string">{{ queryString }}</pre>
          <Button
            icon="fa-solid fa-copy"
            v-tooltip.left="'Copy to clipboard'"
            v-clipboard:copy="copyToClipboard()"
            v-clipboard:success="onCopy"
            v-clipboard:error="onCopyError"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="fa-solid fa-xmark" severity="secondary" @click="closeBuilderDialog" />
      <Button label="OK" icon="fa-solid fa-check" class="p-button-primary" @click="submit" :disabled="!isValidEcl" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import BoolGroup from "./builder/BoolGroup.vue";
import Concept from "@/components/directory/topbar/eclSearch/builder/Concept.vue";
import Refinement from "@/components/directory/topbar/eclSearch/builder/Refinement.vue";

export default defineComponent({
  components: { BoolGroup, Concept, Refinement }
});
</script>

<script setup lang="ts">
import { Ref, ref, watch, onMounted, provide, readonly, defineComponent } from "vue";
import { useToast } from "primevue/usetoast";
import _ from "lodash";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import EclService from "@/services/EclService";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

interface Props {
  showDialog?: boolean;
  eclString?: string;
}
const props = defineProps<Props>();

const emit = defineEmits({
  eclSubmitted: (_payload: string) => true,
  eclConversionError: (_payload: { error: boolean; message: string }) => true,
  closeDialog: () => true
});

const toast = useToast();

const build: Ref<any> = ref({ type: "BoolGroup", operator: "OR" });
const includeTerms = ref(true);
const queryString = ref("");
const eclConversionError: Ref<{ error: boolean; message: string }> = ref({ error: false, message: "" });
const loading = ref(false);
const isValidEcl = ref(false);

watch(queryString, async () => {
  isValidEcl.value = await EclService.isValidECL(queryString.value);
});

provide("includeTerms", readonly(includeTerms));

onMounted(async () => {
  if (props.eclString) {
    await createBuildFromEclString(props.eclString);
  } else createDefaultBuild();
});

watch(
  () => props.eclString,
  newValue => {
    if (newValue) createBuildFromEclString(newValue);
    else createDefaultBuild();
  }
);

watch(
  () => _.cloneDeep(build.value),
  () => {
    generateQueryString();
  }
);

watch(includeTerms, () => generateQueryString());

function createDefaultBuild() {
  build.value = { type: "BoolGroup", conjunction: "OR" };
}

async function createBuildFromEclString(ecl: string) {
  try {
    loading.value = true;
    build.value = await EclService.getBuildFromEcl(ecl, true);
    eclConversionError.value = { error: false, message: "" };
  } catch (err: any) {
    createDefaultBuild();
    if (err?.response?.data) eclConversionError.value = { error: true, message: err.response.data.debugMessage };
    else eclConversionError.value = { error: true, message: err.message };
  }
  emit("eclConversionError", eclConversionError.value);
  loading.value = false;
}

function submit(): void {
  emit("eclSubmitted", queryString.value);
}

function closeBuilderDialog(): void {
  emit("closeDialog");
}

function generateQueryString() {
  if (isObjectHasKeys(build.value, ["ecl"])) {
    queryString.value = build.value.ecl;
  }
}

function copyToClipboard(): string {
  return queryString.value;
}

function onCopy(): void {
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Value copied to clipboard"));
}

function onCopyError(): void {
  toast.add(new ToastOptions(ToastSeverity.ERROR, "Failed to copy value to clipbard"));
}
</script>

<style scoped>
#builder-string-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
}

#query-builder-container {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

#query-build {
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

#query-build > .nested-div,
.nested-div-hover {
  min-width: calc(100% - 1rem);
}

#build-string-container {
  width: 100%;
  flex: 0 1 auto;
  display: flex;
  flex-flow: column nowrap;
}

.output-string {
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

.string-copy-container {
  height: 10rem;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
</style>
