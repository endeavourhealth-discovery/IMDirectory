<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="'Keep as variable'"
    :style="{ minWidth: '20vw', minHeight: '20vh', backgroundColor: 'var(--surface-section)' }"
  >
    <InputText type="text" v-model="variable" />

    <template #footer>
      <Button label="Discard" severity="secondary" @click="visible = false" text />
      <Button label="Save" @click="save" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { cloneDeep } from "lodash";
import { Ref, onMounted, ref, watch } from "vue";
const emit = defineEmits({ "update:showDialog": payload => typeof payload === "boolean", addVariable: (previousValue: string, newValue: string) => true });
interface Props {
  showDialog: boolean;
  match: Match;
}

const props = defineProps<Props>();
const visible: Ref<boolean> = ref(false);
const variable: Ref<string> = ref("");

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
  () => {
    if (isObjectHasKeys(props.match, ["variable"])) variable.value = props.match.variable!;
  }
);

onMounted(() => {
  if (isObjectHasKeys(props.match, ["variable"])) variable.value = props.match.variable!;
});

function save() {
  emit("addVariable", props.match.variable ?? "", variable.value);
  variable.value = "";
  visible.value = false;
}
</script>

<style scoped></style>
