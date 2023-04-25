<template>
  <div class="query-display-container">
    <Tree :value="nodes" :expanded-keys="expandedKeys">
      <template #default="{ node }: any">
        <div v-html="node.display"></div>
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { EntityService, QueryService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { buildTextQuery } from "@im-library/helpers/TextQueryBuilder";
import { DisplayQuery } from "@im-library/interfaces";
import { Query } from "@im-library/interfaces/AutoGen";
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
  const labeledQuery = await QueryService.getLabeledQuery(JSON.parse(responseEntity[IM.DEFINITION]));
  return labeledQuery;
}

function getNodes(query: Query) {
  return buildTextQuery(query);
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

function expandNode(node: DisplayQuery) {
  const hasExpandToSeeMore = node.label ? (node.label as string).includes("(expand to see more...)") : false;
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
