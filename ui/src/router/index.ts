import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
const Directory = () => import("@/views/Directory.vue");
const DirectoryDetails = () => import("@/components/directory/DirectoryDetails.vue");
const SearchResults = () => import("@/components/shared/SearchResults.vue");
const LandingPage = () => import("@/components/directory/LandingPage.vue");
const EclSearch = () => import("@/components/directory/EclSearch.vue");
const IMQuerySearch = () => import("@/components/directory/IMQuerySearch.vue");
const Auth = () => import("@/views/Auth.vue");
const Login = () => import("@/components/auth/Login.vue");
const ConfirmCode = () => import("@/components/auth/ConfirmCode.vue");
const ForgotPassword = () => import("@/components/auth/ForgotPassword.vue");
const ForgotPasswordSubmit = () => import("@/components/auth/ForgotPasswordSubmit.vue");
const Logout = () => import("@/components/auth/Logout.vue");
const PasswordEdit = () => import("@/components/auth/PasswordEdit.vue");
const Register = () => import("@/components/auth/Register.vue");
const UserDetails = () => import("@/components/auth/UserDetails.vue");
const UserEdit = () => import("@/components/auth/UserEdit.vue");
const MFASetup = () => import("@/components/auth/MFASetup.vue");
const MFALogin = () => import("@/components/auth/MFALogin.vue");
const MFADelete = () => import("@/components/auth/MFADelete.vue");
const AdminToolbox = () => import("@/views/AdminToolbox.vue");
const Creator = () => import("@/views/Creator.vue");
const Editor = () => import("@/views/Editor.vue");
const AccessDenied = () => import("@/views/AccessDenied.vue");
const PageNotFound = () => import("@/views/PageNotFound.vue");
const EntityNotFound = () => import("@/views/EntityNotFound.vue");
const ServerOffline = () => import("@/views/ServerOffline.vue");
const VueError = () => import("@/views/VueError.vue");
const BugReport = () => import("@/views/BugReport.vue");
const SnomedLicense = () => import("@/views/SnomedLicense.vue");
const PrivacyPolicy = () => import("@/views/PrivacyPolicy.vue");
const Cookies = () => import("@/views/Cookies.vue");
const Workflow = () => import("@/views/Workflow.vue");
const Filer = () => import("@/views/Filer.vue");
const Uprn = () => import("@/views/Uprn.vue");
const SingleFileLookup = () => import("@/components/uprn/SingleAddressLookup.vue");
const AddressFileWorkflow = () => import("@/components/uprn/AddressFileWorkflow.vue");
const AddressFileDownload = () => import("@/components/uprn/AddressFileDownload.vue");
const Query = () => import("@/views/Query.vue");
const UprnAgreement = () => import("@/views/UprnAgreement.vue");

const CodeGen = () => import("@/views/CodeGen.vue");
import { AuthService, EntityService, Env, UserService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

import { nextTick, computed } from "vue";
import { urlToIri } from "@im-library/helpers/Converters";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";
import { useEditorStore } from "@/stores/editorStore";
import { useCreatorStore } from "@/stores/creatorStore";
import Swal, { SweetAlertResult } from "sweetalert2";
import { useLoadingStore } from "@/stores/loadingStore";
import { useQueryStore } from "@/stores/queryStore";

const APP_TITLE = "IM";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/directory",
    name: "Directory",
    component: Directory,
    meta: { requiresLicense: true, transition: "fade", mode: "out-in" },
    redirect: { name: "LandingPage" },
    children: [
      {
        alias: "/",
        path: "landingPage",
        name: "LandingPage",
        component: LandingPage,
        meta: {
          requiresLicense: true,
          transitionDelay: "0.2s",
          title: "Home"
        }
      },
      {
        path: "folder/:selectedIri",
        name: "Folder",
        component: DirectoryDetails,
        meta: {
          requiresLicense: true
        },
        props: true
      },
      {
        path: "search",
        name: "Search",
        component: SearchResults,
        meta: {
          requiresLicense: true,
          title: "Search"
        }
      },
      {
        path: "eclSearch",
        name: "EclSearch",
        component: EclSearch,
        meta: {
          requiresLicense: true,
          title: "Ecl search"
        }
      },
      {
        path: "IMQuerySearch",
        name: "IMQuerySearch",
        component: IMQuerySearch,
        meta: {
          requiresLicense: true,
          title: "Query search"
        }
      }
    ]
  },
  {
    path: "/user",
    name: "User",
    component: Auth,
    redirect: { name: "Login" },
    children: [
      {
        path: "login:returnUrl?",
        name: "Login",
        component: Login,
        meta: { title: "Login" }
      },
      {
        path: "confirm-code:returnUrl?",
        name: "ConfirmCode",
        component: ConfirmCode,
        meta: { title: "Confirm code" }
      },
      {
        path: "register:returnUrl?",
        name: "Register",
        component: Register,
        meta: { title: "Register" }
      },
      {
        path: "my-account:returnUrl?",
        name: "UserDetails",
        component: UserDetails,
        meta: {
          requiresAuth: true,
          title: "My account"
        }
      },
      {
        path: "my-account/edit:returnUrl?",
        name: "UserEdit",
        component: UserEdit,
        meta: {
          requiresAuth: true,
          title: "My account"
        }
      },
      {
        path: "my-account/password-edit:returnUrl?",
        name: "PasswordEdit",
        component: PasswordEdit,
        meta: {
          requiresAuth: true,
          title: "My account"
        }
      },
      {
        path: "logout:returnUrl?",
        name: "Logout",
        component: Logout,
        meta: { title: "Logout" }
      },
      {
        path: "password-recovery:returnUrl?",
        name: "ForgotPassword",
        component: ForgotPassword,
        meta: { title: "Reset password" }
      },
      {
        path: "password-recovery/submit:returnUrl?",
        name: "ForgotPasswordSubmit",
        component: ForgotPasswordSubmit,
        meta: { title: "Reset password" }
      },
      {
        path: "mfa-setup",
        name: "MFASetup",
        component: MFASetup,
        meta: { requiresReAuth: true, title: "My account" }
      },
      {
        path: "mfa-login",
        name: "MFALogin",
        component: MFALogin,
        meta: { title: "Login" }
      },
      {
        path: "mfa-delete",
        name: "MFADelete",
        component: MFADelete,
        meta: { requiresReAuth: true, title: "My account" }
      }
    ]
  },
  {
    path: "/admin",
    name: "Admin",
    component: AdminToolbox,
    meta: { requiresAdmin: true }
  },
  {
    path: "/creator",
    name: "Creator",
    component: Creator,
    meta: {
      requiresAuth: true,
      requiresCreateRole: true,
      title: "Creator"
    }
  },
  {
    path: "/editor/:selectedIri?",
    name: "Editor",
    props: true,
    component: Editor,
    meta: {
      requiresAuth: true,
      requiresLicense: true,
      requiresEditRole: true,
      requiresOrganisation: true
    }
  },
  {
    path: "/workflow",
    name: "Workflow",
    component: Workflow,
    meta: {
      requiresAuth: true,
      requiresLicense: true
    }
  },
  {
    path: "/filer",
    name: "Filer",
    component: Filer,
    meta: {
      requiresAuth: true,
      requiresLicense: true,
      title: "Filer"
    }
  },
  {
    path: "/uprn",
    name: "Uprn",
    component: Uprn,
    redirect: { name: "SingleAddressLookup" },
    meta: {
      requiresAuth: true,
      requiresUprnAgreement: true
    },
    children: [
      { path: "singleAddressLookup", name: "SingleAddressLookup", component: SingleFileLookup },
      { path: "addressFileWorkflow", name: "AddressFileWorkflow", component: AddressFileWorkflow },
      { path: "addressFileDownload", name: "AddressFileDownload", component: AddressFileDownload }
    ]
  },
  {
    path: "/query/:queryIri?",
    name: "Query",
    component: Query,
    meta: {
      requiresAuth: true,
      requiresLicense: true,
      requiresCreateRole: true
    }
  },
  {
    path: "/codeGenerator",
    name: "CodeGenerator",
    component: CodeGen,
    meta: {
      requiresAuth: true,
      requiresLicense: true,
      title: "Code generator"
    }
  },
  {
    path: "/snomedLicense",
    name: "License",
    component: SnomedLicense,
    meta: { title: "Snomed license" }
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: PrivacyPolicy,
    meta: { title: "Privacy" }
  },
  { path: "/cookies", name: "Cookies", component: Cookies, meta: { view: true, title: "Cookies" } },
  {
    path: "/uprn-agreement",
    name: "UPRNAgreement",
    component: UprnAgreement,
    meta: { title: "UPRN agreement" }
  },
  {
    path: "/401/:requiredAccess?:accessType?",
    name: "AccessDenied",
    component: AccessDenied,
    props: true,
    meta: { title: "Access denied" }
  },
  {
    path: "/404/:iri?",
    name: "EntityNotFound",
    component: EntityNotFound,
    props: true,
    meta: { title: "404" }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "PageNotFound",
    component: PageNotFound,
    meta: { title: "Page not found" }
  },
  {
    path: "/500",
    name: "ServerOffline",
    component: ServerOffline,
    meta: { title: "Error" }
  },
  {
    path: "/error",
    name: "VueError",
    component: VueError,
    meta: { title: "Error" }
  },
  {
    path: "/bugReport",
    name: "BugReport",
    component: BugReport,
    meta: {
      requiresAuth: true,
      title: "Submit bug report"
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

async function directToLogin() {
  await Swal.fire({
    icon: "warning",
    title: "Please Login to continue",
    showCancelButton: true,
    confirmButtonText: "Login",
    reverseButtons: true
  }).then((result: SweetAlertResult) => {
    if (result.isConfirmed) {
      console.log("redirecting to login");
      router.push({ name: "Login" });
    } else {
      console.log("redirecting to landing page");
      router.push({ name: "LandingPage" });
    }
  });
}

router.beforeEach(async (to, from) => {
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
  const directoryStore = useDirectoryStore();
  const authStore = useAuthStore();
  const creatorStore = useCreatorStore();
  const editorStore = useEditorStore();
  const userStore = useUserStore();
  const queryStore = useQueryStore();

  const currentPath = to.path;

  authStore.updateAuthReturnPath(currentPath);

  const iri = to.params.selectedIri;
  if (to.matched.some((record: any) => record.name === "Directory") && iri) {
    directoryStore.updateConceptIri(iri as string);
  }
  if (to.name?.toString() == "Editor" && iri && typeof iri === "string") {
    if (iri) editorStore.updateEditorIri(iri);
    try {
      if (!(await EntityService.iriExists(urlToIri(iri)))) {
        await router.push({ name: "EntityNotFound", params: { iri: iri } });
      }
    } catch (_error) {
      await router.push({ name: "EntityNotFound", params: { iri: iri } });
    }
  }
  if (to.name?.toString() == "Query") {
    const queryIri = to.params.queryIri;
    if (queryIri && typeof queryIri === "string") {
      queryStore.updateQueryIri(queryIri);
      try {
        if (!(await EntityService.iriExists(urlToIri(queryIri)))) {
          await router.push({ name: "EntityNotFound", params: { iri: queryIri } });
        }
      } catch (_error) {
        await router.push({ name: "EntityNotFound", params: { iri: queryIri } });
      }
    } else queryStore.updateQueryIri("");
  }
  if (to.matched.some((record: any) => record.meta.requiresAuth)) {
    const { user } = await AuthService.getCurrentAuthenticatedUser();
    console.log("auth guard user authenticated: " + user ? "true" : "false");
    if (!user) {
      if (from.name === "Logout") {
        await router.push({ name: "LandingPage" });
        return false;
      } else {
        await directToLogin();
        return false;
      }
    }
  }

  if (to.matched.some((record: any) => record.meta.requiresAdmin)) {
    const { user } = await AuthService.getCurrentAuthenticatedUser();
    console.log("auth guard user authenticated: " + user ? "true" : "false");
    if (!user?.roles.includes("IMAdmin")) {
      if (from.name === "Logout") {
        await router.push({ name: "LandingPage" });
        return false;
      } else {
        await directToLogin();
        return false;
      }
    }
  }

  if (to.matched.some((record: any) => record.meta.requiresReAuth)) {
    if (!(from.name === "Login" || from.name === "MFALogin")) {
      console.log("requires re-authentication");
      await directToLogin();
      return false;
    }
  }

  if (to.matched.some((record: any) => record.meta.requiresCreateRole)) {
    const { status } = await AuthService.getCurrentAuthenticatedUser();
    console.log("auth guard user authenticated: " + (status === 200 ? "true" : "false"));
    if (status !== 200) {
      await directToLogin();
      return false;
    } else if (!userStore.currentUser?.roles?.includes("create")) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: "create", accessType: "role" } });
    }
  }

  if (to.matched.some((record: any) => record.meta.requiresEditRole)) {
    const { status } = await AuthService.getCurrentAuthenticatedUser();
    console.log("auth guard user authenticated: " + (status === 200 ? "true" : "false"));
    if (status !== 200) {
      await directToLogin();
      return false;
    } else if (!userStore.currentUser?.roles?.includes("edit")) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: "edit", accessType: "role" } });
    }
  }

  if (to.matched.some((record: any) => record.meta.requiresLicense)) {
    console.log("snomed license accepted:" + userStore.snomedLicenseAccepted);
  }

  if (to.matched.some((record: any) => record.meta.requiresUprnAgreement)) {
    console.log("uprn agreement accepted: " + userStore.uprnAgreementAccepted);
  }

  if (to.matched.some((record: any) => record.meta.requiresOrganisation)) {
    let isEditAllowed = false;
    if (userStore.isLoggedIn) isEditAllowed = await UserService.canUserEdit(iri as string);
    if (!isEditAllowed) {
      await router.push({ name: "AccessDenied", params: { requiredAccess: iri.slice(0, iri.indexOf("#") + 1), accessType: "organisation" } });
    }
  }

  if (to.name === "PageNotFound" && to.path.startsWith("/creator/")) {
    await router.push({ name: "Creator" });
  }
  if (to.name === "PageNotFound" && to.path.startsWith("/editor/")) {
    const urlSections = to.path.split("/");
    if (urlSections.length > 2) {
      const selectedIriParam = to.path.split("/")[2];
      if (!selectedIriParam) await router.push({ name: "EntityNotFound", params: { iri: selectedIriParam } });
      else await router.push({ name: "Editor", params: { selectedIri: urlToIri(selectedIriParam) } });
    } else await router.push({ name: "Editor" });
  }

  if (to.name === "Folder" && isObjectHasKeys(to.params, ["selectedIri"]) && to.params.selectedIri !== "http://endhealth.info/im#Favourites") {
    const iri = to.params.selectedIri as string;
    try {
      new URL(iri);
      if (!(await EntityService.iriExists(iri))) {
        await router.push({ name: "EntityNotFound", params: { iri: iri } });
      }
    } catch (_error) {
      await router.push({ name: "EntityNotFound", params: { iri: iri } });
    }
  }

  if (from.path.startsWith("/creator/") && !to.path.startsWith("/creator/")) {
    if (creatorStore.creatorHasChanges) {
      if (!window.confirm("Are you sure you want to leave this page. Unsaved changes will be lost.")) {
        return false;
      }
    }
  }

  if (from.path.startsWith("/editor/") && !to.path.startsWith("/editor/")) {
    if (editorStore.editorHasChanges) {
      if (!window.confirm("Are you sure you want to leave this page. Unsaved changes will be lost.")) {
        return false;
      }
    }
  }
});

router.afterEach(async to => {
  const directoryStore = useDirectoryStore();
  const editorStore = useEditorStore();
  const queryStore = useQueryStore();
  const loadingStore = useLoadingStore();
  let title = (to.meta.title as string) ? (to.meta.title as string) : "";
  if (routes.findIndex(view => view.name === to.meta.name) != -1) {
    loadingStore.updateViewsLoading(false);
  }
  if (to.matched.some((record: any) => record.name === "Directory")) {
    loadingStore.updateDirectoryLoading(false);
    if (!to.meta.title) title += await directoryStore.getConceptName();
  }
  if (to.matched.some((record: any) => record.name === "Editor")) {
    title += "Editor: " + (await editorStore.getConceptName());
  }
  if (to.matched.some((record: any) => record.name === "Query")) {
    title += "Query";
    if (to.params.queryIri) title += ": " + (await queryStore.getQueryName());
  }
  if (to.matched.some(record => record.name === "Uprn")) {
    loadingStore.updateUprnLoading(false);
    title += "ASSIGN-UPRN";
  }
  nextTick(() => {
    document.title = APP_TITLE + (title ? " - " : "") + title;
  });
});

export default router;
