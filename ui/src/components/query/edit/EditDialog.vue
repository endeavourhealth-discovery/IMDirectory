<template>
  {{ match }}
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

onMounted(() => {
  if (isObjectHasKeys(props.match)) editMatch.value = { ...props.match };
});
</script>

<style scoped></style>
