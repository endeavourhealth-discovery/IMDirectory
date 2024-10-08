import { createRouter, createWebHashHistory, RouteLocationNormalized, RouteRecordRaw } from "vue-router";
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
import { endRouterLoading, startRouterLoading } from "./methods/loading";
import { directToLogin } from "./methods/intercepts";
import { directoryGuard, editorGuard, queryGuard } from "./methods/routeGuards";
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
    redirect: { name: "AdminHome" },
    meta: { requiresAdmin: true },
    children: [
      {
        path: "home",
        name: "AdminHome",
        component: () => import("@/components/adminToolbox/Home.vue")
      },
      {
        path: "github",
        name: "UpdateConfig",
        component: () => import("@/components/adminToolbox/github/UpdateConfig.vue")
      },
      {
        path: "cognito",
        name: "CognitoManager",
        component: () => import("@/components/adminToolbox/cognito/CognitoManager.vue"),
        redirect: { name: "CognitoListUsers" },
        children: [
          {
            path: "listUsers",
            name: "CognitoListUsers",
            component: () => import("@/components/adminToolbox/cognito/ListUsers.vue")
          },
          {
            path: "listGroups",
            name: "CognitoListGroups",
            component: () => import("@/components/adminToolbox/cognito/ListGroups.vue")
          },
          {
            path: "listUsersInGroup/:group",
            name: "CognitoUsersInGroup",
            component: () => import("@/components/adminToolbox/cognito/UsersInGroup.vue"),
            props: true
          },
          {
            path: "userDetails/:username",
            name: "CognitoUserDetails",
            component: () => import("@/components/adminToolbox/cognito/UserDetails.vue"),
            props: true
          },
          {
            path: "createUser",
            name: "CognitoCreateUser",
            component: () => import("@/components/adminToolbox/cognito/CreateUser.vue")
          }
        ]
      }
    ]
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
    component: () => import("@/views/Filer.vue"),
    meta: {
      requiresLicense: true,
      requiresAuth: true,
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

async function setBrowserTabTitles(to: RouteLocationNormalized) {
  const directoryStore = useDirectoryStore();
  const editorStore = useEditorStore();
  const queryStore = useQueryStore();
  let title = (to.meta.title as string) ? (to.meta.title as string) : "";
  if (to.matched.some((record: any) => record.name === "Directory")) {
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
    title += "ASSIGN-UPRN";
  }
  nextTick(() => {
    document.title = APP_TITLE + (title ? " - " : "") + title;
  });
}

router.beforeEach(async (to, from) => {
  startRouterLoading(routes, to, from);
  const authStore = useAuthStore();
  const creatorStore = useCreatorStore();
  const editorStore = useEditorStore();
  const userStore = useUserStore();

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
  setBrowserTabTitles(to);
  endRouterLoading(routes, to);
});

export default router;
