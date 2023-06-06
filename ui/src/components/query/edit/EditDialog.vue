<template>
  <div>
    {{ match }}
    <div class="footer">
      <Button label="Discard" severity="secondary" @click="discard" text />
      <Button label="Save" @click="save" text />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";
interface Props {
  match?: Match;
}
const props = defineProps<Props>();
const editMatch: Ref<Match> = ref({} as Match);

const emit = defineEmits({ onClose: () => true });

onMounted(() => {
  if (isObjectHasKeys(props.match)) editMatch.value = { ...props.match };
});

function save() {
  if (isObjectHasKeys(props.match)) {
    for (const key of Object.keys(props.match!)) {
      delete (props.match as any)[key];
    }
  }

  for (const key of Object.keys(editMatch.value)) {
    (props.match as any)[key] = (editMatch.value as any)[key];
  }

  emit("onClose");
}

function discard() {
  editMatch.value = {};
  emit("onClose");
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: end;
}
</style>
