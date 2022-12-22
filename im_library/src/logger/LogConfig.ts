import { LogLevel } from "typescript-logging";
import { Log4TSProvider, Logger } from "typescript-logging-log4ts-style";

const provider = Log4TSProvider.createProvider("IMLoggerProvider", {
  groups: [
    {
      expression: new RegExp("helper.+")
    },
    { expression: new RegExp("model.+") },
    { expression: new RegExp("component.+") },
    { expression: new RegExp("service.+") },
    { expression: new RegExp("composable.+") }
  ]
});

export function getLogger(name: string): Logger {
  return provider.getLogger(name);
}
