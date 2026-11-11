<template>
  <Dialog
    id="members-comparison-dialog"
    :auto-z-index="true"
    :closable="false"
    :contentStyle="{ flexGrow: '100', display: 'flex', flexDirection: 'column' }"
    :maximizable="true"
    :modal="true"
    :style="{ minWidth: '90vw', minHeight: '90vh', display: 'flex', flexFlow: 'column nowrap' }"
    :visible="true"
  >
    <template #header>
      <strong class="comparison-title">Compare members</strong>
    </template>

    <div v-if="loading" class="comparison-loading"><ProgressSpinner /></div>
    <div v-else class="comparison-content">
      <div class="comparison-toolbar">
        <div class="comparison-summary" data-testid="members-comparison-summary">
          <Tag :value="`${comparison.added} added`" icon="fa-solid fa-plus" severity="success" />
          <Tag :value="`${comparison.removed} removed`" icon="fa-solid fa-minus" severity="danger" />
          <Tag :value="`${comparison.unchanged} unchanged`" severity="secondary" />
        </div>
        <div class="comparison-filters">
          <InputText v-model="filterText" data-testid="members-comparison-filter" placeholder="Filter by name or code" />
          <SelectButton v-model="viewMode" :allowEmpty="false" :options="viewModes" optionLabel="label" optionValue="value" />
        </div>
      </div>

      <Message v-if="truncated" :closable="false" severity="warn">
        Not all members were loaded, so some members may be wrongly shown as added or removed.
      </Message>
      <Message v-else-if="!comparison.added && !comparison.removed" :closable="false" severity="info">
        The new definition generates the same members as those currently saved.
      </Message>

      <div class="comparison-panels">
        <div v-for="panel in panels" :key="panel.key" :data-testid="`members-comparison-${panel.key}`" class="comparison-panel">
          <div class="panel-header">
            <span class="panel-title">{{ panel.title }}</span>
            <span class="panel-count">{{ panel.total }} members</span>
          </div>
          <DataTable
            :rowClass="rowClass"
            :value="panel.members"
            :virtualScrollerOptions="{ itemSize: 38 }"
            class="p-datatable-sm"
            dataKey="iri"
            scrollHeight="60vh"
            scrollable
            showGridlines
          >
            <template #empty>{{ panel.emptyMessage }}</template>
            <Column header="" style="width: 2.5rem">
              <template #body="{ data }: { data: ComparedMember }">
                <i v-if="data.change === 'added'" v-tooltip="'Added by the new definition'" class="fa-solid fa-plus" />
                <i v-else-if="data.change === 'removed'" v-tooltip="'Removed by the new definition'" class="fa-solid fa-minus" />
              </template>
            </Column>
            <Column field="name" header="Name">
              <template #body="{ data }: { data: ComparedMember }">{{ data.name ?? data.iri }}</template>
            </Column>
            <Column field="code" header="Code" style="width: 20%" />
            <Column header="Status" style="width: 15%">
              <template #body="{ data }: { data: ComparedMember }">{{ data.status?.name ?? "" }}</template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <template #footer>
      <Button data-testid="close-members-comparison-button" icon="fa-solid fa-xmark" label="Close" severity="secondary" @click="emit('closeDialog')" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import type { SearchResponse } from "@endeavour/vue-library/models";

import { type ComparedMember, compareMembers, isTruncated } from "@/helpers/MemberComparison";

interface Props {
  /** Members currently saved against the set */
  currentMembers?: SearchResponse;
  /** Members generated from the new definition */
  newMembers?: SearchResponse;
  loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  closeDialog: [];
}>();

type ViewMode = "all" | "changes";
const viewModes: { label: string; value: ViewMode }[] = [
  { label: "All members", value: "all" },
  { label: "Changes only", value: "changes" }
];
const viewMode = ref<ViewMode>("all");
const filterText = ref("");

const comparison = computed(() => compareMembers(props.currentMembers, props.newMembers));
const truncated = computed(() => isTruncated(props.currentMembers) || isTruncated(props.newMembers));

const panels = computed(() => [
  {
    key: "current",
    title: "Current saved members",
    total: comparison.value.current.length,
    members: applyFilters(comparison.value.current),
    emptyMessage: emptyMessage(comparison.value.current.length, "No saved members.", "No members are removed by the new definition.")
  },
  {
    key: "new",
    title: "New definition members",
    total: comparison.value.updated.length,
    members: applyFilters(comparison.value.updated),
    emptyMessage: emptyMessage(comparison.value.updated.length, "The new definition generates no members.", "No members are added by the new definition.")
  }
]);

function applyFilters(members: ComparedMember[]): ComparedMember[] {
  const text = filterText.value.trim().toLowerCase();
  return members.filter(member => {
    if (viewMode.value === "changes" && member.change === "unchanged") return false;
    if (!text) return true;
    return member.name?.toLowerCase().includes(text) || member.code?.toLowerCase().includes(text);
  });
}

function emptyMessage(total: number, noMembers: string, noChanges: string): string {
  if (!total) return noMembers;
  if (filterText.value.trim()) return "No members match the filter.";
  return noChanges;
}

function rowClass(data: ComparedMember): string {
  return "member-" + data.change;
}
</script>

<style scoped>
.comparison-title {
  font-size: larger;
}

.comparison-loading {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.comparison-content {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 0.75rem;
  min-height: 0;
}

.comparison-toolbar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.comparison-summary,
.comparison-filters {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 0.5rem;
}

.comparison-panels {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
  min-height: 0;
}

.comparison-panel {
  display: flex;
  flex-flow: column nowrap;
  min-width: 0;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-content-border-radius);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.5rem 0.75rem;
  background: var(--p-content-hover-background);
}

.panel-title {
  font-weight: 600;
}

.panel-count {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.comparison-panel:deep(td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}

.comparison-panel:deep(tr.member-added > td) {
  background: color-mix(in srgb, var(--p-green-500) 15%, transparent);
}

.comparison-panel:deep(tr.member-added .fa-plus) {
  color: var(--p-green-600);
}

.comparison-panel:deep(tr.member-removed > td) {
  background: color-mix(in srgb, var(--p-red-500) 15%, transparent);
}

.comparison-panel:deep(tr.member-removed .fa-minus) {
  color: var(--p-red-600);
}
</style>
