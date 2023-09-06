import { Ref, ref } from "vue";

function setupOverlay() {
  const OS: Ref<any> = ref();

  async function showOverlay(event: any, data: any): Promise<void> {
    if (OS.value) await OS.value.showOverlay(event, data);
  }

  function hideOverlay(event: any): void {
    if (OS.value) OS.value.hideOverlay(event);
  }

  return {
    OS,
    showOverlay,
    hideOverlay
  };
}

export default setupOverlay;
