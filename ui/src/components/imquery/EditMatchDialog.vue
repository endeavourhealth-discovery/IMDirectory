<template>
  <div>
    <Dialog
      v-model:visible="visible"
      header="Edit feature"
      :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
    >
      <!-- TODO: <EditMatch /> -->
      <div>{{ editMatch }}</div>
      <template #footer>
        <div class="button-footer">
          <Button label="Cancel" text @click="visible = false" />
          <Button label="Save" autofocus @click="visible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { cloneDeep } from "lodash";
import { Ref, onMounted, ref, watch } from "vue";
interface Props {
  showDialog: boolean;
  match: Match | undefined;
}

const props = defineProps<Props>();

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean"
});

const editMatch: Ref<Match | undefined> = ref();
const visible = ref(false);

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
  () => setEditMatch()
);

onMounted(() => {
  setEditMatch();
});

function setEditMatch() {
  if (isObjectHasKeys(props.match)) editMatch.value = cloneDeep(props.match);
}
</script>

<style scoped></style>
