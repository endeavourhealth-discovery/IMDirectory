import { CreateComponentPublicInstance } from "vue";
import { Store } from "vuex";

export default class DirectService {
  store: Store<any>;
  private _message: string;

  constructor(store: Store<any>) {
    this.store = store;
    this._message = "You will be directed to a different application. Are you sure you want to proceed?";
  }

  public directTo(app: string, iri: string, appRoute?: string) {
    if (iri) {
      if (appRoute) window.open(app + appRoute + "/" + encodeURIComponent(iri));
      else window.open(app + encodeURIComponent(iri));
      this.store.commit("updateRecentLocalActivity", { iri: iri, dateTime: new Date(), app: app });
    } else {
      window.open(app);
    }
  }

  public directWithConfirmation(app: string, iri: string, component: CreateComponentPublicInstance<any>, appRoute?: string) {
    component.$confirm.require({
      message: this._message,
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
}
