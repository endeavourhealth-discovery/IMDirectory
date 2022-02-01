<template>
  <div id="uprn-map" ref="mapDivRef"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin } from "@/models/uprn/MapPin";

export default defineComponent({
  name: "GMap",
  props: {
    zoom: { type: Number },
    mapType: { type: String },
    disableUI: { type: Boolean },
    pin: { type: Object as () => MapPin, required: true }
  },
  watch: {
    pin(newValue): void {
      if (this.marker != null) {
        this.marker.setMap(null);
      }

      if (newValue && this.google) {
        let latlong = newValue;
        this.map.setCenter(latlong);
        this.marker = new this.google.maps.Marker({
          position: latlong,
          map: this.map
        });
        this.infowindow = new this.google.maps.InfoWindow({
          content: newValue.info
        });
        this.infowindow.open(this.map, this.marker);
      }
    }
  },
  async mounted() {
    await this.init();
  },
  data() {
    return {
      infowindow: null as any,
      map: null as any,
      marker: null as any,
      google: null as any
    };
  },

  methods: {
    async init(): Promise<void> {
      const loader = new Loader({
        apiKey: process.env.VUE_APP_GOOGLEMAPS_KEY || ""
      });

      await loader.load().then(google => {
        this.google = google;
        const mapElement = document.getElementById("uprn-map") as HTMLElement;
        this.map = new this.google.maps.Map(mapElement, {
          mapTypeId: this.mapType || "hybrid",
          center: { lat: this.pin.lat, lng: this.pin.lng },
          zoom: this.zoom,
          disableDefaultUI: this.disableUI
        });
      });
    }
  }
});
</script>

<style lang="css" scoped>
#uprn-map {
  width: 100%;
  height: 100%;
  background-color: azure;
}
</style>
