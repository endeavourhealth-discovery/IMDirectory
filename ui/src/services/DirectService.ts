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

  public directTo(app: string, iri?: string, action?: string, appRoute?: string) {
    if (iri) {
      if (appRoute) window.open(app + appRoute + "/" + encodeURIComponent(iri));
      else window.open(app + encodeURIComponent(iri));
      this.userStore.updateRecentLocalActivity({ iri: iri, dateTime: new Date(), action: action } as RecentActivityItem);
    } else if (appRoute) {
      window.open(app + appRoute);
    } else {
      window.open(app);
    }
  }

  public directWithConfirmation(app: string, iri: string, action: string, component: CreateComponentPublicInstance<any>, appRoute?: string) {
    component.$confirm.require({
      message: this._message,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.directTo(app, iri, action, appRoute);
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }

  public file() {
    this.directTo(Env.DIRECTORY_URL, "", "Filed", "filer");
  }

  public view(iri?: string) {
    if (iri) this.directTo(Env.DIRECTORY_URL, iri || "", "Viewed", "directory/folder");
    else this.directTo(Env.DIRECTORY_URL);
  }

  public select(iri: string, routeName?: string) {
    if (iri) {
      const currentRoute = this.route.name as RouteRecordName | undefined;
      this.router.push({
        name: routeName || currentRoute,
        params: { selectedIri: iri }
      });
      this.directoryStore.updateConceptIri(iri);
    }
    this.userStore.updateRecentLocalActivity({ iri: iri, dateTime: new Date(), action: "Viewed" } as RecentActivityItem);
  }

  public edit(iri?: string) {
    this.directTo(Env.DIRECTORY_URL, iri || "", "Edited", "editor");
  }

  public query() {
    this.directTo(Env.DIRECTORY_URL, "", "Queried", "query");
  }

  public create(typeIri?: string, propertyIri?: string, valueIri?: string) {
    if (!typeIri && !propertyIri && !valueIri) {
      window.open(Env.DIRECTORY_URL + "creator");
    } else {
      const routeData = this.router.resolve({ name: "Creator", query: { typeIri: typeIri, propertyIri: propertyIri, valueIri: valueIri } });
      window.open(routeData.href, "_blank");
    }
  }
}
