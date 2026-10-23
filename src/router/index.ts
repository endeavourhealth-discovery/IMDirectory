import { isUser } from "@endeavour/vue-library";
import { useUserStore } from "@endeavour/vue-library/stores";

import { createRouter, createWebHashHistory } from "vue-router";

import { AuthService, SecurityService } from "@/services";

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

// Coming back from Casdoor, the sign-in must be finished (which restores the address bar) before the router reads the address.
// This has to happen here: top-level await does not hold back sibling imports, only modules that import this one.
await AuthService.completeSigninIfRedirected();

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, from) => {
  startRouterLoading(routes, to, from);
  const iri = to.params.selectedIri;
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
