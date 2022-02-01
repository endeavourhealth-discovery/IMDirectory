<template>
  <div class="upload-container">
    <FileUpload
      ref="fileUpload"
      name="demo[]"
      :customUpload="true"
      @uploader="onUpload"
      @clear="clearUpload"
      :preview-width="0"
      @remove="clearUpload"
      accept="text/plain"
      chooseLabel="Select"
      :fileLimit="1"
      :maxFileSize="1000000"
      @paste="onPaste"
    >
      <template #empty>
        <p>Drag and drop files here to upload.</p>
      </template>
    </FileUpload>
  </div>
  <div class="description-container">
    <p class="p-text-bold description-header">File format description:</p>
    <p class="description-text">
      The address file to be uploaded must contain two columns separated by a single tab character with a .txt extension
    </p>
    <p class="description-text">
      The first line must not contain any header information
    </p>
    <p class="description-text">The first column is a unique numeric row id</p>
    <p class="description-text">
      The second column is an address string including a postcode at the end with a comma separating the address from the postcode
    </p>
    <p class="description-text">
      The third column is the postal region (not mandatory, but useful when you don't know the address candidates postcode)
    </p>
  </div>
  <div class="examples-container">
    <p class="p-text-bold example-header">Example records:</p>
    <p class="example-text">
      1[tab]10 Downing St,Westminster,London,SW1A2AA
    </p>
    <p class="example-text">
      2[tab]10 Downing St,Westminster,London[tab]SW
    </p>
    <p class="example-text">
      3[tab]Bridge Street,London,SW1A 2LW
    </p>
    <p class="example-text">
      4[tab]221b Baker St,Marylebone,London,NW1 6XE
    </p>
    <p class="example-text">
      5[tab]3 Abbey Rd,St John's Wood,London,NW8 9AY
    </p>
  </div>
  <div class="refresh-button-container">
    <Button class="refresh-button" label="Refresh table" icon="fa fa-fw fa-redo" @click="refreshActivity" style="margin: 2rem 0 1rem 0" />
  </div>
  <div id="address-workflow-table-container">
    <DataTable :value="activity" responsiveLayout="scroll" showGridlines id="address-workflow-table" :scrollable="true" scrollHeight="flex">
      <Column field="DT" header="Time" :style="'word-break: break-all'" />
      <Column field="A" header="Status" :style="'word-break: break-all;'" />
      <Column field="F" header="Action">
        <template #body="slotProps">
          <button v-if="slotProps.data.F" type="button" @click="download(slotProps.data.F)" class="p-button button-download pi pi-download" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UprnService from "@/services/UprnService";
import LoggerService from "@/services/LoggerService";

export default defineComponent({
  name: "FileWorkflow",
  data() {
    return {
      activity: [] as { DT: string; A: string }[]
    };
  },
  mounted() {
    this.refreshActivity();
  },
  methods: {
    async refreshActivity(): Promise<void> {
      this.activity = await UprnService.getActivity();
    },

    async download(filename: string): Promise<void> {
      const result = await UprnService.download(filename);
      const url = window.URL.createObjectURL(new Blob([result]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
    },

    async onUpload(event: any): Promise<void> {
      console.log(event.files[0]);
      await UprnService.upload(event.files[0]).then(() => {
        this.$toast.add(LoggerService.success("fileUploaded"));
        this.refreshActivity();
      });
      console.log("upload" + event.files[0].name);
    },

    clearUpload(): void {
      const x = this.$refs.fileUpload as any;
      x.uploadedFileCount = 0;
      console.log("Clear upload");
    },
    onPaste(event: any): void {
      const x = this.$refs.fileUpload as any;
      x.files.push(event.clipboardData.files[0]);
      console.log(event.clipboardData.files[0]);
    }
  }
});
</script>

<style scoped>
.upload-container {
  grid-area: upload;
}

.description-text,
.example-text {
  margin: 0;
}

.p-fileupload-row div:first-of-type {
  display: none;
}

.refresh-button {
  width: fit-content;
  height: fit-content;
}

.refresh-button-container {
  grid-area: refresh;
}

#address-workflow-table-container {
  grid-area: table;
  height: 100%;
}
</style>
