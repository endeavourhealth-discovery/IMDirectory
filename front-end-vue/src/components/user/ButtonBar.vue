<template>
  <div class="p-d-flex p-flex-row p-jc-start">
    <Button class="back-button" label="Back" icon="pi pi-arrow-circle-left" iconPos="left" v-on:click.prevent="clickedBack" />
    <Button class="home-button" icon="pi pi-home" v-on:click.prevent="$router.push({ name: 'Home' })" />
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ButtonBar",
  computed: mapState(["snomedLicenseAccepted"]),
  methods: {
    clickedBack(): void {
      if (this.$store.state.historyCount === window.history.length) {
        this.$router.push({ name: "Dashboard" });
      } else {
        this.$router.go(-1);
      }
    }
  }
});
</script>

<style scoped>
.back-button {
  width: fit-content;
}

.home-button {
  margin-left: 0.25em;
}
</style>
