import { UserService } from "@/services";
import { FontSize } from "vue-library/enums";
import { useUserStore } from "vue-library/stores";

export function useChangeFontSize() {
  const userStore = useUserStore();

  async function changeFontSize(newFontSize: FontSize) {
    const currentFontSize = document.documentElement.style.fontSize || "14px";
    if (newFontSize !== currentFontSize) {
      document.documentElement.style.fontSize = newFontSize;
      await userStore.updateCurrentFontSize(newFontSize, UserService);
    }
  }

  return { changeFontSize: changeFontSize };
}
