<template>
  <div id="uprn-main-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>UPRN</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="uprn-content">
      <TabMenu :model="items" id="uprn-menu"/>
      <router-view />
    </div>
  </div>
  <div><button id="tester" hidden=true @click="testBtn">Test</button></div>
  <div><button id="enableBtn" hidden=true @click="enableBtn">Test</button></div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { onMounted, ref } from "vue";
import { useUprnStore } from "@/stores/uprnStore";
import { useRouter } from "vue-router";
import UprnService from "@/services/UprnService";
import uprnService from "@/services/UprnService";
import dataModelService from "@/services/DataModelService";
import Env from "@/services/Env";

const uprnStore = useUprnStore();
const router = useRouter();
const z = ref({});
const reg = ref();

const items = ref([
  {
    label: "Welcome",
    to: "/uprn/uprnWelcome",
    disbled: true
  },
  {
    label: "Input Single Address",
    to: "/uprn/singleAddressLookup",
    disabled: true
  },
  {
    label: "Upload Address File",
    to: "/uprn/addressFileWorkflow",
    disabled: true
  },
  {
    label: "Downloads + Activity",
    to: "/uprn/addressFileDownload",
    disabled: true
  }
]);

const regData = async () => {

  let ret = "?"; let regdate = ""; let name = ""; let org = "";

  await uprnService.getRegister(Env.UPRN_USER)
      .then((result) => {

        if (result["regdate"] != undefined) {
          ret = result["regdate"] + "~" + result["name"] + "~" + result["organization"];
          regdate = result["regdate"]; name = result["name"]; org = result["organization"];
        }

      }).catch((error) => {
        // Handle any errors that occurred during the service call
        console.error('Service Error:', error);
      });

  const uprnStore = useUprnStore();

  //ret = "?"; regdate = ""; name = ""; org = "";

  uprnStore.updateRegDate(regdate);
  uprnStore.updateWelcome(ret);
  uprnStore.updateCustomerName(name);
  uprnStore.updateOrg(org);

  return ret;
}

async function crack()
{

  reg.value = await regData();

  if (uprnStore.welcome != "?") router.push({ name: "SingleAddressLookup" });

  if (uprnStore.welcome == "?") {
    router.push({name: "Welcome"});

    items.value.forEach((item) => {
      if (item.label !== "Welcome") {
        item.disabled = true;
      }
    })
  }
}

onMounted(() => {

  const uprnStore = useUprnStore();

  items.value.forEach((item) => {
    if (item.label !== "Welcome") {
      if (uprnStore.welcome !="?") {
        item.disabled = false;
      }
      else item.disbled = true;
    }
  });

  crack();
});

const enableBtn = () => {
  items.value.forEach((item) => {
    if (item.label !== "Welcome") {
      item.disabled = false;
    }
  });
  router.push({name: "SingleAddressLookup"});
}

const testBtn = () => {

  const uprnStore = useUprnStore();

  items.value.forEach((item) => {
    if (item.label !== "Welcome") {
      if (uprnStore.welcome =="?") {
        item.disabled = true;
      }
      else item.disbled = false;
    }
  });
}
</script>

<style scoped>
#uprn-main-container {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}
#uprn-content {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  background-color: var(--surface-a);
}
#uprn-menu {
  flex: 0 0 auto;
}
.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}
.title {
  font-size: 2rem;
}
</style>
