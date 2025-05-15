import PrimeVueColors from "@/enums/PrimeVueColors";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import { useUserStore } from "@/stores/userStore";
import { usePreset, updatePrimaryPalette, updateSurfacePalette, palette } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import Lara from "@primeuix/themes/lara";
import Nora from "@primeuix/themes/nora";
import Material from "@primeuix/themes/material"
import { PaletteDesignToken } from "@primeuix/themes/types";

function setupChangeThemeOptions() {
  const userStore = useUserStore();

  async function changePreset(preset: PrimeVuePresetThemes) {
    switch (preset) {
      case PrimeVuePresetThemes.AURA:
        usePreset(Aura);
        break;
      case PrimeVuePresetThemes.NORA:
        usePreset(Nora);
        break;
      case PrimeVuePresetThemes.LARA:
        usePreset(Lara);
        break;
        case PrimeVuePresetThemes.MATERIAL:
          usePreset(Material)
          break;
      default:
        usePreset(Aura);
        break;
    }
    if (userStore.currentPrimaryColor) changePrimaryColor(userStore.currentPrimaryColor);
    if (userStore.currentSurfaceColor) changeSurfaceColor(userStore.currentSurfaceColor);
    if (userStore.darkMode) changeDarkMode(userStore.darkMode);
    if (preset !== userStore.currentPreset) await userStore.updatePreset(preset);
  }

  async function changePrimaryColor(color: PrimeVueColors) {
    const colorPalette = palette(`{${color}}`);
    updatePrimaryPalette(colorPalette as PaletteDesignToken);
    if (color !== userStore.currentPrimaryColor) await userStore.updatePrimaryColor(color);
  }

  async function changeSurfaceColor(color: PrimeVueColors) {
    const colorPalette = palette(`{${color}}`);
    updateSurfacePalette(colorPalette as PaletteDesignToken);
    if (color !== userStore.currentSurfaceColor) await userStore.updateSurfaceColor(color);
  }

  async function changeDarkMode(bool: boolean) {
    const element = document.querySelector("html");
    const darkMode = element?.classList.contains("my-app-dark") ? true : false;
    if (element && bool !== darkMode) element.classList.toggle("my-app-dark");
    if (userStore.darkMode !== bool) await userStore.updateDarkMode(bool);
  }

  return { changePreset, changePrimaryColor, changeSurfaceColor, changeDarkMode };
}

export default setupChangeThemeOptions;
