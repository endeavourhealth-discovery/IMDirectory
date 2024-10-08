import { EntityService } from "@/services";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEditorStore } from "@/stores/editorStore";
import { useQueryStore } from "@/stores/queryStore";
import { urlToIri } from "@im-library/helpers/Converters";
import { RouteLocationNormalized, Router } from "vue-router";

export function directoryGuard(iri: string | string[], to: RouteLocationNormalized, from: RouteLocationNormalized) {
  if (to.matched.some((record: any) => record.name === "Directory") && iri) {
    const directoryStore = useDirectoryStore();
    directoryStore.updateConceptIri(iri as string);
  }
}

export async function editorGuard(iri: string | string[], to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router) {
  if (to.name?.toString() == "Editor" && iri && typeof iri === "string") {
    const editorStore = useEditorStore();
    if (iri) editorStore.updateEditorIri(iri);
    try {
      if (!(await EntityService.iriExists(urlToIri(iri)))) {
        await router.push({ name: "EntityNotFound", params: { iri: iri } });
      }
    } catch (_error) {
      await router.push({ name: "EntityNotFound", params: { iri: iri } });
    }
  }
}

export async function queryGuard(iri: string | string[], to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router) {
  if (to.name?.toString() == "Query") {
    const queryStore = useQueryStore();
    const queryIri = to.params.queryIri;
    if (queryIri && typeof queryIri === "string") {
      queryStore.updateQueryIri(queryIri);
      try {
        if (!(await EntityService.iriExists(urlToIri(queryIri)))) {
          await router.push({ name: "EntityNotFound", params: { iri: queryIri } });
        }
      } catch (_error) {
        await router.push({ name: "EntityNotFound", params: { iri: queryIri } });
      }
    } else queryStore.updateQueryIri("");
  }
}
