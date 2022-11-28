import { CreateComponentPublicInstance } from "vue";
import { RouteLocationNormalizedLoaded, Router, RouteRecordName, useRoute, useRouter } from "vue-router";
import { Store, useStore } from "vuex";
import Env from "./Env";

export default class DirectService {
  private store: Store<any>;
  private _message: string;
  private router: Router;
  private route: RouteLocationNormalizedLoaded;

  constructor() {
    this.route = useRoute();
    this.router = useRouter();
    this.store = useStore();
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

  public view(iri?: string) {
    this.directTo(Env.DIRECTORY_URL, iri || "", "folder");
  }

  public select(iri: string, routeName?: string) {
    if (iri) {
      const currentRoute = this.route.name as RouteRecordName | undefined;
      this.router.push({
        name: routeName || currentRoute,
        params: { selectedIri: iri }
      });
      this.store.commit("updateConceptIri", iri);
    }
  }

  public edit(iri?: string) {
    this.directTo(Env.DIRECTORY_URL, iri || "", "editor");
  }

  public create() {
    window.open(Env.DIRECTORY_URL + "creator");
  }
}
