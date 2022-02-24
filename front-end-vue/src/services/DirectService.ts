import { CreateComponentPublicInstance } from "vue";
import store from "@/store/index";
import { RecentActivityItem } from "@/models/RecentActivityItem";
import { AppEnum } from "@/models/AppEnum";

export default class DirectService {
  static MESSAGE = "You will be directed to a different application. Are you sure you want to proceed?";

  public static directTo(app: AppEnum, iri: string, component: CreateComponentPublicInstance<any>) {
    window.open(app + encodeURIComponent(iri));
    store.commit("updateRecentLocalActivity", { iri: iri, dateTime: new Date(), app: app });
  }

  public static directWithConfirmation(app: AppEnum, iri: string, component: CreateComponentPublicInstance<any>) {
    component.$confirm.require({
      message: this.MESSAGE,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.directTo(app, iri, component);
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }
}
