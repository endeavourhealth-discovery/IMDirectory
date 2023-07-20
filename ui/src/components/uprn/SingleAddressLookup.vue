<template>
<div id="address-lookup">
    <p>Enter a single address string including a postcode at the end with a comma separating the address from the postcode<br>
    e.g. 10 Downing St,Westminster,London,SW1A2AA</p>

    <div class="search-container">
      <InputText type="text" v-model="searchAddress" placeholder="Enter an address" class="address-input" @keyup.enter="submitAddress"/>
      <Button @click="submitAddress" class="button">Search</Button>
    </div>

    <!-- <label for="postal">Postal: </label>
    <select id="postal" v-model="selectedPostal">
      <option v-for="item in postalOptions" :value="item.value" :key="item.value">{{ item.display }}</option>
    </select>
    <br><br> -->

    <div class="commercial-container">
      <label for="commercial">Commercial: </label>
      <Checkbox id="commercial" v-model="isCommercial" binary="true"/>
    </div>

    <div class="data-table-container">
    <table v-if="showResults" class="data-table">
      <thead>
      <tr>
        <th>Field</th>
        <th>Value</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="(value, key) in searchResults" :key="key">
        <td> <span v-tooltip="getDefinition(key)">{{ key }}</span></td>
        <td v-if="isObject(value)">
          <tr v-for="[subkey, subvalue] of Object.entries(value)" :key="subkey">
            <td>{{subkey }}</td>
            <td>{{ subvalue }}</td>
          </tr>
        </td>
        <td v-else>{{value}}</td>
      </tr>
      </tbody>
    </table>
    </div>

    <!--
    <div id="search-results">
      <DataTable :value="searchResults" scrollable scrollHeight="flex" showGridlines>
        <Column header="UPRN" field="UPRN">
          <template #body="{data}">
            <span>{{data.UPRN}}</span>
          </template>
        </Column>
        <Column header="Qualifier" field="Qualifier">
          <template #body="{data}">
            <span>{{data.Qualifier}}</span>
          </template>
        </Column>
        <Column header="Filename" field="file">
          <template #body="{data}">
            <span>{{data.F}}</span>
          </template>
        </Column>
        <Column Header="Download" field="download">
          <template #body="{data}">
            <Button v-if="data.F" label="download" @click="DownloadBtn(data.F)"></Button>
          </template>
        </Column>
      </DataTable>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import {computed, ref, Ref} from 'vue';
import uprnService from "@/services/UprnService";
import { useUserStore } from "@/stores/userStore";
import Button from 'primevue/button';
import {useToast} from "primevue/usetoast";
import {UprnSearchResponse} from "@im-library/interfaces";
import {isArrayHasLength, isObjectHasKeys, isObject} from "@im-library/helpers/DataTypeCheckers"

const searchAddress = ref('');
const isCommercial = ref('');

const showResults = ref(false);
const searchResults :Ref<UprnSearchResponse> = ref({});
const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser).value;

const toast = useToast();

const postalOptions = [
  { value: '0', display: '' },
  { value: '1', display: 'EC: district' },
  { value: '2', display: 'WC: district' },
  { value: '3', display: 'E: district' },
  { value: '4', display: 'N: district' },
  { value: '5', display: 'NW: district' },
  { value: '6', display: 'SE: district' },
  { value: '7', display: 'SW: district' },
  { value: '8', display: 'W: district' },
  { value: '9', display: 'BR: Bromley' },
  { value: '10', display: 'CR: Croydon' },
  { value: '11', display: 'DA: Dartford' },
  { value: '12', display: 'EN: Enfield' },
  { value: '13', display: 'HA: Harrow' },
  { value: '14', display: 'IG: Ilford' },
  { value: '15', display: 'KT: Kingston' },
  { value: '16', display: 'RM: Romford' },
  { value: '17', display: 'SM: Sutton' },
  { value: '18', display: 'TW: Twickenham' },
  { value: '19', display: 'UB: Uxbridge' },
  { value: '20', display: 'WD: Watford' }
];

const selectedPostal = ref('');

const submitAddress = () => {
  console.log(currentUser.email);
  console.log(currentUser.id);

  console.log('Submitted address:', searchAddress.value);
  console.log(isCommercial.value)
  console.log(selectedPostal.value)

  if (searchAddress.value === "") {
    toast.add({ severity: 'info', summary: 'Oops', detail: "Please enter an address candidate", life: 3000 });
    return;
  }

  let ncommercial="0"
  if (isCommercial.value == true) ncommercial="1"

  uprnService.search(searchAddress.value, ncommercial)
      .then((result) => {
        console.log('Service Result:', JSON.stringify(result));
        showResults.value = true;
        searchResults.value = result;
  }).catch((error) => {
        // Handle any errors that occurred during the service call
        console.error('Service Error:', error);
      });
};

function getDefinition(key: string) {
  switch (key) {
    case "UPRN": {return "BOB"; break}
    case "test": {return "crap"; break}
    default: {return "?"}
  }
}

</script>

<style>

tbody
{
  overflow-y: auto;
}

.address-input {
  width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#address-lookup {
  flex: 1 1 auto;
  overflow: auto;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  padding: 1rem;
}

.search-container {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;
}

.commercial-container {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;
}

.button {
  flex: 0 0 auto;
  width: fit-content;
}

.data-table-container {
  border-collapse: collapse;
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
}

.data-table {
  border-collapse: collapse;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.data-table th,
.data-table td {
  padding: 8px;
  border: 1px solid #ddd;
}

.data-table th {
  background-color: #f2f2f2;
}
</style>
