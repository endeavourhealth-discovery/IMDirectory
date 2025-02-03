<template>
  <div id="address-file-workflow">
    <FileUpload mode="advanced" :maxFileSize="4000000" customUpload @uploader="handleFileUpload" chooseLabel="Browse" accept=".txt" :multiple="true" />
    <div id="address-file-instructions">
      <p>
        The address file to be uploaded must contain two columns separated by a single tab character with a .txt extension<br />
        The first line must not contain any header information<br />
        The first column is a unique numeric row id<br />
        The second column is an address string including a postcode at the end with a comma separating the address from the postcode<br />
        The third column is the postal region (not mandatory, but useful when you don't know the address candidates postcode)<br /><br />
        Example records:<br />
        1[tab]10 Downing St,Westminster,London,SW1A2AA<br />
        2[tab]10 Downing St,Westminster,London[tab]SW<br />
        3[tab]Bridge Street,London,SW1A 2LW<br />
        4[tab]221b Baker St,Marylebone,London,NW1 6XE<br />
        5[tab]3 Abbey Rd,St John's Wood,London,NW8 9AY
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";

import FileUpload from "primevue/fileupload";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import UprnService from "@/services/UprnService";

const toast = useToast();

const handleFileUpload = async (event: any) => {
  if (isArrayHasLength(event.files)) {
    for (const file of event.files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const result = await UprnService.upload(formData);
        if (result) {
          if (result.upload.status === "OK") {
            console.log("File uploaded successfully");
            toast.add({ severity: "success", summary: "Success", detail: "File uploaded successfully" });
          } else {
            console.log("File uploaded successfully");
            toast.add({
              severity: "error",
              summary: "Error",
              detail: "Web Server had problems reading the file you uploaded.  Please make sure its in the correct format!"
            });
          }
        } else {
          console.log("File upload failed");
          toast.add({ severity: "error", summary: "Error", detail: "Upload failed" });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.add({ severity: "error", summary: "Error", detail: "Error uploading file: " + error });
      }
    }
  }
};
</script>

<style scoped>
#address-file-workflow {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  padding: 0.5rem;
}
</style>
