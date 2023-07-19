<template>
  <div>
    <!-- <h1>File workflow</h1> -->
    <br>
    <FileUpload mode="basic" :maxFileSize="1000000" customUpload @uploader="handleFileUpload" chooseLabel="Browse" />
  </div>
  <div>
    <p>The address file to be uploaded must contain two columns separated by a single tab character with a .txt extension<br>
      The first line must not contain any header information<br>
      The first column is a unique numeric row id<br>
      The second column is an address string including a postcode at the end with a comma separating the address from the postcode<br>
      The third column is the postal region (not mandatory, but useful when you don't know the address candidates postcode)<br><br>
      Example records:<br>
      1[tab]10 Downing St,Westminster,London,SW1A2AA<br>
      2[tab]10 Downing St,Westminster,London[tab]SW<br>
      3[tab]Bridge Street,London,SW1A 2LW<br>
      4[tab]221b Baker St,Marylebone,London,NW1 6XE<br>
      5[tab]3 Abbey Rd,St John's Wood,London,NW8 9AY
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import Env from "@/services/Env";

import FileUpload from "primevue/fileupload";
const toast = useToast();

const handleFileUpload = async (event) => {

  const api = Env.UPRN_API;
  const username = Env.UPRN_USER;
  const password = Env.UPRN_PASSWORD;

  const file = event.files[0];
  console.log(file.name);

  const formData = new FormData();
  formData.append('file', file);

  console.log(formData);

  try {
    const response = await fetch(api + '/api2/fileupload2', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: 'Basic ' + btoa(username + ':' + password)
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(JSON.stringify(data));
      if (data.upload["status"] == 'OK') {
        console.log('File uploaded successfully');
        toast.add({severity: 'success', summary: 'Success', detail: 'File uploaded successfully'});
      };
      if (data.upload["status"] == 'NOK') {
        console.log('File uploaded successfully');
        toast.add({severity: 'error', summary: 'Error', detail: 'Web Server had problems reading the file you uploaded.  Please make sure its in the correct format!'});
      }
    } else {
      console.log('File upload failed');
      toast.add({severity: 'error', summary: 'Error', detail: 'Upload failed'});
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.add({severity: 'error', summary: 'Error', detail: 'Error uploading file: '+error});
  }
};


</script>

<style scoped></style>
