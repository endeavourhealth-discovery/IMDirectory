<template>
  <div class="avatar-container">
    <img data-testid="avatar-image" id="selected-avatar" :src="`/avatars/${newAvatar}`" alt="avatar icon" />
    <Button data-testid="avatar-op-button" icon="fa-solid fa-angle-down" class="p-button-rounded p-button-primary avatar-button" @click="toggleAvatarSelect" />
    <Popover ref="avatar" class="avatar-popup">
      <div>
        Icons made by
        <Button link as="a" href="https://www.flaticon.com/authors/vitaly-gorbachev" class="p-0" title="Vitaly Gorbachev">Vitaly Gorbachev</Button>
        from
        <Button link as="a" href="https://www.flaticon.com/" class="p-0" title="Flaticon">www.flaticon.com</Button>
      </div>
      <SelectButton
        data-testid="avatar-button-options"
        v-model="newAvatar"
        :options="avatarOptions"
        :pt="{ 'pc-button': { root: { 'data-testid': 'avatar-select-button' } } }"
      >
        <template #option="{ option }: any">
          <img class="avatar-select avatar-icon" :src="`/avatars/${option}`" alt="avatar icon" />
        </template>
      </SelectButton>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { Avatars } from "@/constants";
import { Ref, ref, watch } from "vue";

interface Props {
  selectedAvatar: string;
}

const props = defineProps<Props>();

const emit = defineEmits({
  avatarSelected: (payload: string) => Avatars.includes(payload)
});

const avatar = ref();

watch(
  () => props.selectedAvatar,
  newValue => {
    newAvatar.value = newValue;
  }
);

let avatarOptions: Ref<string[]> = ref([...Avatars]);
let newAvatar = ref(props.selectedAvatar);

watch(newAvatar, newValue => {
  emit("avatarSelected", newValue);
});

function toggleAvatarSelect(event: MouseEvent): void {
  avatar.value.toggle(event);
}
</script>

<style scoped>
.avatar-container {
  position: relative;
  padding: 1.5em;
}

.avatar-button {
  position: absolute;
  bottom: 0;
  right: 0;
}

#selected-avatar {
  width: 10rem;
  border: 1px solid var(--p-textarea-border-color);
  border-radius: 50%;
}

.avatar-icon {
  width: 3em;
}
</style>

<style>
.avatar-popup {
  width: 25em;
  height: 40vh;
  overflow-y: auto;
  display: flex;
  flex-flow: column nowrap;
}

.avatar-popup > .p-popover-content {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  max-height: 100%;
}

.avatar-popup > .p-popover-content > .p-selectbutton {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  overflow-y: auto;
}

.avatar-popup div div .p-button {
  margin: 2px;
  border-right: 1px solid var(--p-textarea-border-color) !important;
}
</style>
