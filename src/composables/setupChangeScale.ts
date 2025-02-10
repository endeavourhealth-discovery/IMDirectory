import { useUserStore } from "@/stores/userStore";

function setupChangeScale() {
  const userStore = useUserStore();

  async function changeScale(newScale: string) {
    const currentScale = document.documentElement.style.fontSize || "14px";
    if (newScale !== currentScale) {
      document.documentElement.style.fontSize = newScale;
      await userStore.updateCurrentScale(newScale);
    }
  }

  return { changeScale };
}

export default setupChangeScale;
