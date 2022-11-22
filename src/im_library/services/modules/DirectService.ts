import { CreateComponentPublicInstance } from "vue";
import store from "@/store";
const message = "You will be directed to a different application. Are you sure you want to proceed?";

const DirectService = {
  directTo(app: string, iri: string, appRoute?: string) {
    if (iri) {
      if (appRoute) window.open(app + appRoute + "/" + encodeURIComponent(iri));
      else window.open(app + encodeURIComponent(iri));
      store.commit("updateRecentLocalActivity", { iri: iri, dateTime: new Date(), app: app });
    } else {
      window.open(app);
    }
  },

  directWithConfirmation(app: string, iri: string, component: CreateComponentPublicInstance<any>, appRoute?: string) {
    component.$confirm.require({
      message: message,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.directTo(app, iri, appRoute);
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }
};

Object.freeze(DirectService);

export default DirectService;
