import { ConfigService, EntityService, SetService } from "im-library";
import { ComponentCustomProperties } from "vue";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $entityService: EntityService;
    $configService: ConfigService;
    $setService: SetService;
  }
}
