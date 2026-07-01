import { useUserStore } from "@endeavour/vue-library/stores";

import { createRouter, createWebHashHistory } from "vue-router";

import { SecurityService } from "@/services";
import { useAuthStore } from "@/stores/authStore";

import { setBrowserTabTitles } from "./methods/browserTabTitles";
import { endRouterLoading, startRouterLoading } from "./methods/loading";
import { requiresAuthGuard, requiresOrganisation, requiresReAuth, requiresRole, requiresSnomedLicense, requiresUprnAgreement } from "./methods/metaGuards";
import {
  creatorSaveChangesWarning,
  directoryGuard,
  editorGuard,
  editorSaveChangesWarning,
  pageNotFoundFromCreator,
  pageNotFoundFromEditor,
  queryGuard,
  viewerIriExistsGuard
} from "./methods/routeGuards";
import routes from "./methods/routes";
import { setModes } from "./methods/setModes";

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

const errorRoutes = ["/error", "/500", "/404", "/401"];
const skipModeNames = ["Callback", "PageNotFound"];

router.beforeEach(async (to, from) => {
  if (!skipModeNames.includes(to.name as string) && !errorRoutes.includes(to.path)) await setModes();
  startRouterLoading(routes, to, from);
  const authStore = useAuthStore();
  const currentPath = to.path;
  authStore.updateAuthReturnPath(currentPath);
  const iri = to.params.selectedIri;
  const userStore = useUserStore();
  try {
    const user = await SecurityService.getUser(true);
    if (user) userStore.updateCurrentUser(user);
  } catch (e: any) {
    console.log("No user session found");
  }
  let routedByGuard: boolean;
  routedByGuard = await requiresAuthGuard(to, from, router);
  if (routedByGuard) return false;
  routedByGuard = await requiresReAuth(to, from, router);
  if (routedByGuard) return false;
  routedByGuard = await requiresRole(to, from, router);
  if (routedByGuard) return false;
  requiresSnomedLicense(to);
  requiresUprnAgreement(to);
  routedByGuard = await requiresOrganisation(iri, to, router);
  if (routedByGuard) return false;
  directoryGuard(iri, to);
  routedByGuard = await editorGuard(iri, to, router);
  if (routedByGuard) return false;
  routedByGuard = await queryGuard(to, router);
  if (routedByGuard) return false;
  await pageNotFoundFromCreator(to, router);
  await pageNotFoundFromEditor(to, router);
  await viewerIriExistsGuard(to, router);
  creatorSaveChangesWarning(to, from);
  editorSaveChangesWarning(to, from);
});

router.afterEach(async to => {
  await setBrowserTabTitles(to);
  endRouterLoading();
});

export default router;
