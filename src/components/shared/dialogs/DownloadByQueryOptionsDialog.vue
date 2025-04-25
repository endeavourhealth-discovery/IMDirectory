<template>
  <Dialog
    :closable="false"
    :close-on-escape="false"
    :modal="true"
    :visible="showDialog"
    header="Please select download options"
    data-testid="download-by-query-options-dialog"
  >
    <div class="flex-container content-container">
      <div class="item-container">
        <span class="text">Format</span>
        <div class="card flex justify-center">
          <div class="flex flex-col gap-4">
            <div v-for="format of formatOptions" :key="format.key" class="flex items-center">
              <div v-if="format.include" class="format-item">
                <RadioButton v-model="selectedFormat" :inputId="format.key" :value="format.name" name="pizza" />
                <label :for="format.key" class="ml-2">{{ format.name }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="contentOptions.some(o => o.include)" class="item-container">
        <span class="text">Content</span>
        <div class="card justify-content-left flex">
          <div class="flex flex-col gap-4">
            <div v-for="content of contentOptions" :key="content.key" class="check-container flex items-center">
              <div v-if="content.include" class="content-item">
                <Checkbox v-model="selectedContents" :disabled="content.disabled" :inputId="content.key" :value="content.name" name="content" />
                <label :for="content.key">{{ content.name }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!(coreSelected || showSubsets) && !displayLegacyOptions" class="item-container">
        <div v-if="!coreSelected || !showSubsets" class="toggle-container">
          <span class="text">Show Subset</span>
          <div class="card justify-content-left flex" style="margin: 10px 0 0 0">
            <ToggleButton v-model="checked" class="h-8 w-36" />
          </div>
        </div>
        <div v-if="!displayLegacyOptions" class="toggle-container">
          <span class="text">Legacy</span>
          <div class="card justify-content-left flex" style="margin: 10px 0 0 0">
            <ToggleButton v-model="checkedLegacy" class="h-8 w-36" offLabel="Inline Column" onLabel="Own Row" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="displayLegacyOptions" class="flex-container content-container">
      <div class="p-field">
        <div class="p-inputgroup">
          <FloatLabel>
            <MultiSelect id="scheme" v-model="selectedSchemes" :options="schemesOptions" display="chip" optionLabel="name" />
            <label for="scheme">Filter Legacy Scheme</label>
          </FloatLabel>
        </div>
      </div>
    </div>
    <div class="flex-container content-container" style="justify-content: flex-end">
      <div class="card flex justify-center" style="gap: 1rem">
        <Button
          v-if="selectedFormat === 'IMv1'"
          :disabled="!isOptionsSelected"
          label="Download"
          @click="
            emit('downloadIMV1', generateSettings());
            emit('closeDialog');
          "
        />
        <Button
          v-else
          :disabled="!isOptionsSelected && contentOptions.some(o => o.include)"
          label="Download"
          @click="
            emit('download', generateSettings());
            emit('closeDialog');
          "
        />
        <Button label="Cancel" severity="danger" @click="emit('closeDialog')" />
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { useFilterStore } from "@/stores/filterStore";
import { DownloadSettings } from "@/interfaces";
import { TTIriRef } from "@/interfaces/AutoGen";
import { IM, SNOMED } from "@/vocabulary";
import { computed, Ref, ref, watch } from "vue";

interface DownloadOption {
  key: string;
  name: string;
  disabled: boolean;
  include: boolean;
}

interface Props {
  showDialog: boolean;
  showCsv?: boolean;
  showTsv?: boolean;
  showXlsx?: boolean;
  showIm1?: boolean;
  showFhir?: boolean;
  showDefinition?: boolean;
  showCore?: boolean;
  showLegacy?: boolean;
  showIm1Id?: boolean;
  showSubsets?: boolean;
  showSubsumedBy?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showCsv: true,
  showTsv: true,
  showXlsx: true,
  showIm1: true,
  showFhir: true,
  showDefinition: true,
  showCore: true,
  showLegacy: true,
  showIm1Id: true,
  showSubsets: true,
  showSubsumedBy: true
});

const emit = defineEmits<{
  closeDialog: [];
  download: [downloadSettings: DownloadSettings];
  downloadIMV1: [downloadSettings: DownloadSettings];
}>();

const filterStore = useFilterStore();
const filterOptions = computed(() => filterStore.filterOptions);

const formatOptions: Ref<DownloadOption[]> = ref([
  { key: "csv", name: "csv", disabled: false, include: props.showCsv },
  { key: "tsv", name: "tsv", disabled: false, include: props.showTsv },
  { key: "xls", name: "xlsx", disabled: false, include: props.showXlsx },
  { key: "im1", name: "IMv1", disabled: false, include: props.showIm1 },
  { key: "fhir", name: "FHIR", disabled: false, include: props.showFhir }
]);
const contentOptions: Ref<DownloadOption[]> = ref([
  { key: "definition", name: "Definition", disabled: false, include: props.showDefinition },
  { key: "core", name: "Core", disabled: false, include: props.showCore },
  { key: "legacy", name: "Legacy", disabled: false, include: props.showLegacy },
  { key: "im1Id", name: "IM1Id", disabled: false, include: props.showIm1Id },
  { key: "subsumedBy", name: "Subsumed By", disabled: false, include: props.showSubsumedBy }
]);
const selectedContents: Ref<string[]> = ref([]);
const selectedFormat = ref("");
const displayLegacyOptions = ref(false);
const coreSelected = ref(false);
const isOptionsSelected = ref(false);
const checkedLegacy = ref(false);
const checked = ref(true);
const selectedSchemes: Ref<TTIriRef[]> = ref([]);
const schemesOptions = filterOptions.value.schemes.filter((c: any) => c["@id"] !== IM.NAMESPACE || c["@id"] !== SNOMED.NAMESPACE);

watch(
  () => props.showDefinition,
  newValue => {
    const objIndex = contentOptions.value.findIndex((obj: any) => obj.key == "definition");
    contentOptions.value[objIndex].include = newValue;
  }
);

watch(selectedContents, () => {
  if (contentOptions.value.length !== 0 && selectedFormat.value !== "IMv1") {
    contentOptions.value[1].disabled = selectedContents.value.includes("Definition") && selectedFormat.value !== "xlsx";
    isCoreSelected();
    isLegacySelected();
  }
  isOptionsSelected.value = (selectedContents.value.length !== 0 && selectedFormat.value != null) || selectedFormat.value === "IMv1";
});

watch(selectedFormat, () => {
  selectedContents.value = [];
  checked.value = true;
  checkedLegacy.value = false;
  if (selectedFormat.value) {
    if (selectedFormat.value === "IMv1") {
      contentOptions.value.forEach((f: any) => (f.disabled = true));
    } else {
      contentOptions.value.forEach((f: any) => (f.disabled = false));
    }
  } else {
    contentOptions.value.forEach((f: any) => (f.disabled = true));
  }
});

function isCoreSelected() {
  if (selectedContents.value.includes("Core")) {
    if (selectedFormat.value !== "xlsx") {
      contentOptions.value[0].disabled = true;
      contentOptions.value[2].disabled = true;
      contentOptions.value[4].disabled = true;
    }
    contentOptions.value[2].disabled = false;
    contentOptions.value[3].disabled = false;
    contentOptions.value[4].disabled = false;
    coreSelected.value = true;
  } else {
    contentOptions.value[0].disabled = selectedFormat.value === "FHIR";
    contentOptions.value[2].disabled = true;
    contentOptions.value[3].disabled = true;
    contentOptions.value[4].disabled = true;
    checked.value = true;
    checkedLegacy.value = false;
    selectedSchemes.value = [];
    coreSelected.value = false;
    const indexLegacy = selectedContents.value.indexOf("Legacy");
    if (indexLegacy !== -1) {
      selectedContents.value.splice(indexLegacy, 1);
    }
    const indexIM1Id = selectedContents.value.indexOf("IM1Id");
    if (indexIM1Id !== -1) {
      selectedContents.value.splice(indexIM1Id, 1);
    }
  }
}

function isLegacySelected() {
  if (selectedContents.value.includes("Legacy")) {
    displayLegacyOptions.value = true;
  } else {
    displayLegacyOptions.value = false;
    selectedSchemes.value = [];
    checkedLegacy.value = false;
  }
}

function generateSettings(): DownloadSettings {
  return {
    selectedContents: selectedContents.value,
    selectedFormat: selectedFormat.value,
    selectedSchemes: selectedSchemes.value,
    includeSubsets: checked.value,
    legacyInline: checkedLegacy.value
  };
}
</script>

<style scoped>
.flex-container {
  gap: 5rem;
  display: flex;
  flex-wrap: nowrap;
}

.item-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.check-container {
  gap: 1rem;
}

.content-item,
.format-item {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 0.5rem;
}

.content-container {
  padding: 20px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 1rem;
}

.toggle-container {
  padding: 0 0 30px 0;
  gap: 2rem;
}

.p-field {
  width: 400px;
}

.text {
  font-size: medium;
  padding: 0 0 1rem 0;
}
</style>
