<template>
  <div class="avatar-container">
    <img id="selected-avatar" :src="getUrl(newAvatar)" alt="avatar icon" />
    <Button icon="pi pi-angle-down" class="p-button-rounded p-button-primary avatar-button" @click="toggleAvatarSelect" />
    <OverlayPanel ref="avatar" class="avatar-popup">
      <div>
        Icons made by
        <a href="https://www.flaticon.com/authors/vitaly-gorbachev" title="Vitaly Gorbachev">Vitaly Gorbachev</a>
        from
        <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
      </div>
      <SelectButton v-model="newAvatar" :options="avatarOptions">
        <template #option="slotProps">
          <img class="avatar-select avatar-icon" :src="require('@/assets/avatars/' + slotProps.option)" alt="avatar icon" />
        </template>
      </SelectButton>
    </OverlayPanel>
  </div>
</template>

<script lang="ts">
import { avatars } from "@/models/user/Avatars";
import { defineComponent } from "vue";

export default defineComponent({
  name: "AvatarWithSelector",
  props: { selectedAvatar: { type: String } },
  emits: { avatarSelected: (payload: string) => avatars.includes(payload) },
  watch: {
    selectedAvatar(newValue): void {
      this.newAvatar = newValue;
    },
    newAvatar(newValue): void {
      this.$emit("avatarSelected", newValue);
    }
  },
  data() {
    return {
      avatarOptions: avatars,
      newAvatar: this.selectedAvatar
    };
  },
  methods: {
    toggleAvatarSelect(event: any): void {
      const x = this.$refs.avatar as any;
      x.toggle(event);
    },

    getUrl(item: string): string {
      return require("@/assets/avatars/" + item);
    }
  }
});
</script>

<style scoped>
.avatar-container {
  position: relative;
  padding: 1.5em;
  /* margin: 1em; */
}

.avatar-button {
  position: absolute;
  bottom: 0;
  right: 0;
}

#selected-avatar {
  width: 10rem;
  border: 1px solid lightgray;
  border-radius: 50%;
}

.avatar-icon {
  width: 3em;
}
</style>
