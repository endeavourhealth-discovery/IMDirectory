<template>
  <div class="add-base-container">
    <QueryNavTree :base-type="baseType" :editMatch="editMatch" />
    <div class="footer">
      <Button label="Discard" severity="secondary" @click="discard" text />
      <Button label="Save" @click="save" text />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import { Match } from "@im-library/interfaces/AutoGen";
import QueryNavTree from "../QueryNavTree.vue";
import _ from "lodash";

interface Props {
  baseType: string;
  match?: Match;
}

const props = defineProps<Props>();
const emit = defineEmits({ onClose: () => true, onAddProperty: (_payload: Match) => true });
const editMatch: Ref<Match> = ref({ where: [] } as Match);

onMounted(() => {
  if (props.match) editMatch.value = _.cloneDeep(props.match);
});

async function save() {
  emit("onAddProperty", editMatch.value);
}

function discard() {
  emit("onClose");
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: end;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.add-base-container {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.query-nav-tree {
  height: 70vh;
}
</style>
