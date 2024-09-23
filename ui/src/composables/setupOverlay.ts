import { ref } from "vue";

function setupOverlay() {
  const OS = ref();

  async function showOverlay(event: MouseEvent, data: any): Promise<void> {
    if (OS.value) await OS.value.showOverlay(event, data);
  }

  function hideOverlay(): void {
    if (OS.value) OS.value.hideOverlay();
  }

  return {
    OS,
    showOverlay,
    hideOverlay
  };
}

export default setupOverlay;
