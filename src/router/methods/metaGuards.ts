import { computed } from "vue";

import { UserRole } from "@endeavour/vue-library/enums";
import { useUserStore } from "@endeavour/vue-library/stores";

import { RouteLocationNormalized, Router } from "vue-router";

import { useSharedStore } from "@/stores/sharedStore";

import { directToLogin } from "./intercepts";

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

export async function requiresReAuth(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  if (to.matched.some(record => record.meta.requiresReAuth)) {
    await directToLogin(router);
    return true;
  }
  return false;
}

export async function requiresRole(to: RouteLocationNormalized, from: RouteLocationNormalized, router: Router): Promise<boolean> {
  console.log("Requires Role");
  if (to.meta.requiresRole && to.meta.requiresRole.length > 0) {
    console.log("Yes : ");
    console.log(to.meta.requiresRole);
    const userStore = useUserStore();
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    if (!isLoggedIn.value) {
      await directToLogin(router);
      return true;
    }

    const currentUser = computed(() => userStore.currentUser);
    const hasPermission: boolean = to.meta.requiresRole.some(r => currentUser.value?.roles.includes(r));

    if (hasPermission) {
      return false;
    } else {
      await router.push({ name: "AccessDenied", params: { requiredAccess: to.meta.requiresRole.toString(), accessType: "role" } });
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
    if (userStore.isLoggedIn) isEditAllowed = userStore.currentUser?.roles.includes(UserRole.EDITOR)!!;
    if (!isEditAllowed) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: iri.slice(0, iri.indexOf("#") + 1), accessType: "organisation" } });
      return true;
    }
  }
  return false;
}
