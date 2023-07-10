import { useUserStore } from "@/stores/userStore";
import { usePrimeVue } from "primevue/config";
import { computed } from "vue";

function setupChangeTheme() {
  const userStore = useUserStore();
  const PrimeVue: any = usePrimeVue();

  function changeTheme(newTheme: string) {
    const currentTheme = document.getElementById("theme-link")?.getAttribute("href")?.split("/")[2];
    if (!currentTheme) {
      PrimeVue.changeTheme("saga-blue", newTheme, "theme-link", () => {
        userStore.updateCurrentTheme(newTheme);
      });
    } else {
      if (newTheme !== currentTheme) {
        PrimeVue.changeTheme(currentTheme, newTheme, "theme-link", () => {
          userStore.updateCurrentTheme(newTheme);
        });
      }
    }
  }

  return { changeTheme };
}

export default setupChangeTheme;
