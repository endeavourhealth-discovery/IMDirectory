import { CreateComponentPublicInstance } from "vue";
import store from "@/store/index";

export default class DirectService {
  static MESSAGE = "You will be directed to a different application. Are you sure you want to proceed?";

  public static directTo(app: string, iri: string, _component: CreateComponentPublicInstance<any>, appRoute?: string) {
    if (iri) {
      if (appRoute) window.open(app + "#/" + appRoute + "/" + encodeURIComponent(iri));
      else window.open(app + "#/" + encodeURIComponent(iri));
      store.commit("updateRecentLocalActivity", { iri: iri, dateTime: new Date(), app: app });
    } else {
      window.open(app);
    }
  }

  public static directWithConfirmation(app: string, iri: string, component: CreateComponentPublicInstance<any>, appRoute?: string) {
    component.$confirm.require({
      message: this.MESSAGE,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.directTo(app, iri, component, appRoute);
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }
}
