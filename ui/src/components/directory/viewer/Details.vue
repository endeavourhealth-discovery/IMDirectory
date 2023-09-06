<template>
  <div class="details-container">
    <div style="margin-bottom: 1em">
      <Button class="details-tree-button" icon="pi pi-plus" label="Expand All" @click="expandAll" />
      <Button class="details-tree-button p-button-secondary" icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
    </div>
    <Tree
      v-model:selectionKeys="selectedKeys"
      selectionMode="single"
      :value="definition"
      :expandedKeys="expandedKeys"
      class="tree-container"
      @node-select="onSelect"
      @node-expand="onExpand"
    >
      <template #default="{ node }: any">
        <div v-if="tabPredicates.includes(node.key!)">
          <a class="clickable" @click="openTab(node.key!)">{{ node.label }}</a>
        </div>

        <div v-else-if="node.data">
          {{ node.label + " - " }}<IMViewerLink :iri="node.data['@id']!" :label="node.data.name" @navigateTo="(iri:string) => emit('navigateTo', iri)" />
        </div>
        <div v-else>{{ node.label }}</div>
      </template>
      <template #string="{ node }: any">{{ node.value }}</template>
      <template #iri="{ node }: any"> {{ node.label }} <IMViewerLink :iri="node.value" @navigateTo="(iri:string) => emit('navigateTo', iri)" /></template>
      <template #boolean="{ node }: any">{{ node.label }}</template>
      <template #link="{ node }: any">
        <IMViewerLink :iri="node.key!" :label="node.label" @navigateTo="(iri:string) => emit('navigateTo', iri)" />
      </template>
      <template #loadMore="{ node }: any">
        <b>{{ node.label }}...</b>
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { TreeNode } from "primevue/tree";
import { onMounted, Ref, ref, watch } from "vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { IM, SHACL } from "@im-library/vocabulary";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";

interface Props {
  entityIri: string;
}
const props = defineProps<Props>();

const emit = defineEmits({ onOpenTab: (payload: string) => payload, navigateTo: (_payload: string) => true });

const tabPredicates = [SHACL.PROPERTY, IM.DEFINITION];
const OS: Ref<any> = ref();
const definition: Ref<any> = ref();
const expandedKeys: Ref<any> = ref({});
const selectedKeys: Ref<any> = ref({});
const predicatePageIndexMap: Ref<Map<string, { pageIndex: number; node: TreeNode }>> = ref(new Map<string, { pageIndex: number; node: TreeNode }>());

watch(
  () => props.entityIri,
  async () => getDefinition()
);

onMounted(async () => await getDefinition());

const expandAll = () => {
  for (let node of definition.value) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
};
const collapseAll = () => {
  expandedKeys.value = {};
};
const expandNode = (node: TreeNode) => {
  const hasExpandToSeeMore = (node.label as string).includes("(expand to see more...)");

  if (node.children && node.children.length && !hasExpandToSeeMore) {
    expandedKeys.value[node.key!] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
};

async function getDefinition() {
  definition.value = (await EntityService.getEntityDetailsDisplay(props.entityIri)).filter((c: any) => c.key !== IM.IS_A);
}

async function onSelect(node: TreeNode) {
  if (node.key === IM.NAMESPACE + "loadMore") {
    const pageIndexInfo = predicatePageIndexMap.value.get(node.data.predicate);
    if (pageIndexInfo) {
      const entityDetails = await EntityService.loadMoreDetailsDisplay(props.entityIri, node.data.predicate, ++pageIndexInfo.pageIndex, 10);
      const predicateValueNode = entityDetails.find(loadMoreNode => loadMoreNode.key === node.data.predicate);
      if (isArrayHasLength(predicateValueNode?.children)) {
        pageIndexInfo.node.children = pageIndexInfo.node.children?.concat(predicateValueNode!.children!);
        pageIndexInfo.node.children = pageIndexInfo.node.children?.filter(child => child.key !== node.key);
        pageIndexInfo.node.children?.push(node);
      } else {
        pageIndexInfo.node.children = pageIndexInfo.node.children?.filter(child => child.key !== node.key);
      }
    }
  }
}

async function onExpand(node: TreeNode) {
  const hasLoadMore = node.children?.some(child => child.key === IM.NAMESPACE + "loadMore");
  if (hasLoadMore) predicatePageIndexMap.value.set(node.key!, { pageIndex: 1, node: node });
}

function openTab(predicate: string) {
  emit("onOpenTab", predicate);
}
</script>

<style scoped>
.details-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
  background-color: var(--surface-a);
}
.tree-container {
  height: 100vh;
  overflow-y: auto;
}

.details-tree-button {
  margin-right: 0.5rem;
}
</style>
