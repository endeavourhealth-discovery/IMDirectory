import { RouteLocationNormalized, Router } from "vue-router";
import { directToLogin } from "./intercepts";
import { useUserStore } from "vue-library/stores";
import { useSharedStore } from "@/stores/sharedStore";
import { UserRole } from "vue-library/enums";
import { computed } from "vue";

export async function requiresAuthGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const userStore = useUserStore();
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    if (!isLoggedIn.value) {
      await directToLogin(router);
      return true;
    }
  }
  return false;
}

export async function requiresAdmin(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    const userStore = useUserStore();
    const currentUser = computed(() => userStore.currentUser);
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const hasPermission: boolean = currentUser.value?.roles.includes(UserRole.ADMIN)!!;
    if (!isLoggedIn.value) {
      await directToLogin(router);
      return true;
    } else if (!hasPermission) {
      await router.push({ name: "AccessDenied" });
      return true;
    } else {
      return false;
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
    const currentUser = computed(() => userStore.currentUser);
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const hasPermission: boolean = currentUser.value?.roles.includes(UserRole.CREATOR)!!;
    if (!isLoggedIn.value) {
      await directToLogin(router);
      return true;
    } else if (!hasPermission) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: "create", accessType: "role" } });
      return true;
    } else {
      return false;
    }
  }
  return false;
}

export async function requiresEditRole(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.matched.some(record => record.meta.requiresEditRole)) {
    const userStore = useUserStore();
    const currentUser = computed(() => userStore.currentUser);
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const hasPermission: boolean = currentUser.value?.roles.includes(UserRole.EDITOR)!!;
    if (!isLoggedIn.value) {
      await directToLogin(router);
      return true;
    } else if (!hasPermission) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: "edit", accessType: "role" } });
      return true;
    } else {
      return false;
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
    if (userStore.isLoggedIn) isEditAllowed = userStore.currentUser?.roles.includes(UserRole.EDITOR)!!;
    if (!isEditAllowed) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: iri.slice(0, iri.indexOf("#") + 1), accessType: "organisation" } });
      return true;
    }
  }
  return false;
}
