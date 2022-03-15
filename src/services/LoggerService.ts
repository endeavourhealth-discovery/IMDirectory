import { ToastType } from "im-library/dist/types/interfaces/Interfaces";

export default {
  // for toast functionality, LoggerService should be called within Vue toast operation
  // e.g.
  // this.$toast.add(
  // LoggerService.error("Concept schemes server request failed", err)
  // );

  error(toastMessage?: string, consoleData?: Error | string): ToastType | void {
    if (consoleData) {
      console.error(consoleData);
    }
    if (toastMessage) {
      return {
        severity: "error",
        summary: "Error",
        detail: toastMessage,
        life: 3000
      };
    }
  },

  warn(toastMessage?: string, consoleData?: Error | string): ToastType | void {
    if (consoleData) {
      console.warn(consoleData);
    }
    if (toastMessage) {
      return {
        severity: "warn",
        summary: "Warning",
        detail: toastMessage,
        life: 3000
      };
    }
  },

  info(toastMessage?: string, consoleData?: Error | string): ToastType | void {
    if (consoleData) {
      console.info(consoleData);
    }
    if (toastMessage) {
      return {
        severity: "info",
        summary: "Info",
        detail: toastMessage,
        life: 3000
      };
    }
  },

  success(toastMessage?: string, consoleData?: string): ToastType | void {
    if (consoleData) {
      console.log(consoleData);
    }
    if (toastMessage) {
      return {
        severity: "success",
        summary: "Success",
        detail: toastMessage,
        life: 3000
      };
    }
  },

  debug(consoleData: Error | string): void {
    console.debug(consoleData);
  },

  trace(consoleData: Error | string): void {
    console.trace(consoleData);
  }
};
