import { FontSize } from "@/enums";
import { useUserStore } from "@/stores/userStore";

function setupChangeFontSize() {
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

export default setupChangeFontSize;
