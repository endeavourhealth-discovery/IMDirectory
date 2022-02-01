<template>
  <div class="p-d-flex p-flex-column p-ai-center p-jc-start user-container">
    <div class="p-d-flex p-flex-column p-jc-start card-button-container">
      <button-bar />
      <div id="user-card-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ButtonBar from "@/components/user/ButtonBar.vue";

export default defineComponent({
  name: "User",
  components: {
    ButtonBar: ButtonBar
  }
});
</script>

<style scoped>
.user-container {
  width: 100%;
  height: 95vh;
  /* overflow-y: auto; */
  margin-top: 5vh;
}

.card-button-container {
  height: 100%;
}

#user-card-container {
  height: 100%;
  overflow-y: auto;
}
</style>
