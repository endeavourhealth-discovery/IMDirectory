<template>
  <div>
    <h1>Welcome to the Discovery Programme Address Matching Service 'ASSIGN'.</h1>
  </div>

  <p id="zreg">{{ 'Registered: ' + registeredText }}</p>

    <span class="p-float-label">
      <InputText id="usrname" v-model="usrname"  placeholder="Name"  type="text" :class="{ 'p-invalid': errorMessage }" aria-describedby="text-error" />
      <br><br>
      <InputText id="orgname" v-model="orgname"  placeholder="Organisation"  type="text" :class="{ 'p-invalid': errorMessage }" aria-describedby="text-error" />
    </span>
    <p>
    <br>To proceed, please enter your details, and read and accept the following:<br><br>
    I have read the attribution and disclaimer and understand that I will use this service within these conditions<br><br>
      <a href="https://github.com/endeavourhealth-discovery/uprn-match/blob/master/201002_Attribution_Disclaimer_V5.docx?raw=true">Attribution and Disclaimer</a><br><br>
    <b>I am licenced to use AddressBase Premium</b><br><br>
    This service has 2 options – return a UPRN for a single address or return UPRNs for a list of addresses in a tab separated text file<br>
    <br><br>
    <button @click="Agree">Yes, I agree!</button>
    </p>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import InputText from 'primevue/inputtext';
import {computed, onMounted, ref} from 'vue';
import {useConfirm} from "primevue/useconfirm";
import uprnService from "@/services/UprnService";
import {$ref} from "vue/macros";
import {useUprnStore} from "@/stores/uprnStore";
import Env from "@/services/Env";

const value = ref("test");
var usrname = ref('');
const orgname = ref('');
const regist = ref('');
const registeredText = ref('');

let data = ref('');

const toast = useToast();
const confirm = useConfirm();

const Agree = () => {

  if (usrname.value == "" || orgname.value === "") {
    toast.add({ severity: 'info', summary: 'Oops', detail: "Please enter your name and organisation", life: 3000 });
    return;
  }

  makeSynchronousRequest().then((result) => {
    if (result == 0) {
      toast.add({ severity: 'error', summary: 'WS ERROR', detail: 'Sorry, unable file in database', life: 3000 });
    }
  });
}

onMounted(() => {
  const uprnStore = useUprnStore();
  registeredText.value = String(uprnStore.date_registered);

  usrname.value = uprnStore.customer_name;
  orgname.value = uprnStore.organisation;

  if (registeredText.value == "?") {
    const zbutton = document.getElementById("tester") as HTMLElement;
    if (zbutton) {zbutton.click();}
  }
});

function SaveInStore() {
  const uprnStore = useUprnStore();

  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const day = currentDate.getDate();

  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();

  let dt = day+ "."+month+"."+year+":"+hours+":"+minutes;

  uprnStore.updateRegDate(dt);

  let ret = dt + "~" + usrname.value + "~" + orgname.value;
  uprnStore.updateWelcome(ret);
  uprnStore.updateCustomerName(usrname.value);
  uprnStore.updateOrg(orgname.value);

  toast.add({ severity: 'info', summary: 'Good news', detail: "filed ok.", life: 3000 });

  const zbutton = document.getElementById("enableBtn") as HTMLElement;
  if (zbutton) zbutton.click();
}

async function makeSynchronousRequest() {
  const api = Env.UPRN_API;
  //const api = Env.API;
  const u = import.meta.env.VITE_UPRN_USER
  const p = import.meta.env.VITE_UPRN_PASSWORD;

  const formData = new FormData();
  formData.append('name', usrname.value);
  formData.append('organisation', orgname.value);
  formData.append('userid', u);

  try {
    const response = await fetch(api + '/api2/register', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: 'Basic ' + btoa(u + ':' + p)
      }
    });

    const data = await response.json();

    SaveInStore();

    // Process the response data as needed.
    console.log(data);
  } catch (error) {
    console.error('Error occurred:', error);
    return 0
  }
  return 1;
}

</script>

<style scoped>
.usrname {
  width: 50%; /* Adjust the width as per your needs */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>