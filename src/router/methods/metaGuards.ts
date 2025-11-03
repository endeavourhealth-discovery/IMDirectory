import { CasbinService, CasdoorService, UserService } from "@/services";
import { RouteLocationNormalized, Router } from "vue-router";
import { directToLogin } from "./intercepts";
import { useUserStore } from "@/stores/userStore";
import { useSharedStore } from "@/stores/sharedStore";
import { UserRole } from "@/enums";
import { Action, Resource } from "@/interfaces/AutoGen";

export async function requiresAuthGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const user = await CasdoorService.getUser();
    if (!user) {
      await directToLogin(router);
      return false;
    }
  }
  return false;
}

export async function requiresAdmin(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    const user = await CasdoorService.getUser();
    const hasPermission = await CasbinService.hasPermission(Resource.PAGE_ADMIN, Action.READ);
    if (!user) {
      await directToLogin(router);
      return false;
    } else if (!hasPermission) {
      await router.push({ name: "AccessDenied" });
      return false;
    } else {
      return true;
    }
  }
  return false;
}

export async function requiresReAuth(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.matched.some(record => record.meta.requiresReAuth)) {
    await directToLogin(router);
    return true;
  }
  return false;
}

export async function requiresCreateRole(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.matched.some(record => record.meta.requiresCreateRole)) {
    const userStore = useUserStore();
    const user = await CasdoorService.getUser();
    const hasPermission = await CasbinService.hasPermission(Resource.PAGE_CREATOR, Action.READ);
    if (!user) {
      await directToLogin(router);
      return false;
    } else if (!hasPermission) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: "create", accessType: "role" } });
      return false;
    } else {
      return true;
    }
  }
  return false;
}

export async function requiresEditRole(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.matched.some(record => record.meta.requiresEditRole)) {
    const userStore = useUserStore();
    const user = await CasdoorService.getUser();
    const hasPermission = await CasbinService.hasPermission(Resource.PAGE_EDITOR, Action.READ);
    if (!user) {
      await directToLogin(router);
      return true;
    } else if (!hasPermission) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: "edit", accessType: "role" } });
      return false;
    } else {
      return true;
    }
  }
  return false;
}

export function requiresSnomedLicense(to: RouteLocationNormalized) {
  if (to.matched.some(record => record.meta.requiresLicense)) {
    const sharedStore = useSharedStore();
    const userStore = useUserStore();
    if (!userStore.snomedLicenseAccepted) sharedStore.updateShowSnomedLicense(true);
  }
}

export function requiresUprnAgreement(to: RouteLocationNormalized) {
  if (to.matched.some(record => record.meta.requiresUprnAgreement)) {
    const userStore = useUserStore();
    const sharedStore = useSharedStore();
    if (!userStore.uprnAgreementAccepted) sharedStore.updateShowUprnConsent(true);
  }
}

export async function requiresOrganisation(iri: string | string[], to: RouteLocationNormalized, router: Router) {
  if (to.matched.some(record => record.meta.requiresOrganisation)) {
    const userStore = useUserStore();
    let isEditAllowed = false;
    if (userStore.isLoggedIn) isEditAllowed = await UserService.canUserEdit(iri as string);
    if (!isEditAllowed) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: iri.slice(0, iri.indexOf("#") + 1), accessType: "organisation" } });
      return true;
    }
  }
  return false;
}
