import { CreateComponentPublicInstance } from "vue";
import store from "@/store/index";
import { RecentActivityItem } from "im-library/dist/types/interfaces/Interfaces";
import { Enums } from "im-library";
const { AppEnum } = Enums;

export default class DirectService {
  static MESSAGE = "You will be directed to a different application. Are you sure you want to proceed?";

  public static directTo(app: Enums.AppEnum, iri: string, component: CreateComponentPublicInstance<any>) {
    if (iri) {
      window.open(app + encodeURIComponent(iri));
      store.commit("updateRecentLocalActivity", { iri: iri, dateTime: new Date(), app: app });
    } else {
      window.open(app);
    }
  }

  public static directWithConfirmation(app: Enums.AppEnum, iri: string, component: CreateComponentPublicInstance<any>) {
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
