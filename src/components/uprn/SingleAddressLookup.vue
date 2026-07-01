<template>
  <div id="address-lookup">
    <p>
      Enter an address string (must be at least 10 character long).<br />
      e.g. 10 Downing St,Westminster,London,SW1A2AA
    </p>

    <div class="search-container">
      <InputText
        v-model="searchAddress"
        :class="showInvalid && !validAddress && 'p-invalid'"
        class="address-input"
        placeholder="Enter an address"
        type="text"
        @keyup.enter="submitAddress"
      />
      <Button class="button" @click="submitAddress">Search</Button>
    </div>

    <!-- Radio buttons section -->
    <div class="radio-group">
      <div class="radio-option">
        <input id="residential" v-model="searchType" type="radio" value="100" />
        <label for="residential">Residential</label>
      </div>
      <div class="radio-option">
        <input id="commercial" v-model="searchType" type="radio" value="010" />
        <label for="commercial">Commercial</label>
      </div>
      <div class="radio-option">
        <input id="both" v-model="searchType" type="radio" value="001" />
        <label for="both">Residential or Commercial (residential takes precedence)</label>
      </div>
    </div>

    <small v-if="showInvalid" :class="!validAddress && 'invalid'">{{ invalidErrorMessage }}</small>

    <div v-if="!loading" class="data-table-container">
      <table v-if="searchResults" class="data-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(value, key) in searchResults" :key="key">
            <!-- Normal value -->
            <tr v-if="!isObject(value)">
              <td>
                <span v-tooltip="getDefinition(key)">
                  {{ variableToReadable(key) }}
                </span>
              </td>
              <td>{{ value }}</td>
            </tr>

            <!-- Object value -->
            <template v-else>
              <tr v-for="[subKey, subValue] in Object.entries(value as Record<string, unknown>)" :key="subKey">
                <td>
                  <span v-tooltip="getDefinition(subKey, key)">
                    {{ variableToReadable(subKey) }}
                  </span>
                </td>
                <td>{{ subValue }}</td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
    <div v-else class="loading-container"><ProgressSpinner /></div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, ref, watch } from "vue";

import { isObject } from "@endeavour/vue-library/helpers";

import Button from "primevue/button";
import { useToast } from "primevue/usetoast";

import UprnService from "@/services/UprnService";

const toast = useToast();

const searchAddress = ref("");
const searchType = ref("100"); // Default to "residential" option
const searchResults: Ref<any | undefined> = ref();
const validAddress = computed(() => isValidAddress(searchAddress.value));
const showInvalid = ref(false);
const invalidErrorMessage = ref("");
const loading = ref(false);

watch(searchAddress, () => {
  showInvalid.value = false;
});

watch(searchType, async () => {
  await submitAddress();
});

function isValidAddress(address: string) {
  return address.length >= 10;
}

async function submitAddress() {
  if (!validAddress.value) {
    searchResults.value = undefined;
    invalidErrorMessage.value = "Address is invalid. Please ensure the address is at least 10 characters";
    showInvalid.value = true;
    toast.add({ severity: "warn", summary: "Error", detail: invalidErrorMessage.value, life: 3000 });
    return;
  }
  loading.value = true;

  // Use the searchType value directly as the bit pattern
  const ncommercial = searchType.value;

  const result = await UprnService.search(searchAddress.value, ncommercial);
  if (result && result.Matched) {
    searchResults.value = result;
  } else {
    searchResults.value = undefined;
    showInvalid.value = true;
    invalidErrorMessage.value = "No results found. Please check the address is correct.";
    toast.add({ severity: "warn", summary: "Not found", detail: invalidErrorMessage.value, life: 3000 });
  }
  loading.value = false;
}

const keyToDescription = {
  uprntp: "ABP Unique Property Reference Number",
  buildingtp: "ABP building element of address string ",
  flattp: "ABP flat element of address string",
  numbertp: "ABP street number element of address string",
  streettp: "ABP street element of address string",
  towntp: "ABP town element of address string",
  postcodetp: "ABP postcode element of address string",
  orgtp: "ABP organisation element of address string",
  classcodetp: "ABP property classification code",
  classtermtp: "ABP property classification code description",
  lattp: "ABP latitude",
  longtp: "ABP longitude",
  Xtp: "ABP X coordinate",
  Ytp: "ABP Y coordinate",
  pointtp: "ABP accuracy of the coordinates",
  qualtp: "Nature of UPRN match: best match, parent, child or sibling",
  algtp: "The rule from the address matching algorithm that made the match",
  matchposttp: "Match pattern for the postcode between input and ABP address",
  matchbuildtp: "Match pattern for the building between input and ABP address",
  matchnumbertp: "Match pattern for the number between input and ABP address",
  matchflattp: "Match pattern for the flat between input and ABP address",
  matchstreettp: "Match pattern for the street between input and ABP address",
  matchtowntp: "Match pattern for the town between input and ABP address",
  matchorgtp: "Match pattern for the organisation between input and ABP address"
};

function getDefinition(key: any, parentKey?: any) {
  if (parentKey == "BestMatch") {
    switch (key) {
      case "UPRN":
        return "ABP unique property reference number";
      case "Classification":
        return "ABP property classification code";
      case "ClassTerm":
        return "ABP property classification code description";
      case "Qualifier":
        return "Nature of UPRN match: best match, parent, child or sibling";
      case "Algorithm":
        return "The rule from the address matching algorithm that made the match";
      default: {
        return variableToReadable(key);
      }
    }
  } else {
    if (parentKey === "ABPAddress") {
      switch (key) {
        case "Number":
          return keyToDescription.numbertp;
        case "Postcode":
          return keyToDescription.postcodetp;
        case "Street":
          return keyToDescription.streettp;
        case "Town":
          return keyToDescription.towntp;
        case "Building":
          return keyToDescription.buildingtp;
        case "Flat":
          return keyToDescription.flattp;
        case "Organisation":
          return keyToDescription.orgtp;
        case "Latitude":
          return keyToDescription.lattp;
        case "Longitude":
          return keyToDescription.longtp;
        case "X_Coordinate":
          return keyToDescription.Xtp;
        case "Y_Coordinate":
          return keyToDescription.Ytp;
        case "PointCode":
          return keyToDescription.pointtp;
        default:
          variableToReadable(parentKey + key);
      }
    }
    if (parentKey === "Match_pattern") {
      switch (key) {
        case "Building":
          return keyToDescription.matchbuildtp;
        case "Flat":
          return keyToDescription.matchflattp;
        case "Number":
          return keyToDescription.matchnumbertp;
        case "Postcode":
          return keyToDescription.matchposttp;
        case "Street":
          return keyToDescription.matchstreettp;
        case "Organisation":
          return keyToDescription.matchorgtp;
        case "Town":
          return keyToDescription.matchtowntp;
        default:
          variableToReadable(parentKey + key);
      }
    }
  }
}

function variableToReadable(variable: any) {
  const variableString = variable.toString();
  return variableString
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(/([A-Z][a-z]+|\s+)/g)
    .filter((s: string) => s !== "" && s !== " ")
    .map((s: string | any[], i: number) => {
      if (i > 0) return s[0].toLowerCase() + s.slice(1);
      else return s;
    })
    .join(" ");
}
</script>

<style scoped>
tbody {
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

.button {
  flex: 0 0 auto;
  width: fit-content;
}

.radio-group {
  display: flex;
  flex-flow: row nowrap;
  gap: 1.5rem;
  margin: 0.5rem 0;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-option input[type="radio"] {
  margin: 0;
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

.loading-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
</style>
