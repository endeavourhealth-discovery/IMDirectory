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

  public directTo(iri?: string, action?: string, appRoute?: string, newWindow?: boolean) {
    let route = Env.DIRECTORY_URL;
    if (iri) {
      if (!newWindow) {
        const currentRoute = this.route.name as RouteRecordName | undefined;
        this.router.push({
          name: appRoute ?? currentRoute,
          params: { selectedIri: iri }
        });
        this.directoryStore.updateConceptIri(iri);
      }
      if (appRoute) route += appRoute + "/" + encodeURIComponent(iri);
      else route += encodeURIComponent(iri);
      if (action) this.userStore.updateRecentLocalActivity({ iri: iri, dateTime: new Date(), action: action } as RecentActivityItem);
    } else if (appRoute) {
      route += appRoute;
    }
    if (newWindow) window.open(route);
  }

  public directWithConfirmation(app: string, iri: string, action: string, component: CreateComponentPublicInstance<any>, appRoute?: string) {
    component.$confirm.require({
      message: this._message,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.directTo(iri, action, appRoute);
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }

  public file() {
    this.directTo("", "Filed", "filer");
  }

  public view(iri?: string, openInNewTab = true) {
    if (iri) this.directTo(iri || "", "Viewed", "directory/folder", openInNewTab);
    else this.directTo();
  }

  public select(iri: string, routeName?: string) {
    if (iri) this.directTo(iri || "", "Viewed", routeName, false);
    else this.directTo();
  }

  public edit(iri?: string, openInNewTab = true) {
    this.directTo(iri || "", "Edited", "editor", openInNewTab);
  }

  public query() {
    this.directTo("", "Queried", "query");
  }

  public create(typeIri?: string, propertyIri?: string, valueIri?: string) {
    if (!typeIri && !propertyIri && !valueIri) {
      this.directTo("", undefined, "creator");
    } else {
      const routeData = this.router.resolve({ name: "Creator", query: { typeIri: typeIri, propertyIri: propertyIri, valueIri: valueIri } });
      this.directTo("", undefined, routeData.href.replace("#/", ""));
    }
  }

  public uprn() {
    this.directTo("", undefined, "uprn");
  }
}
