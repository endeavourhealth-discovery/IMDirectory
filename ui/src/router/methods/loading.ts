import { useLoadingStore } from "@/stores/loadingStore";
import { RouteLocationNormalized, RouteRecordRaw } from "vue-router";

export function startRouterLoading(routes: Array<RouteRecordRaw>, to: RouteLocationNormalized, from: RouteLocationNormalized) {
  const loadingStore = useLoadingStore();
  if (routes.findIndex(view => view.name === to.meta.name) != -1) {
    loadingStore.updateViewsLoading(true);
  }
  if (to.matched.some((record: any) => record.name === "Directory") && to.name !== from.name) {
    loadingStore.updateDirectoryLoading(true);
  }
  if (to.matched.some(record => record.name === "Uprn") && to.name !== from.name) {
    loadingStore.updateUprnLoading(true);
  }
}

export function endRouterLoading(routes: Array<RouteRecordRaw>, to: RouteLocationNormalized) {
  const loadingStore = useLoadingStore();
  if (routes.findIndex(view => view.name === to.meta.name) != -1) {
    loadingStore.updateViewsLoading(false);
  }
  if (to.matched.some((record: any) => record.name === "Directory")) {
    loadingStore.updateDirectoryLoading(false);
  }
  if (to.matched.some(record => record.name === "Uprn")) {
    loadingStore.updateUprnLoading(false);
  }
}
