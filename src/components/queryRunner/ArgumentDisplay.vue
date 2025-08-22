<template>
  <DataTable :value="argumentList" :lazy="true" :loading="loading">
    <Column field="parameter" header="Parameter">
      <template #body="{ data }">{{ formatArgumentDisplayName(data) }}</template>
    </Column>
    <Column field="parameter" header="Raw Parameter"></Column>
    <Column v-if="includeIri" field="referenceIri.iri" header="Reference Iri"></Column>
    <Column field="valueData" header="Value">
      <template #body="{ data }">
        <div class="argument-selector-content">
          <div v-if="data.dataType && [XSD.STRING].includes(data.dataType?.iri)">
            <InputText type="text" v-model="data.valueData" data-testid="property-value-input" />
          </div>
          <div v-if="data.dataType && [XSD.BOOLEAN].includes(data.dataType.iri)">
            <Select :options="booleanOptions" optionLabel="name" optionValue="value" v-model="data.valueData" />
          </div>
          <div v-if="showFooterButtons && data.dataType && [IM.DATE, IM.DATE_TIME, IM.TIME].includes(data.dataType.iri)">
            <label>Select date:</label>
            <DatePicker
              v-model="data.valueData"
              :showTime="IM.DATE_TIME === data.dataType.iri"
              :timeOnly="IM.TIME === data.dataType.iri"
              dateFormat="yy/mm/dd"
            />
          </div>
          <div v-else>{{ data.valueData }}</div>
        </div>
      </template>
    </Column>
  </DataTable>
  <div v-if="showFooterButtons" class="button-container">
    <Button label="Back" @click="resetArguments()" severity="secondary" />
    <Button label="Confirm" @click="confirmArguments" :loading="submitting" :disabled="!allArgumentsValid" />
  </div>
</template>

<script setup lang="ts">
import { Argument, ArgumentReference } from "@/interfaces/AutoGen";
import { computed, ComputedRef, onMounted, ref, watch } from "vue";
import Column from "primevue/column";
import { IM, XSD } from "@/vocabulary";
import { cloneDeep } from "lodash-es";

interface Props {
  arguments: ArgumentReference[] | undefined;
  runOnConfirm?: boolean;
  showFooterButtons: boolean;
}

interface ArgumentSelection extends ArgumentReference {
  valueData?: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  argumentsCompleted: [payload: Argument[], boolean];
  hideDialog: [payload: boolean];
}>();

const showDialog = defineModel<boolean>("showDialog");
const allArgumentsValid: ComputedRef<boolean> = computed(() => argumentList.value!.every(as => as.valueData));

const loading = ref(false);
const includeIri = ref(false);
const argumentList = ref<ArgumentSelection[] | undefined>([]);
const submitting = ref(false);
const booleanOptions = ref([
  { name: "true", value: true },
  { name: "false", value: false }
]);

onMounted(() => {
  argumentList.value = cloneDeep(props.arguments);
});

watch(
  () => cloneDeep(props.arguments),
  newValue => {
    argumentList.value = newValue;
    if (argumentList.value) {
      for (let arg of argumentList.value) {
        if (arg.referenceIri) {
          includeIri.value = true;
          break;
        }
        includeIri.value = false;
      }
    }
  }
);

function formatArgumentDisplayName(arg: Argument) {
  const result = arg
    .parameter!.replace("$", "")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function resetArguments() {
  showDialog.value = false;
  argumentList.value = cloneDeep(props.arguments);
  emit("hideDialog", false);
}

function confirmArguments() {
  submitting.value = true;
  if (allArgumentsValid.value) {
    const completedArguments: Argument[] = [];
    if (argumentList.value) {
      for (const argSelect of argumentList.value) {
        const newArg: Argument = { parameter: argSelect.parameter };
        switch (argSelect.dataType?.iri) {
          case XSD.STRING:
          case XSD.BOOLEAN:
          case IM.DATE:
          case IM.DATE_TIME:
          case IM.TIME:
            newArg.valueData = argSelect.valueData;
            newArg.dataType = argSelect.dataType;
            break;
        }
        completedArguments.push(newArg);
      }
    }
    emit("argumentsCompleted", completedArguments, props.runOnConfirm);
    submitting.value = false;
  }
}
</script>

<style scoped>
.button-container {
  display: flex;
  justify-content: flex-end;
}
</style>
