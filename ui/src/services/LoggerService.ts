import { ToastMessageOptions } from "primevue/toast";

export default {
  // for toast functionality, LoggerService should be called within Vue toast operation
  // e.g.
  // this.$toast.add(
  // LoggerService.error("Concept schemes server request failed", err)
  // );

  error(toastMessage?: string, consoleData?: Error | string): ToastMessageOptions {
    if (consoleData) console.error(consoleData);
    if (!toastMessage) return {};

    return {
      severity: "error",
      summary: "Error",
      detail: toastMessage,
      life: 3000
    } as ToastMessageOptions;
  },

  warn(toastMessage?: string, consoleData?: Error | string): ToastMessageOptions {
    if (consoleData) console.warn(consoleData);
    if (!toastMessage) return {};

    return {
      severity: "warn",
      summary: "Warning",
      detail: toastMessage,
      life: 3000
    };
  },

  info(toastMessage?: string, consoleData?: Error | string): ToastMessageOptions {
    if (consoleData) console.info(consoleData);
    if (!toastMessage) return {};

    return {
      severity: "info",
      summary: "Info",
      detail: toastMessage,
      life: 3000
    };
  },

  success(toastMessage?: string, consoleData?: string): ToastMessageOptions {
    if (consoleData) console.log(consoleData);
    if (!toastMessage) return {};

    return {
      severity: "success",
      summary: "Success",
      detail: toastMessage,
      life: 3000
    };
  },

  debug(consoleData: Error | string): void {
    console.debug(consoleData);
  },

  trace(consoleData: Error | string): void {
    console.trace(consoleData);
  }
};
