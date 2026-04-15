import { RecentActivityItemDto, useUserStore } from "vue-library";

import { LocationQuery, useRouter } from "vue-router";

import Env from "@/services/Env";
import UserService from "@/services/UserService";
import { useDirectoryStore } from "@/stores/directoryStore";

export function useDirectService() {
  const router = useRouter();
  const directoryStore = useDirectoryStore();
  const userStore = useUserStore();

  const message = "You will be directed to a different application. Are you sure you want to proceed?";

  async function directTo(options: { iri?: string; action?: string; appRoute: string; query?: LocationQuery; newTab?: boolean }) {
    let pathUrl = "";
    pathUrl += options.appRoute + "/";

    if (options.iri) pathUrl += encodeURIComponent(options.iri);

    if (options.action && options.iri) {
      await userStore.updateRecentLocalActivity(
        {
          iri: options.iri,
          dateTime: new Date(),
          action: options.action
        } as RecentActivityItemDto,
        UserService
      );
    }

    if (!options.newTab) {
      if (options.iri) directoryStore.updateConceptIri(options.iri);

      await router.push({
        path: "/" + pathUrl,
        query: options.query
      });
    } else {
      window.open(Env.DIRECTORY_URL + pathUrl);
    }
  }

  async function file() {
    await directTo({ action: "Filed", appRoute: "filer", newTab: true });
  }

  async function view(iri: string) {
    await directTo({ iri, action: "Viewed", appRoute: "directory/folder", newTab: true });
  }

  async function select(iri: string) {
    await directTo({ iri, action: "Viewed", appRoute: "directory/folder", newTab: false });
  }

  async function edit(iri: string, openInNewTab?: boolean) {
    if (iri) {
      await directTo({ iri, action: "Edited", appRoute: "editor", newTab: openInNewTab });
    } else {
      await directTo({ appRoute: "editor", newTab: true });
    }
  }

  async function query() {
    await directTo({ action: "Queried", appRoute: "query", newTab: true });
  }

  async function create(typeIri?: string, propertyIri?: string, valueIri?: string) {
    if (!typeIri && !propertyIri && !valueIri) {
      await directTo({ appRoute: "creator", newTab: false });
    } else {
      const routeData = router.resolve({
        name: "Creator",
        query: { typeIri, propertyIri, valueIri }
      });

      await directTo({
        appRoute: routeData.href.replace("#/", ""),
        query: routeData.query,
        newTab: false
      });
    }
  }

  async function uprn() {
    await directTo({ appRoute: "uprn", newTab: true });
  }

  async function workflow() {
    await directTo({ appRoute: "workflow", newTab: true });
  }

  async function codeGenerator() {
    await directTo({ appRoute: "codeGenerator" });
  }

  return {
    file,
    view,
    select,
    edit,
    query,
    create,
    uprn,
    workflow,
    codeGenerator
  };
}
