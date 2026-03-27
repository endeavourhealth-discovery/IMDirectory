import { FontSize } from "vue-library/enums";
import { useUserStore } from "@/stores/userStore";

export function useChangeFontSize() {
  const userStore = useUserStore();

  async function changeFontSize(newFontSize: FontSize) {
    const currentFontSize = document.documentElement.style.fontSize || "14px";
    if (newFontSize !== currentFontSize) {
      document.documentElement.style.fontSize = newFontSize;
      await userStore.updateCurrentFontSize(newFontSize);
    }
  }

  return { changeFontSize: changeFontSize };
}
