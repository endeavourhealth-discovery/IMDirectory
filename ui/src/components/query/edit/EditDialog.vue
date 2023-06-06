<template>
  <div>
    <Splitter class="query-splitter">
      <SplitterPanel :size="30" :minSize="10" style="overflow: auto" data-testid="splitter-left">
        <QueryNavTree :base-entity-iri="baseEntityIri" @add-rule="addRule" />
      </SplitterPanel>
      <SplitterPanel :size="70" :minSize="10" style="overflow: auto" data-testid="splitter-right"> Edit Rules </SplitterPanel>
    </Splitter>
    <div class="footer">
      <Button label="Discard" severity="secondary" @click="discard" text />
      <Button label="Save" @click="save" text />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { TreeNode } from "primevue/tree";
import { Ref, onMounted, ref } from "vue";
import QueryNavTree from "../QueryNavTree.vue";
interface Props {
  baseEntityIri?: string;
  match?: Match;
}
const props = defineProps<Props>();
const editMatch: Ref<Match> = ref({} as Match);

const emit = defineEmits({ onClose: () => true });

onMounted(() => {
  if (isObjectHasKeys(props.match)) editMatch.value = { ...props.match };
});

function addRule(treeNode: TreeNode) {
  //   const match = buildMatchFromTreeNode(treeNode as any);
  //   if (!isArrayHasLength(query.value.match)) query.value.match = [];
  //   query.value.match!.push(match);
}

function removeRule(treeNode: TreeNode) {}

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
