<template>
  <div class="add-base-container">
    <QueryNavTree :base-type="query.type!" :editMatch="editMatch" />
    <div class="footer">
      <Button label="Discard" severity="secondary" @click="discard" text />
      <Button label="Save" @click="save" text />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import BaseEntityTree from "../BaseEntityTree.vue";
import { Match, Query } from "@im-library/interfaces/AutoGen";
import { isQuery } from "@im-library/helpers/ConceptTypeMethods";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import { TreeNode } from "primevue/tree";
import QueryNavTree from "../QueryNavTree.vue";
import _ from "lodash";

interface Props {
  query: Query;
  match?: Match;
}

const props = defineProps<Props>();
const emit = defineEmits({ onClose: () => true });
const baseNode: Ref<TreeNode> = ref({} as TreeNode);
const editMatch: Ref<Match> = ref({} as Match);

onMounted(() => {
  if (props.match) editMatch.value = _.cloneDeep(props.match);
});

async function save() {
  emit("onClose");
}

function discard() {
  emit("onClose");
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
