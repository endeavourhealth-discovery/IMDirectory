<template>
  <div id="members-table-container">
    <DataTable
      :value="combinedMembers"
      showGridlines
      rowGroupMode="subheader"
      groupRowsBy="label"
      :expandableRowGroups="true"
      v-model:expandedRowGroups="expandedRowGroups"
      @rowgroupExpand="onRowGroupExpand"
      @rowgroupCollapse="onRowGroupCollapse"
      :scrollable="true"
      sortMode="single"
      sortField="label"
      :sortOrder="1"
      class="p-datatable-sm"
      scrollHeight="flex"
      :loading="loading"
    >
      <template #header>
        <div class="table-header-bar">
          <div class="checkboxes-container">
            <Button type="button" label="Download..." @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" :loading="downloading" />
            <Menu id="overlay_menu" ref="menu" :model="downloadMenu" :popup="true" />
          </div>
        </div>
      </template>
      <template #empty>
        No members found.
      </template>
      <template #loading>
        Loading data. Please wait...
      </template>
      <Column field="entity.name" header="Name">
        <template #body="slotProps">
          <div v-html="slotProps.data.entity.name" class="name-container"></div>
        </template>
      </Column>
      <template #groupheader="slotProps">
        <span v-for="subSet in subsets" :key="subSet">
          <span v-if="slotProps.data.label === subSet" class="group-header">
            {{ subSet }}
          </span>
        </span>
        <span v-if="slotProps.data.type === 'INCLUDED'" class="group-header">
          Included Members
        </span>
        <span v-if="slotProps.data.type === 'EXCLUDED'" class="group-header">
          Excluded Members
        </span>
        <span v-if="slotProps.data.type === 'EXPANDED'" class="group-header">
          Expanded Members
        </span>
        <span v-if="slotProps.data.type === 'COMPLEX'" class="group-header">
          Complex Members
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import EntityService from "@/services/EntityService";
import SetService from "@/services/SetService";
import LoggerService from "@/services/LoggerService";
import { ValueSetMember } from "@/models/members/ValueSetMember";
import { ExportValueSet } from "@/models/members/ExportValueSet";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { RDFS } from "@/vocabulary/RDFS";

export default defineComponent({
  name: "Members",
  props: {
    conceptIri: { type: String, required: true }
  },
  watch: {
    async conceptIri() {
      await this.getMembers();
    }
  },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    await this.getMembers();
    this.onResize();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      loading: false,
      downloading: false,
      members: {} as ExportValueSet,
      combinedMembers: [] as ValueSetMember[],
      selected: {} as ValueSetMember,
      subsets: [] as string[],
      expandedRowGroups: ["a_MemberIncluded", "b_MemberExcluded", "z_ComplexMember"],
      downloadMenu: [
        { label: "Definition", command: () => this.download(false) },
        { label: "Expanded (v2)", command: () => this.download(true) },
        { label: "Expanded (v1)", command: () => this.download(true, true) }
      ]
    };
  },
  methods: {
    toggle(event: any) {
      const x = this.$refs.menu as any;
      x.toggle(event);
    },

    onRowGroupExpand(): void {
      this.setTableWidth();
    },

    onRowGroupCollapse(): void {
      this.setTableWidth();
    },

    async getMembers(): Promise<void> {
      this.loading = true;
      this.expandedRowGroups = ["a_MemberIncluded", "b_MemberExcluded", "z_ComplexMember"];
      this.selected = {} as ValueSetMember;
      this.subsets = [];
      this.members = await EntityService.getEntityMembers(this.conceptIri, false, false, 2000, true);
      this.sortMembers();
      this.combinedMembers = this.members.members;
      this.setSubsets();
      this.setTableWidth();
      this.loading = false;
    },

    setSubsets(): void {
      this.combinedMembers.forEach((member: ValueSetMember) => {
        if (!this.subsets.some(e => e === member.label)) {
          if (member.type === "SUBSET") {
            this.subsets.push(member.label);
          }
        }
      });
    },

    async download(expanded: boolean, v1 = false): Promise<void> {
      this.downloading = true;
      try {
        this.$toast.add(LoggerService.success("Download will begin shortly"));
        const result = expanded ? (await EntityService.getFullExportSet(this.conceptIri)).data : await SetService.download(this.conceptIri, expanded, v1);
        const label: string = ((await EntityService.getPartialEntity(this.conceptIri, [RDFS.LABEL])) as any)[RDFS.LABEL];
        this.downloadFile(result, this.getFileName(label));
      } catch (error) {
        this.$toast.add(LoggerService.error("Download failed from server"));
      } finally {
        this.downloading = false;
      }
    },

    getFileName(label: string) {
      return (
        label +
        " - " +
        new Date()
          .toJSON()
          .slice(0, 10)
          .replace(/-/g, "/") +
        ".xlsx"
      );
    },

    downloadFile(data: any, fileName: string) {
      const url = window.URL.createObjectURL(new Blob([data], { type: "application" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
    },

    sortMembers(): void {
      if (isObjectHasKeys(this.members, ["members"]) && isArrayHasLength(this.members.members)) {
        this.members.members.sort((a: ValueSetMember, b: ValueSetMember) =>
          a.label.localeCompare(b.label) == 0 ? a.entity.name.localeCompare(b.entity.name) : a.label.localeCompare(b.label)
        );
      }
    },

    onResize(): void {
      this.setTableWidth();
    },

    setTableWidth(): void {
      const container = document.getElementById("members-table-container") as HTMLElement;
      if (!container) {
        LoggerService.error(undefined, "Failed to set members table width. Required element(s) not found.");
        return;
      }
      const table = container.getElementsByClassName("p-datatable-table")[0] as HTMLElement;
      if (table) {
        table.style.width = "100%";
      }
    }
  }
});
</script>

<style scoped>
#members-table-container {
  height: 100%;
  width: 100%;
}

#members-table-container ::v-deep(.p-datatable-wrapper) {
  overflow-x: hidden;
}

#members-table-container ::v-deep(td) {
  word-break: break-all;
}

.group-header {
  font-weight: 700;
  color: rgba(51, 153, 255, 0.8);
}

.checkboxes-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 0.5rem;
}

.complex-member-container {
  width: 100%;
}

.name-container {
  width: 100%;
  padding: 1rem;
  white-space: pre;
}

.html-container ::v-deep(p) {
  margin-bottom: 0 !important;
}

.table-header-bar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
}
</style>
