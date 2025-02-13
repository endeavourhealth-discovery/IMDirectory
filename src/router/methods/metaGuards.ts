import { AuthService, UserService } from "@/services";
import { RouteLocationNormalized, Router } from "vue-router";
import { directToLogin } from "./intercepts";
import { useUserStore } from "@/stores/userStore";
import { useSharedStore } from "@/stores/sharedStore";

export async function requiresAuthGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router) {
  if (to.matched.some((record: any) => record.meta.requiresAuth)) {
    const { user } = await AuthService.getCurrentAuthenticatedUser();
    if (!user) {
      if (from.name === "Logout") {
        await router.push({ name: "LandingPage" });
        return false;
      } else {
        await directToLogin(router);
        return false;
      }
    }
  }
}

export async function requiresAdmin(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router) {
  if (to.matched.some((record: any) => record.meta.requiresAdmin)) {
    const { user } = await AuthService.getCurrentAuthenticatedUser();
    if (!user?.roles.includes("IMAdmin")) {
      if (from.name === "Logout") {
        await router.push({ name: "LandingPage" });
        return false;
      } else {
        await directToLogin(router);
        return false;
      }
    }
  }
}

export async function requiresReAuth(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router) {
  if (to.matched.some((record: any) => record.meta.requiresReAuth)) {
    if (!(from.name === "Login" || from.name === "MFALogin")) {
      console.log("requires re-authentication");
      await directToLogin(router);
      return false;
    }
  }
}

export async function requiresCreateRole(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router) {
  if (to.matched.some((record: any) => record.meta.requiresCreateRole)) {
    const userStore = useUserStore();
    const { status } = await AuthService.getCurrentAuthenticatedUser();
    if (status !== 200) {
      await directToLogin(router);
      return false;
    } else if (!userStore.currentUser?.roles?.includes("create")) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: "create", accessType: "role" } });
    }
  }
}

export async function requiresEditRole(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router) {
  if (to.matched.some((record: any) => record.meta.requiresEditRole)) {
    const userStore = useUserStore();
    const { status } = await AuthService.getCurrentAuthenticatedUser();
    if (status !== 200) {
      await directToLogin(router);
      return false;
    } else if (!userStore.currentUser?.roles?.includes("edit")) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: "edit", accessType: "role" } });
    }
  }
}

export function requiresSnomedLicense(to: RouteLocationNormalized) {
  if (to.matched.some((record: any) => record.meta.requiresLicense)) {
    const sharedStore = useSharedStore();
    const userStore = useUserStore();
    if (!userStore.snomedLicenseAccepted) sharedStore.updateShowSnomedLicense(true);
  }
}

export function requiresUprnAgreement(to: RouteLocationNormalized) {
  if (to.matched.some((record: any) => record.meta.requiresUprnAgreement)) {
    const userStore = useUserStore();
    const sharedStore = useSharedStore();
    if (!userStore.uprnAgreementAccepted) sharedStore.updateShowUprnConsent(true);
  }
}

export async function requiresOrganisation(iri: string | string[], to: RouteLocationNormalized, router: Router) {
  if (to.matched.some((record: any) => record.meta.requiresOrganisation)) {
    const userStore = useUserStore();
    let isEditAllowed = false;
    if (userStore.isLoggedIn) isEditAllowed = await UserService.canUserEdit(iri as string);
    if (!isEditAllowed) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: iri.slice(0, iri.indexOf("#") + 1), accessType: "organisation" } });
    }
  }
}
