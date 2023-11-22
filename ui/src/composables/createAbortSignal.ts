import { Ref } from "vue";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";

export function createAbortSignal(timeOut?: number): AbortController {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeOut || 0);
  return abortController;
}

export function abortIfExists(controller: Ref<AbortController | undefined>) {
  if (controller.value) {
    controller.value.abort();
    controller.value = undefined;
  }
}
