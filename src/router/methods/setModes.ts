import { StatusService } from "@/services";
import { useSharedStore } from "@/stores/sharedStore";
import { computed } from "vue";

export async function setModes() {
  const sharedStore = useSharedStore();
  const isPublicMode = computed(() => sharedStore.isPublicMode);
  const isDevMode = computed(() => sharedStore.isDevMode);
  if (typeof isPublicMode.value === "undefined") {
    const publicMode = await StatusService.isPublicMode();
    if (typeof publicMode !== "undefined") sharedStore.updateIsPublicMode(publicMode);
  }
  if (typeof isDevMode.value === "undefined") {
    const devMode = await StatusService.isDevMode();
    if (typeof devMode !== "undefined") sharedStore.updateIsDevMode(devMode);
  }
}
