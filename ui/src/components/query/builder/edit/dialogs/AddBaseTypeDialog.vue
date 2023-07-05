<template>
  <Dialog v-model:visible="visible" modal maximizable :header="'Add base type'" :style="{ width: '60vw' }">
    <BaseEntityTree class="query-nav-tree" @add-base-entity="addBaseEntity" />
    <template #footer>
      <Button label="Discard" severity="secondary" @click="visible = false" text />
      <Button label="Save" @click="save" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from "vue";

import { Match, Query } from "@im-library/interfaces/AutoGen";
import { isQuery } from "@im-library/helpers/ConceptTypeMethods";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import { TreeNode } from "primevue/tree";
import BaseEntityTree from "../BaseEntityTree.vue";

interface Props {
  query: Query;
  showDialog: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits({ onClose: () => true, "update:showDialog": payload => typeof payload === "boolean" });
const visible: Ref<boolean> = ref(false);

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

const baseNode: Ref<TreeNode> = ref({} as TreeNode);

async function save() {
  if (isObjectHasKeys(baseNode.value)) {
    props.query.type = baseNode.value.data;
  }
  visible.value = false;
}

function addBaseEntity(selected: TreeNode) {
  baseNode.value = selected;
}

async function getMatchFromNode(baseNode: TreeNode) {
  let baseEntityMatch = {} as Match;
  if (isQuery(baseNode.conceptTypes)) {
    const entity = await EntityService.getPartialEntity(baseNode.data, [IM.DEFINITION]);
    if (!isObjectHasKeys(entity, [IM.DEFINITION])) baseEntityMatch = { "@type": IM.NAMESPACE + "Entity" } as Match;
    else {
      const definition = entity[IM.DEFINITION] as Query;
      if (isObjectHasKeys(definition.match?.[0], ["@type"])) baseEntityMatch = { "@type": definition.match?.[0]["@type"] } as Match;
    }
  } else {
    baseEntityMatch = { "@type": baseNode.data, name: baseNode.label } as Match;
  }

  return baseEntityMatch;
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
