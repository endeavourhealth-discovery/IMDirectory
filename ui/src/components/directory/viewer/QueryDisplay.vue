<template>
  <div class="query-display-container">
    <Tree :value="nodes" :expanded-keys="expandedKeys">
      <template #default="{ node }">
        {{ node.label }}
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { buildDisplayQuery } from "@im-library/helpers/DisplayQueryBuilder";
import { Query } from "@im-library/models/AutoGen";
import { IM } from "@im-library/vocabulary";
import { onMounted, watch, Ref, ref } from "vue";
const props = defineProps({
  conceptIri: { type: String, required: true }
});
const expandedKeys: Ref<any> = ref({});
const definition: Ref<any> = ref();
const nodes: Ref<any[]> = ref([]);

watch(
  () => props.conceptIri,
  async newValue => {
    init();
  }
);

onMounted(async () => {
  init();
});

async function init() {
  definition.value = await getDefinition(props.conceptIri);
  nodes.value = getNodes(definition.value);
  expandAll();
}

async function getDefinition(iri: string) {
  const responseEntity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
  if (!isObjectHasKeys(responseEntity, [IM.DEFINITION])) return "";
  return JSON.parse(responseEntity[IM.DEFINITION]);
}

function getNodes(query: Query) {
  return buildDisplayQuery(query);
}

function expandAll() {
  for (let node of nodes.value) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
}

function collapseAll() {
  expandedKeys.value = {};
}

function expandNode(node: any) {
  const hasExpandToSeeMore = (node.label as string).includes("(expand to see more...)");
  if (node.children && node.children.length && !hasExpandToSeeMore) {
    expandedKeys.value[node.key] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
}
</script>

<style scoped>
.query-display-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}
</style>
