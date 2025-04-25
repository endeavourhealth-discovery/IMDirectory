import { CreateComponentPublicInstance } from "vue";
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from "vue-router";
import { RecentActivityItem } from "@/interfaces";
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

  private directTo(options: { iri?: string; action?: string; appRoute: string; newTab?: boolean }) {
    let pathUrl = "";
    pathUrl += options.appRoute + "/";
    if (options.iri) pathUrl += encodeURIComponent(options.iri);
    if (options.action && options.iri) {
      this.userStore.updateRecentLocalActivity({ iri: options.iri, dateTime: new Date(), action: options.action } as RecentActivityItem);
    }
    if (!options.newTab) {
      if (options.iri) this.directoryStore.updateConceptIri(options.iri!);
      this.router.push({
        path: "/" + pathUrl
      });
    } else {
      window.open(Env.DIRECTORY_URL + pathUrl);
    }
  }

  public directWithConfirmation(iri: string, action: string, component: CreateComponentPublicInstance<any>, appRoute: string) {
    component.$confirm.require({
      message: this._message,
      header: "Confirmation",
      icon: "fa-solid fa-triangle-exclamation",
      accept: () => {
        this.directTo({ iri: iri, action: action, appRoute: appRoute, newTab: true });
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }

  public file() {
    this.directTo({ action: "Filed", appRoute: "filer", newTab: true });
  }

  public view(iri: string) {
    this.directTo({ iri: iri, action: "Viewed", appRoute: "directory/folder", newTab: true });
  }

  public select(iri: string) {
    this.directTo({ iri: iri, action: "Viewed", appRoute: "directory/folder", newTab: false });
  }

  public edit(iri: string, openInNewTab?: boolean) {
    if (iri) this.directTo({ iri: iri, action: "Edited", appRoute: "editor", newTab: openInNewTab });
    else this.directTo({ appRoute: "editor", newTab: true });
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

  public workflow() {
    this.directTo({ appRoute: "workflow", newTab: true });
  }

  public codeGenerator() {
    this.directTo({ appRoute: "codeGenerator" });
  }
}
