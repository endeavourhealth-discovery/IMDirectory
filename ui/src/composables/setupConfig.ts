import { DashboardLayout, DefinitionConfig } from "@im-library/interfaces";
import { ref, Ref } from "vue";
import { ConfigService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { byOrder } from "@im-library/helpers/Sorters";
import { getLogger } from "@im-library/logger/LogConfig";

const log = getLogger("composables.setupConfig");

function setupConfig() {
  const configs: Ref<DefinitionConfig[]> = ref([]);

  async function getConfig(): Promise<void> {
    const definitionConfigString = await ConfigService.getComponentLayout("definition");
    const definitionConfig: DefinitionConfig[] = parseConfig(definitionConfigString);
    const summaryConfigString = await ConfigService.getComponentLayout("summary");
    const summaryConfig: DashboardLayout[] = parseConfig(summaryConfigString);

    configs.value = definitionConfig.concat(summaryConfig as any[]) as DefinitionConfig[];

    if (configs.value.every(config => isObjectHasKeys(config, ["order"]))) {
      configs.value.sort(byOrder);
    } else {
      log.error("Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
    }
  }

  function parseConfig(configString: string) {
    if (!configString) {
      return [];
    }
    const procString = configString.slice(1, -1);
    const parsed = JSON.parse(procString);
    return parsed as any[];
  }

  return { configs, getConfig };
}

export default setupConfig;
