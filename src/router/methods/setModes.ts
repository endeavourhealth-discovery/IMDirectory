import { StatusService } from "@/services";
import { useSharedStore } from "@/stores/sharedStore";

export async function setModes() {
  const sharedStore = useSharedStore();
  if (sharedStore.isPublicMode === undefined) {
    sharedStore.updateIsPublicMode(await StatusService.isPublicMode());
  }
  if (sharedStore.isDevMode === undefined) {
    sharedStore.updateIsDevMode(await StatusService.isDevMode());
  }
}
