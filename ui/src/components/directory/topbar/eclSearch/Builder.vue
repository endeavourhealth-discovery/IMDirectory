<template>
  <Dialog
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
  >
    <template #header>
      <h3>ECL Builder:</h3>
    </template>
    <div id="builder-string-container">
      <div id="query-builder-container">
        <div id="query-build">
          <bool-group :value="ecl" style="width: 100%; margin: 0"></bool-group>
        </div>
        <small style="color: red" v-if="!ecl.items || ecl.items.length == 0">*Move pointer over panel above to add concepts, refinements and groups.</small>
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
      <Button label="Cancel" icon="pi pi-times" class="p-button-secondary" @click="closeBuilderDialog" />
      <Button label="OK" icon="pi pi-check" class="p-button-primary" @click="submit" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Logic from "./builder/Logic.vue";
import RefinementGroup from "./builder/RefinementGroup.vue";
import FocusConcept from "./builder/FocusConcept.vue";
import BoolGroup from "./builder/BoolGroup.vue";
import Concept from "@/components/directory/topbar/eclSearch/builder/Concept.vue";
import RefinementX from "@/components/directory/topbar/eclSearch/builder/RefinementX.vue";
import SetService from "@/services/SetService";

export default defineComponent({
  components: { Logic, RefinementGroup, FocusConcept, BoolGroup, Concept, RefinementX }
});
</script>

<script setup lang="ts">
import { Ref, ref, watch, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import _ from "lodash";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";

const props = defineProps({
  showDialog: Boolean,
  eclString: { type: String, required: false }
});

const emit = defineEmits({
  ECLSubmitted: (_payload: string) => true,
  closeDialog: () => true
});

const toast = useToast();

const ecl: Ref<any> = ref({ type: "BoolGroup", operator: "AND" });
const includeTerms = ref(true);

watch(
  () => [_.cloneDeep(ecl.value), includeTerms.value],
  newValue => {
    newGenerateQueryString();
  }
);

const queryString = ref("");

function submit(): void {
  emit("ECLSubmitted", queryString.value);
}

function closeBuilderDialog(): void {
  emit("closeDialog");
}

function newGenerateQueryString() {
  queryString.value = getBoolGroupECL(ecl.value);
}

function getBoolGroupECL(clause: any) {
  if (clause.items && clause.items.length > 0) return clause.items.map((i: any) => getClauseECL(i)).join("\n" + clause.operator + " ");
  else return "";
}

function getClauseECL(clause: any) {
  if (clause.type === "BoolGroup" && clause.items) return "(" + getBoolGroupECL(clause) + ")";
  else if (clause.type === "Concept") return getConceptECL(clause);
  else if (clause.type === "RefinementX") return getRefinementECL(clause);
  else return "[???]";
}

function getConceptECL(clause: any) {
  let result = getCodeTermECL(clause);

  if (clause.items && clause.items.length > 0) {
    result += " : ";
    result += getBoolGroupECL(clause);
  }

  return result;
}

function getCodeTermECL(clause: any) {
  let result = clause.descendants;

  if (clause.concept && clause.concept.code) {
    result += clause.concept.code;
    if (includeTerms.value && clause.concept.name) result += " | " + clause.concept.name + " | ";
  } else result += "[UNKNOWN CONCEPT]";

  return result;
}

function getRefinementECL(clause: any) {
  let result = getCodeTermECL(clause.property);

  result += " " + clause.operator + " ";

  result += getCodeTermECL(clause.value);

  return result;
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
}

#query-build {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;
  gap: 1rem;
  flex: 1 1 auto;
  overflow: auto;
  font-size: 12px;
}

#build-string-container {
  width: 100%;
  flex: 0 1 auto;
  display: flex;
  flex-flow: column nowrap;
}

.output-string {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
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
