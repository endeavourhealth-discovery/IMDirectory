import { EntityService } from "@/services";
import { useCreatorStore } from "@/stores/creatorStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEditorStore } from "@/stores/editorStore";
import { useQueryStore } from "@/stores/queryStore";
import { urlToIri } from "@/helpers/Converters";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { RouteLocationNormalized, Router } from "vue-router";

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
      if (!(await EntityService.iriExists(urlToIri(iri)))) {
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
        if (!(await EntityService.iriExists(urlToIri(queryIri)))) {
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
      if (!(await EntityService.iriExists(iri))) {
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
