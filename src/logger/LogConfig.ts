import { Log4TSProvider, Logger } from "typescript-logging-log4ts-style";

const provider = Log4TSProvider.createProvider("IMLoggerProvider", {
  groups: [
    {
      expression: /helper.+/
    },
    { expression: /model.+/ },
    { expression: /component.+/ },
    { expression: /service.+/ },
    { expression: /composable.+/ }
  ]
});

export function getLogger(name: string): Logger {
  return provider.getLogger(name);
}
