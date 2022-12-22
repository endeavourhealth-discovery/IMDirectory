import { DefinitionConfig } from "@im-library/interfaces";
import { ref, Ref } from "vue";
import { ConfigService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { byOrder } from "@im-library/helpers/Sorters";
import { getLogger } from "@im-library/logger/LogConfig";

const log = getLogger("composables.setupConfig");

function setupConfig() {
  const configs: Ref<DefinitionConfig[]> = ref([]);

  async function getConfig(): Promise<void> {
    const definitionConfig = await ConfigService.getComponentLayout("definition");
    const summaryConfig = await ConfigService.getComponentLayout("summary");
    configs.value = definitionConfig.concat(summaryConfig);

    if (configs.value.every(config => isObjectHasKeys(config, ["order"]))) {
      configs.value.sort(byOrder);
    } else {
      log.error("Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
    }
  }

  return { configs, getConfig };
}

export default setupConfig;
