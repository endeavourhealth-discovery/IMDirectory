import { CreateComponentPublicInstance } from "vue";
import store from "@/store/index";
import { RecentActivityItem } from "@/models/RecentActivityItem";

export default class DirectService {
  static VIEWER_APP = "/viewer/#/concept/";
  static MESSAGE = "You will be directed to a different application. Are you sure you want to proceed?";

  public static directTo(iri: string, component: CreateComponentPublicInstance<any>) {
    window.open(this.VIEWER_APP + encodeURIComponent(iri));
    store.commit("updateRecentLocalActivity", { iri: iri, dateTime: new Date(), app: "IMViewer" });
  }

  public static directWithConfirmation(iri: string, component: CreateComponentPublicInstance<any>) {
    component.$confirm.require({
      message: this.MESSAGE,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.directTo(iri, component);
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }
}
