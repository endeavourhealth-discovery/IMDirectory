<template>
  <div>
    <Splitter class="query-splitter">
      <SplitterPanel :size="30" :minSize="10" style="overflow: auto" data-testid="splitter-left">
        <QueryNavTree :base-entity-iri="baseEntityIri" @add-property="addProperty" @remove-property="removeProperty" />
      </SplitterPanel>
      <SplitterPanel :size="70" :minSize="10" style="overflow: auto" data-testid="splitter-right">
        <div v-for="editMatch in editMatches">
          <Divider />
          <EditMatch :data-model-iri="baseEntityIri" :property-iri="editMatch.where?.[0]['@id']" :edit-match="editMatch" />
          <Divider />
        </div>
      </SplitterPanel>
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
import { buildMatchFromTreeNode } from "@im-library/helpers";
import EditMatch from "./EditMatch.vue";
interface Props {
  baseEntityIri?: string;
  match?: Match;
}
const props = defineProps<Props>();
const editMatches: Ref<Match[]> = ref([]);

const emit = defineEmits({ onClose: () => true });

onMounted(() => {
  if (isObjectHasKeys(props.match)) editMatches.value = [{ ...props.match }];
});

function addProperty(treeNode: TreeNode) {
  editMatches.value.push(buildMatchFromTreeNode(treeNode as any));
}

function removeProperty(treeNode: TreeNode) {
  const removeIndex = editMatches.value.findIndex(editMatch => (editMatch as any).key === treeNode.key);
  if (removeIndex != -1) editMatches.value.splice(removeIndex, 1);
}

function save() {
  if (isObjectHasKeys(props.match)) {
    for (const key of Object.keys(props.match!)) {
      delete (props.match as any)[key];
    }
  }

  if (editMatches.value.length === 1)
    for (const key of Object.keys(editMatches.value[0])) {
      (props.match as any)[key] = (editMatches.value[0] as any)[key];
    }

  emit("onClose");
}

function discard() {
  editMatches.value = [];
  emit("onClose");
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: end;
}
</style>
