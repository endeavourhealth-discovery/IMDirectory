import { CreateComponentPublicInstance } from "vue";
import { RouteLocationNormalizedLoaded, Router, RouteRecordName, useRoute, useRouter } from "vue-router";
import { RecentActivityItem } from "@im-library/interfaces";
import Env from "./Env";
import { useUserStore } from "@/stores/userStore";
import { useDirectoryStore } from "@/stores/directoryStore";

export default class DirectService {
  private directoryStore;
  private userStore;
  private _message: string;
  private router: Router;
  private route: RouteLocationNormalizedLoaded;

  constructor() {
    this.route = useRoute();
    this.router = useRouter();
    this.directoryStore = useDirectoryStore();
    this.userStore = useUserStore();
    this._message = "You will be directed to a different application. Are you sure you want to proceed?";
  }

  private directTo(options: { iri?: string; action?: string; appRoute?: string; newTab?: boolean }) {
    let route = Env.DIRECTORY_URL;
    if (options.iri) {
      if (!options.newTab) {
        const currentRoute = this.route.name as RouteRecordName | undefined;
        this.router
          .push({
            name: options.appRoute ?? currentRoute,
            params: { selectedIri: options.iri }
          })
          .then(r => this.directoryStore.updateConceptIri(options.iri!));
      }
      if (options.appRoute) route += options.appRoute + "/" + encodeURIComponent(options.iri);
      else route += encodeURIComponent(options.iri);
      if (options.action) this.userStore.updateRecentLocalActivity({ iri: options.iri, dateTime: new Date(), action: options.action } as RecentActivityItem);
    } else if (options.appRoute) {
      route += options.appRoute;
    }
    if (options.newTab) window.open(route);
  }

  public directWithConfirmation(app: string, iri: string, action: string, component: CreateComponentPublicInstance<any>, appRoute?: string) {
    component.$confirm.require({
      message: this._message,
      header: "Confirmation",
      icon: "fa-solid fa-triangle-exclamation",
      accept: () => {
        this.directTo({ iri: iri, action: action, appRoute: appRoute });
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }

  public file() {
    this.directTo({ action: "Filed", appRoute: "filer", newTab: true });
  }

  public view(iri?: string, appRoute?: string) {
    if (iri && appRoute) this.directTo({ iri: iri, action: "Viewed", appRoute: appRoute, newTab: true });
    else if (iri) this.directTo({ iri: iri, action: "Viewed", appRoute: "directory/folder", newTab: true });
    else this.directTo({ newTab: true });
  }

  public select(iri: string, routeName?: string) {
    if (iri) this.directTo({ iri: iri, action: "Viewed", appRoute: routeName, newTab: false });
  }

  public edit(iri?: string, openInNewTab?: boolean) {
    if (iri) this.directTo({ iri: iri, action: "Edited", appRoute: "editor", newTab: openInNewTab });
    else this.directTo({});
  }

  public query() {
    this.directTo({ action: "Queried", appRoute: "query", newTab: true });
  }

  public create(typeIri?: string, propertyIri?: string, valueIri?: string) {
    if (!typeIri && !propertyIri && !valueIri) {
      this.directTo({ appRoute: "creator", newTab: true });
    } else {
      const routeData = this.router.resolve({ name: "Creator", query: { typeIri: typeIri, propertyIri: propertyIri, valueIri: valueIri } });
      this.directTo({ appRoute: routeData.href.replace("#/", ""), newTab: true });
    }
  }

  public uprn() {
    this.directTo({ appRoute: "uprn", newTab: true });
  }
}
