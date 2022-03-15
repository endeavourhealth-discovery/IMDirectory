import { ComponentCustomProperties } from "vue";
import { Store } from "@/vuex";

import { Store } from "@/store/index";
import State from "@/store/stateType";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
