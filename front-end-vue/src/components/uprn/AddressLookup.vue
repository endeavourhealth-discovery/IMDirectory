<template>
  <g-map :disableUI="false" :zoom="12" mapType="roadmap" :pin="pin" />
  <div id="address-search-container">
    <div class="search-button-container">
      <InputText type="text" v-model="value" placeholder='Enter address, e.g. "10 Downing St,Westminster,London,SW1A2AA"' @keyup.enter="search()" />
      <Button class="btn-search" icon="fas fa-search" @click="search()" />
    </div>
    <Dropdown v-model="selectedArea" :options="postalAreas" optionLabel="display" optionValue="value" placeholder="Postal Area" style="width: 14rem;" />
  </div>
  <div class="content" ref="uprn-info" :hidden="!match.Matched">
    <h1 id="firstHeading" class="firstHeading">UPRN : {{ match.UPRN }}</h1>
    <div id="bodyContent">
      <table aria-label="UPRN address lookup results">
        <thead>
          <tr>
            <th scope="col" colspan="2">Address</th>
            <th scope="col" colspan="2">Match - {{ match?.Algorithm }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Number</td>
            <td>{{ match?.ABPAddress?.Number }}</td>
            <td>Number</td>
            <td>{{ match?.Match_pattern?.Number }}</td>
          </tr>
          <tr>
            <td>Flat</td>
            <td>{{ match?.ABPAddress?.Flat }}</td>
            <td>Flat</td>
            <td>{{ match?.Match_pattern?.Flat }}</td>
          </tr>
          <tr>
            <td>Building</td>
            <td>{{ match?.ABPAddress?.Building }}</td>
            <td>Building</td>
            <td>{{ match?.Match_pattern?.Building }}</td>
          </tr>
          <tr>
            <td>Post code</td>
            <td>{{ match?.ABPAddress?.Postcode }}</td>
            <td>Post code</td>
            <td>{{ match?.Match_pattern?.Postcode }}</td>
          </tr>
          <tr>
            <td>Organisation</td>
            <td>{{ match?.ABPAddress?.Organisaton }}</td>
            <td>Latitude</td>
            <td>{{ pin?.lat }}</td>
          </tr>
          <tr>
            <td>Street</td>
            <td>{{ match?.ABPAddress?.Street }}</td>
            <td>Longitude</td>
            <td>{{ pin?.lng }}</td>
          </tr>
          <tr>
            <td>Town</td>
            <td>{{ match?.ABPAddress?.Town }}</td>
            <td>X Coordinate</td>
            <td>{{ pin?.xCoor }}</td>
          </tr>
          <tr>
            <td>Class</td>
            <td>{{ match?.Classification }} - {{ match?.ClassTerm }}</td>
            <td>Y Coordinate</td>
            <td>{{ pin?.yCoor }}</td>
          </tr>
          <tr>
            <td>Qualifier</td>
            <td>{{ match?.Qualifier }}</td>
            <td>Point code</td>
            <td>{{ pin?.pointCode }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UprnService from "@/services/UprnService";
import LoggerService from "@/services/LoggerService";
import GMap from "@/components/gmap/GMap.vue";
import { MapPin } from "@/models/uprn/MapPin";
import { SearchResponse } from "@/models/uprn/SearchResponse";

export default defineComponent({
  name: "AddressLookup",
  components: {
    GMap
  },
  data() {
    return {
      value: "10 Downing St,Westminster,London,SW1A2AA",
      pin: { lat: 51.503541, lng: -0.12767 } as MapPin,
      match: {} as SearchResponse,
      selectedArea: "",
      postalAreas: [
        { value: "", display: "None" },
        { value: "EC", display: "EC district" },
        { value: "WC", display: "WC district" },
        { value: "E", display: "E district" },
        { value: "N", display: "N district" },
        { value: "NW", display: "NW district" },
        { value: "SE", display: "SE district" },
        { value: "SW", display: "SW district" },
        { value: "W", display: "W district" },
        { value: "BR", display: "BR: Bromley" },
        { value: "CR", display: "CR: Croydon" },
        { value: "DA", display: "DA: Dartford" },
        { value: "EN", display: "EN: Enfield" },
        { value: "HA", display: "HA: Harrow" },
        { value: "IG", display: "IG: Ilford" },
        { value: "KT", display: "KT: Kingston" },
        { value: "RM", display: "RM: Romford" },
        { value: "SM", display: "SM: Sutton" },
        { value: "TW", display: "TW: Twickenham" },
        { value: "UB", display: "UB: Uxbridge" },
        { value: "WD", display: "WD: Watford" }
      ] as { value: string; display: string }[],
      searchContainerSizes: { width: 0, left: 0 } as {
        width: number;
        left: number;
      }
    };
  },
  methods: {
    async search(): Promise<void> {
      console.log("Searching [" + this.value + "]");
      this.match = await UprnService.findUprn(this.value, this.selectedArea);
      if (this.match.Matched) {
        console.log("Match found");
        this.getUprn();
      } else {
        console.log("No match");
        this.$toast.add(LoggerService.warn("No match found"));
      }
    },

    async getUprn(): Promise<void> {
      const uprn = await UprnService.getUprn(this.match.UPRN);
      if (Object.keys(uprn).length) {
        this.pin = {
          lat: +uprn.Latitude,
          lng: +uprn.Longitude,
          xCoor: uprn.XCoordinate,
          yCoor: uprn.YCoordinate,
          pointCode: uprn.Pointcode,
          info: this.$refs["uprn-info"]
        };
      }
    },

    setSizes(data: { width: number; left: number }) {
      this.searchContainerSizes = data;
    }
  }
});
</script>

<style scoped>
#address-search-container {
  z-index: 10;
  position: absolute;
  top: 1rem;
  width: calc(100% - 193px - 60px - 2rem);
  left: calc(193px + 1.5rem);
  right: calc(40px + 1.5rem);
  display: flex;
  flex-flow: row nowrap;
  gap: 1rem;
}

@media screen and (min-width: 768px) {
  #address-search-container {
    top: 1rem;
    width: calc(100% - 193px - 60px - 2rem);
    left: calc(193px + 1.5rem);
    right: calc(40px + 1.5rem);
  }
}

@media screen and (max-width: 767px) {
  #address-search-container {
    top: calc(40px + 2rem);
    width: calc(100% - 2rem);
    left: 1rem;
    right: 1rem;
  }
}

.search-button-container {
  display: flex;
  flex-flow: row nowrap;
  flex-grow: 100;
}

#address-search-container .p-inputtext {
  flex-grow: 100;
}

.btn-search {
  background-color: white !important;
  color: gray !important;
  border-color: lightgray !important;
}

table td,
table td * {
  vertical-align: top;
}

table {
  width: 100%;
}
</style>
