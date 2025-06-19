import { createRouter, createWebHashHistory } from "vue-router";

import { useAuthStore } from "@/stores/authStore";
import { endRouterLoading, startRouterLoading } from "./methods/loading";
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
import {
  requiresAdmin,
  requiresAuthGuard,
  requiresCreateRole,
  requiresEditRole,
  requiresOrganisation,
  requiresReAuth,
  requiresSnomedLicense,
  requiresUprnAgreement
} from "./methods/metaGuards";
import { setBrowserTabTitles } from "./methods/browserTabTitles";
import routes from "./methods/routes";
import { setModes } from "./methods/setModes";

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, from) => {
  if (to.name !== "Login") await setModes();
  startRouterLoading(routes, to, from);
  const authStore = useAuthStore();
  const currentPath = to.path;
  authStore.updateAuthReturnPath(currentPath);
  const iri = to.params.selectedIri;
  let routedByGuard: boolean;
  routedByGuard = await requiresAuthGuard(to, from, router);
  if (routedByGuard) return false;
  routedByGuard = await requiresAdmin(to, from, router);
  if (routedByGuard) return false;
  routedByGuard = await requiresReAuth(to, from, router);
  if (routedByGuard) return false;
  routedByGuard = await requiresCreateRole(to, from, router);
  if (routedByGuard) return false;
  routedByGuard = await requiresEditRole(to, from, router);
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
