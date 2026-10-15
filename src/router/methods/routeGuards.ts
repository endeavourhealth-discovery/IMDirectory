import { isObjectHasKeys, urlToIri } from "@endeavour/vue-library/helpers";

import { RouteLocationNormalized, Router } from "vue-router";

import { EntityService } from "@/services";
import { cachedRequest } from "@/services/requestCache";
import { useCreatorStore } from "@/stores/creatorStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEditorStore } from "@/stores/editorStore";
import { useQueryStore } from "@/stores/queryStore";

const IRI_EXISTS_TTL = 5 * 60 * 1000;

/** Only a positive answer is reused, so an entity created since a "not found" is still picked up. */
function iriExists(iri: string): Promise<boolean> {
  return cachedRequest(`iriExists|${iri}`, () => EntityService.iriExists(iri), IRI_EXISTS_TTL, exists => exists === true);
}

export function directoryGuard(iri: string | string[], to: RouteLocationNormalized) {
  if (to.matched.some(record => record.name === "Directory") && iri) {
    const directoryStore = useDirectoryStore();
    directoryStore.updateConceptIri(iri as string);
  }
}

export async function editorGuard(iri: string | string[], to: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.name?.toString() == "Editor" && iri && typeof iri === "string") {
    const editorStore = useEditorStore();
    if (iri) editorStore.updateEditorIri(iri);
    try {
      if (!(await iriExists(urlToIri(iri)))) {
        await router.push({ name: "EntityNotFound", params: { iri: iri } });
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      await router.push({ name: "EntityNotFound", params: { iri: iri } });
      return true;
    }
  }
  return false;
}

export async function queryGuard(to: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.name?.toString() == "Query") {
    const queryStore = useQueryStore();
    const queryIri = to.params.queryIri;
    if (queryIri && typeof queryIri === "string") {
      queryStore.updateQueryIri(queryIri);
      try {
        if (!(await iriExists(urlToIri(queryIri)))) {
          await router.push({ name: "EntityNotFound", params: { iri: queryIri } });
          return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        await router.push({ name: "EntityNotFound", params: { iri: queryIri } });
        return true;
      }
    } else queryStore.updateQueryIri("");
  }
  return false;
}

export async function pageNotFoundFromCreator(to: RouteLocationNormalized, router: Router) {
  if (to.name === "PageNotFound" && to.path.startsWith("/creator/")) {
    await router.push({ name: "Creator" });
  }
}

export async function pageNotFoundFromEditor(to: RouteLocationNormalized, router: Router) {
  if (to.name === "PageNotFound" && to.path.startsWith("/editor/")) {
    const urlSections = to.path.split("/");
    if (urlSections.length > 2) {
      const selectedIriParam = to.path.split("/")[2];
      if (!selectedIriParam) await router.push({ name: "EntityNotFound", params: { iri: selectedIriParam } });
      else await router.push({ name: "Editor", params: { selectedIri: urlToIri(selectedIriParam) } });
    } else await router.push({ name: "Editor" });
  }
}

export async function viewerIriExistsGuard(to: RouteLocationNormalized, router: Router) {
  if (to.name === "Folder" && isObjectHasKeys(to.params, ["selectedIri"]) && to.params.selectedIri !== "http://endhealth.info/im#Favourites") {
    const iri = to.params.selectedIri as string;
    try {
      new URL(iri);
      if (!(await iriExists(iri))) {
        await router.push({ name: "EntityNotFound", params: { iri: iri } });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      await router.push({ name: "EntityNotFound", params: { iri: iri } });
    }
  }
}

export function creatorSaveChangesWarning(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  if (from.path.startsWith("/creator/") && !to.path.startsWith("/creator/")) {
    const creatorStore = useCreatorStore();
    if (creatorStore.creatorHasChanges) {
      if (!window.confirm("Are you sure you want to leave this page. Unsaved changes will be lost.")) {
        return false;
      }
    }
  }
}

export function editorSaveChangesWarning(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  if (from.path.startsWith("/editor/") && !to.path.startsWith("/editor/")) {
    const editorStore = useEditorStore();
    if (editorStore.editorHasChanges) {
      if (!window.confirm("Are you sure you want to leave this page. Unsaved changes will be lost.")) {
        return false;
      }
    }
  }
}
