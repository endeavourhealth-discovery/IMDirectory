import { DefinitionConfig } from "@/im_library/interfaces";
import { ref, Ref } from "vue";
import { ConfigService, LoggerService } from "@/im_library/services";
import { isObjectHasKeys } from "@/im_library/helpers/modules/DataTypeCheckers";
import { byOrder } from "@/im_library/helpers/modules/Sorters";

function setupConfig() {
  const configs: Ref<DefinitionConfig[]> = ref([]);

  async function getConfig(): Promise<void> {
    const definitionConfig = await ConfigService.getComponentLayout("definition");
    const summaryConfig = await ConfigService.getComponentLayout("summary");
    configs.value = definitionConfig.concat(summaryConfig);

    if (configs.value.every(config => isObjectHasKeys(config, ["order"]))) {
      configs.value.sort(byOrder);
    } else {
      LoggerService.error(undefined, "Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
    }
  }

  return { configs, getConfig };
}

export default setupConfig;
