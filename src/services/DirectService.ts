import { ComponentPublicInstance } from "vue";
import { Router, useRouter } from "vue-router";
import { RecentActivityItem } from "@/interfaces";
import Env from "./Env";
import { useUserStore } from "@/stores/userStore";
import { useDirectoryStore } from "@/stores/directoryStore";

export default class DirectService {
  private readonly directoryStore;
  private readonly userStore;
  private readonly _message: string;
  private readonly router: Router;

  constructor() {
    this.router = useRouter();
    this.directoryStore = useDirectoryStore();
    this.userStore = useUserStore();
    this._message = "You will be directed to a different application. Are you sure you want to proceed?";
  }

  private async directTo(options: { iri?: string; action?: string; appRoute: string; newTab?: boolean }) {
    let pathUrl = "";
    pathUrl += options.appRoute + "/";
    if (options.iri) pathUrl += encodeURIComponent(options.iri);
    if (options.action && options.iri) {
      await this.userStore.updateRecentLocalActivity({ iri: options.iri, dateTime: new Date(), action: options.action } as RecentActivityItem);
    }
    if (!options.newTab) {
      if (options.iri) this.directoryStore.updateConceptIri(options.iri);
      await this.router.push({
        path: "/" + pathUrl
      });
    } else {
      window.open(Env.DIRECTORY_URL + pathUrl);
    }
  }

  public directWithConfirmation(iri: string, action: string, component: ComponentPublicInstance, appRoute: string) {
    component.$confirm.require({
      message: this._message,
      header: "Confirmation",
      icon: "fa-solid fa-triangle-exclamation",
      accept: async () => {
        await this.directTo({ iri: iri, action: action, appRoute: appRoute, newTab: true });
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }

  public async file() {
    await this.directTo({ action: "Filed", appRoute: "filer", newTab: true });
  }

  public async view(iri: string) {
    await this.directTo({ iri: iri, action: "Viewed", appRoute: "directory/folder", newTab: true });
  }

  public async select(iri: string) {
    await this.directTo({ iri: iri, action: "Viewed", appRoute: "directory/folder", newTab: false });
  }

  public async edit(iri: string, openInNewTab?: boolean) {
    if (iri) await this.directTo({ iri: iri, action: "Edited", appRoute: "editor", newTab: openInNewTab });
    else await this.directTo({ appRoute: "editor", newTab: true });
  }

  public async query() {
    await this.directTo({ action: "Queried", appRoute: "query", newTab: true });
  }

  public async create(typeIri?: string, propertyIri?: string, valueIri?: string) {
    if (!typeIri && !propertyIri && !valueIri) {
      await this.directTo({ appRoute: "creator", newTab: true });
    } else {
      const routeData = this.router.resolve({ name: "Creator", query: { typeIri: typeIri, propertyIri: propertyIri, valueIri: valueIri } });
      await this.directTo({ appRoute: routeData.href.replace("#/", ""), newTab: true });
    }
  }

  public async uprn() {
    await this.directTo({ appRoute: "uprn", newTab: true });
  }

  public async workflow() {
    await this.directTo({ appRoute: "workflow", newTab: true });
  }

  public async codeGenerator() {
    await this.directTo({ appRoute: "codeGenerator" });
  }
}
