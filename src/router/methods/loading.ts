import { useLoadingStore } from "@/stores/loadingStore";
import { RouteLocationNormalized, RouteRecordRaw } from "vue-router";

export function startRouterLoading(routes: Array<RouteRecordRaw>, to: RouteLocationNormalized, from: RouteLocationNormalized) {
  const loadingStore = useLoadingStore();
  if (getViewPathFromRoutePath(to, routes) !== getViewPathFromRoutePath(from, routes)) {
    loadingStore.updateViewsLoading(true);
  }
  if (isRoutingWithinSameView(to, from, routes, "/directory")) {
    loadingStore.updateDirectoryLoading(true);
  }
  if (isRoutingWithinSameView(to, from, routes, "/uprn")) {
    loadingStore.updateUprnLoading(true);
  }
  if (isRoutingWithinSameView(to, from, routes, "/admin")) {
    loadingStore.updateAdminToolboxLoading(true);
  }
  if (isRoutingWithinSameView(to, from, routes, "/workflow")) {
    loadingStore.updateWorkflowLoading(true);
  }
  if (isRoutingWithinSameView(to, from, routes, "/user")) {
    loadingStore.updateAuthLoading(true);
  }
}

export function endRouterLoading() {
  const loadingStore = useLoadingStore();
  if (loadingStore.viewsLoading) {
    loadingStore.updateViewsLoading(false);
  }
  if (loadingStore.directoryLoading) {
    loadingStore.updateDirectoryLoading(false);
  }
  if (loadingStore.uprnLoading) {
    loadingStore.updateUprnLoading(false);
  }
  if (loadingStore.adminToolboxLoading) {
    loadingStore.updateAdminToolboxLoading(false);
  }
  if (loadingStore.workflowLoading) {
    loadingStore.updateWorkflowLoading(false);
  }
  if (loadingStore.authLoading) {
    loadingStore.updateAuthLoading(false);
  }
}

function getViewPathFromRoutePath(routeLocation: RouteLocationNormalized, routes: Array<RouteRecordRaw>): string {
  if (routeLocation.fullPath === "/") {
    const found = routes.find(r => r.name === "Directory");
    if (found) return found.path;
  } else {
    const found = routes.find(r => routeLocation.fullPath.startsWith(r.path));
    if (found) return found.path;
  }
  throw new Error("Failed to find view path from route path: " + routeLocation.fullPath);
}

function isRoutingWithinSameView(to: RouteLocationNormalized, from: RouteLocationNormalized, routes: Array<RouteRecordRaw>, viewPath: string): boolean {
  return getViewPathFromRoutePath(to, routes) === viewPath && getViewPathFromRoutePath(from, routes) === viewPath && to.fullPath !== from.fullPath;
}
