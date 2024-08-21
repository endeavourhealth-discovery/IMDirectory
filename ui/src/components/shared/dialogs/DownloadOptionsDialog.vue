<template>
  <Dialog :visible="showDialog" :modal="true" :closable="false" :close-on-escape="false" header="Please select download options">
    <div class="flex-container content-container">
      <div class="item-container">
        <span class="text">Format</span>
        <div class="card flex justify-center">
          <div class="flex flex-col gap-4">
            <div v-for="format of formatOptions" :key="format.key" class="flex items-center">
              <div v-if="format.include" class="format-item">
                <RadioButton v-model="selectedFormat" :inputId="format.key" name="pizza" :value="format.name" />
                <label :for="format.key" class="ml-2">{{ format.name }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="contentOptions.some(o => o.include)" class="item-container">
        <span class="text">Content</span>
        <div class="card flex justify-content-left">
          <div class="flex flex-col gap-4">
            <div v-for="content of contentOptions" :key="content.key" class="flex items-center check-container">
              <div v-if="content.include" class="content-item">
                <Checkbox v-model="selectedContents" :inputId="content.key" name="content" :value="content.name" :disabled="content.disabled" />
                <label :for="content.key">{{ content.name }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!(coreSelected || showSubsets) && !displayLegacyOptions" class="item-container">
        <div class="toggle-container" v-if="!coreSelected || !showSubsets">
          <span class="text">Show Subset</span>
          <div class="card flex justify-content-left" style="margin: 10px 0 0 0">
            <ToggleButton v-model="checked" class="w-36 h-8" />
          </div>
        </div>
        <div class="toggle-container" v-if="!displayLegacyOptions">
          <span class="text">Legacy</span>
          <div class="card flex justify-content-left" style="margin: 10px 0 0 0">
            <ToggleButton v-model="checkedLegacy" onLabel="Own Row" offLabel="Inline Column" class="w-36 h-8" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex-container content-container" v-if="displayLegacyOptions">
      <div class="p-field">
        <div class="p-inputgroup">
          <FloatLabel>
            <MultiSelect id="scheme" v-model="selectedSchemes" :options="schemesOptions" optionLabel="name" display="chip" />
            <label for="scheme">Filter Legacy Scheme</label>
          </FloatLabel>
        </div>
      </div>
    </div>
    <div class="flex-container content-container" style="justify-content: flex-end">
      <div class="card flex justify-center" style="gap: 1rem">
        <Button
          v-if="selectedFormat === 'IMv1'"
          label="Download"
          @click="
            emit('downloadIMV1', generateSettings());
            emit('closeDialog');
          "
          :disabled="!isOptionsSelected"
        />
        <Button
          v-else
          label="Download"
          @click="
            emit('download', generateSettings());
            emit('closeDialog');
          "
          :disabled="!isOptionsSelected && contentOptions.some(o => o.include)"
        />
        <Button label="Cancel" severity="danger" @click="emit('closeDialog')" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { useFilterStore } from "@/stores/filterStore";
import { DownloadSettings } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, SNOMED } from "@im-library/vocabulary";
import { computed } from "vue";
import { Ref, ref, watch } from "vue";

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
  showDefinition?: boolean;
  showCore?: boolean;
  showLegacy?: boolean;
  showIm1Id?: boolean;
  showSubsets?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  showCsv: true,
  showTsv: true,
  showXlsx: true,
  showIm1: true,
  showDefinition: true,
  showCore: true,
  showLegacy: true,
  showIm1Id: true,
  showSubsets: true
});

const emit = defineEmits({
  closeDialog: () => true,
  download: (_payload: DownloadSettings) => true,
  downloadIMV1: (_payload: DownloadSettings) => true
});

const filterStore = useFilterStore();
const filterOptions = computed(() => filterStore.filterOptions);

const formatOptions: Ref<DownloadOption[]> = ref([
  { key: "csv", name: "csv", disabled: false, include: props.showCsv },
  { key: "tsv", name: "tsv", disabled: false, include: props.showTsv },
  { key: "xls", name: "xlsx", disabled: false, include: props.showXlsx },
  { key: "im1", name: "IMv1", disabled: false, include: props.showIm1 }
]);
const contentOptions: Ref<DownloadOption[]> = ref([
  { key: "definition", name: "Definition", disabled: false, include: props.showDefinition },
  { key: "core", name: "Core", disabled: false, include: props.showCore },
  { key: "legacy", name: "Legacy", disabled: false, include: props.showLegacy },
  { key: "im1Id", name: "IM1Id", disabled: false, include: props.showIm1Id }
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

watch(selectedContents, () => {
  if (contentOptions.value.length !== 0 && selectedFormat.value !== "IMv1") {
    contentOptions.value[1].disabled = !!(selectedContents.value.includes("Definition") && selectedFormat.value !== "xlsx");
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
      contentOptions.value.forEach((f: any) => (f.disable = true));
    } else {
      contentOptions.value.forEach((f: any) => (f.disable = false));
    }
  } else {
    contentOptions.value.forEach((f: any) => (f.disable = true));
  }
});

function isCoreSelected() {
  if (selectedContents.value.includes("Core")) {
    if (selectedFormat.value !== "xlsx") {
      contentOptions.value[0].disabled = true;
    }
    contentOptions.value[2].disabled = false;
    contentOptions.value[3].disabled = false;
    coreSelected.value = true;
  } else {
    contentOptions.value[0].disabled = false;
    contentOptions.value[2].disabled = true;
    contentOptions.value[3].disabled = true;
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
