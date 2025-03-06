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
  await setModes();
  startRouterLoading(routes, to, from);
  const authStore = useAuthStore();
  const currentPath = to.path;
  authStore.updateAuthReturnPath(currentPath);
  const iri = to.params.selectedIri;
  await requiresAuthGuard(to, from, router);
  await requiresAdmin(to, from, router);
  await requiresReAuth(to, from, router);
  await requiresCreateRole(to, from, router);
  await requiresEditRole(to, from, router);
  requiresSnomedLicense(to);
  requiresUprnAgreement(to);
  await requiresOrganisation(iri, to, router);

  directoryGuard(iri, to, from);
  await editorGuard(iri, to, from, router);
  await queryGuard(iri, to, from, router);
  await pageNotFoundFromCreator(to, router);
  await pageNotFoundFromEditor(to, router);
  await viewerIriExistsGuard(to, router);
  creatorSaveChangesWarning(to, from);
  editorSaveChangesWarning(to, from);
});

router.afterEach(async to => {
  setBrowserTabTitles(to);
  endRouterLoading(routes, to);
});

export default router;
