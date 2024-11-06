import { DashboardLayout, DefinitionConfig } from "@/interfaces";
import { ref, Ref } from "vue";
import { ConfigService } from "@/services";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { byOrder } from "@/helpers/Sorters";
import { getLogger } from "@/logger/LogConfig";

const log = getLogger("composables.setupConfig");

function setupConfig() {
  const configs: Ref<DefinitionConfig[]> = ref([]);

  async function getConfig(): Promise<void> {
    const definitionConfig: DefinitionConfig[] = await ConfigService.getComponentLayout("definition");
    const summaryConfig: DashboardLayout[] = await ConfigService.getComponentLayout("summary");

    configs.value = definitionConfig.concat(summaryConfig as any[]) as DefinitionConfig[];

    if (configs.value.every(config => isObjectHasKeys(config, ["order"]))) {
      configs.value.sort(byOrder);
    } else {
      log.error("Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
    }
  }

  return { configs, getConfig };
}

export default setupConfig;
