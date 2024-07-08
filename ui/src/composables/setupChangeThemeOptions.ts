import { useUserStore } from "@/stores/userStore";
import { usePreset, updatePrimaryPalette, updateSurfacePalette, palette } from "@primevue/themes";
import Aura from "@primevue/themes/aura";
import Lara from "@primevue/themes/lara";
import Nora from "@primevue/themes/nora";

function setupChangeThemeOptions() {
  const userStore = useUserStore();

  async function changePreset(preset: string) {
    switch (preset) {
      case "aura":
        usePreset(Aura);
        break;
      case "nora":
        usePreset(Nora);
        break;
      case "lara":
        usePreset(Lara);
        break;
      default:
        usePreset(Aura);
        break;
    }
    if (preset !== userStore.currentPreset) await userStore.updatePreset(preset);
  }

  async function changePrimaryColor(color: string) {
    const colorPalette = palette(`{${color}}`);
    updatePrimaryPalette(colorPalette);
    if (color !== userStore.currentPrimaryColor) await userStore.updatePrimaryColor(color);
  }

  async function changeSurfaceColor(color: string) {
    const colorPalette = palette(`{${color}}`);
    updateSurfacePalette(colorPalette);
    if (color !== userStore.currentSurfaceColor) await userStore.updateSurfaceColor(color);
  }

  async function changeDarkMode(bool: boolean) {
    const element = document.querySelector("html");
    const darkMode = element?.classList.contains("my-app-dark") ? true : false;
    if (element && bool !== darkMode) element.classList.toggle("my-app-dark");
    if (userStore.darkMode !== darkMode) await userStore.updateDarkMode(darkMode);
  }

  return { changePreset, changePrimaryColor, changeSurfaceColor, changeDarkMode };
}

export default setupChangeThemeOptions;
