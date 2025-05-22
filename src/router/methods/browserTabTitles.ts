import { useDirectoryStore } from "@/stores/directoryStore";
import { useEditorStore } from "@/stores/editorStore";
import { useQueryStore } from "@/stores/queryStore";
import { nextTick } from "vue";
import { RouteLocationNormalized } from "vue-router";

export async function setBrowserTabTitles(to: RouteLocationNormalized) {
  const APP_TITLE = "IM";
  const directoryStore = useDirectoryStore();
  const editorStore = useEditorStore();
  const queryStore = useQueryStore();
  let title = (to.meta.title as string) ? (to.meta.title as string) : "";
  if (to.matched.some(record => record.name === "Directory")) {
    if (!to.meta.title) title += await directoryStore.getConceptName();
  }
  if (to.matched.some(record => record.name === "Editor")) {
    title += "Editor: " + (await editorStore.getConceptName());
  }
  if (to.matched.some(record => record.name === "Query")) {
    title += "Query";
    if (to.params.queryIri) title += ": " + (await queryStore.getQueryName());
  }
  if (to.matched.some(record => record.name === "Uprn")) {
    title += "ASSIGN-UPRN";
  }
  await nextTick(() => {
    document.title = APP_TITLE + (title ? " - " : "") + title;
  });
}
