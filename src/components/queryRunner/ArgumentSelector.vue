<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    maximizable
    header="Argument values"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    class="argument-selector"
    :pt="{ content: { class: 'flex-auto' } }"
  >
    <div class="argument-selector-content">
      <div class="argument" v-for="argument in argumentSelection">
        <TextWithLabel label="Parameter" :data="argument.parameter" />
        <TextWithLabel label="Reference iri" :data="argument.referenceIri?.iri" />
        <div v-if="argument.dataType && [XSD.STRING].includes(argument.dataType?.iri)">
          <InputText type="text" v-model="argument.value" data-testid="property-value-input" />
        </div>
        <div v-if="argument.dataType && [XSD.BOOLEAN].includes(argument.dataType.iri)">
          <Select :options="booleanOptions" optionLabel="name" optionValue="value" v-model="argument.value" />
        </div>
        <div v-if="argument.dataType && [IM.DATE, IM.DATE_TIME, IM.TIME].includes(argument.dataType.iri)">
          <label>Select date:</label>
          <DatePicker v-model="argument.value" :showTime="IM.DATE_TIME === argument.dataType.iri" :timeOnly="IM.TIME === argument.dataType.iri" />
        </div>
      </div>
    </div>
    <template #footer>
      <div>
        <Button label="Close" @click="showDialog = false" severity="secondary" />
        <Button label="Confirm" @click="confirmArguments" :loading="submitting" :disabled="!allArgumentsValid" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Argument, ArgumentReference } from "@/interfaces/AutoGen";
import TextWithLabel from "../shared/generics/TextWithLabel.vue";
import { IM, XSD } from "@/vocabulary";
import { computed, ComputedRef, onMounted, ref, Ref, watch } from "vue";
import { cloneDeep } from "lodash-es";

interface Props {
  missingArguments: ArgumentReference[];
}

interface ArgumentSelection extends ArgumentReference {
  value?: any;
}

const props = defineProps<Props>();

watch(
  () => cloneDeep(props.missingArguments),
  newValue => {
    argumentSelection.value = newValue;
  }
);

const emit = defineEmits<{
  argumentsCompleted: [payload: Argument[]];
}>();

const showDialog = defineModel<boolean>("showDialog");

const allArgumentsValid: ComputedRef<boolean> = computed(() => argumentSelection.value.every(as => as.value));

const loading = true;
const argumentSelection: Ref<ArgumentSelection[]> = ref([]);
const submitting = ref(false);

const booleanOptions = ref([
  { name: "true", value: true },
  { name: "false", value: false }
]);

onMounted(() => {
  argumentSelection.value = cloneDeep(props.missingArguments);
});

function confirmArguments() {
  submitting.value = true;
  if (allArgumentsValid.value) {
    const completedArguments: Argument[] = [];
    for (const argSelect of argumentSelection.value) {
      const newArg: Argument = { parameter: argSelect.parameter };
      switch (argSelect.dataType?.iri) {
        case XSD.STRING:
        case XSD.BOOLEAN:
        case IM.DATE:
        case IM.DATE_TIME:
        case IM.TIME:
          newArg.valueData = argSelect.value;
          break;
      }
      completedArguments.push(newArg);
    }
    emit("argumentsCompleted", completedArguments);
    submitting.value = false;
    showDialog.value = false;
  }
}
</script>

<style scoped>
.argument-selector-content {
  overflow: auto;
}

.argument {
  border: 1px solid var(--p-select-border-color);
  border-radius: 5px;
  display: flex;
  flex-flow: column nowrap;
}
</style>
