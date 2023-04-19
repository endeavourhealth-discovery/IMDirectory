import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
const Directory = () => import("@/views/Directory.vue");
const DirectoryDetails = () => import("@/components/directory/DirectoryDetails.vue");
const SearchResultsTable = () => import("@/components/directory/SearchResultsTable.vue");
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
const Creator = () => import("@/views/Creator.vue");
const TypeSelector = () => import("@/components/creator/TypeSelector.vue");
const Editor = () => import("@/views/Editor.vue");
const Mapper = () => import("@/views/Mapper.vue");
const Workflow = () => import("@/views/Workflow.vue");
const TaskDefinition = () => import("@/components/workflow/TaskDefinition.vue");
const TaskViewer = () => import("@/components/workflow/TaskViewer.vue");
const AccessDenied = () => import("@/components/shared/errorPages/AccessDenied.vue");
const PageNotFound = () => import("@/components/shared/errorPages/PageNotFound.vue");
const EntityNotFound = () => import("@/components/shared/errorPages/EntityNotFound.vue");
const ServerOffline = () => import("@/components/shared/errorPages/ServerOffline.vue");
const SnomedLicense = () => import("@/components/shared/SnomedLicense.vue");
const Cookies = () => import("@/views/Cookies.vue");
const Filer = () => import("@/views/Filer.vue");
const Query = () => import("@/views/Query.vue");
import { EntityService, Env } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import store from "@/store/index";
import { nextTick } from "vue";
import { urlToIri } from "@im-library/helpers/Converters";

const APP_TITLE = "IM Directory";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/directory",
    name: "Directory",
    component: Directory,
    meta: { requiredLicense: true },
    redirect: { name: "LandingPage" },
    children: [
      {
        alias: "/",
        path: "landingPage",
        name: "LandingPage",
        component: LandingPage,
        meta: {
          requiresLicense: true
        }
      },
      {
        path: "folder/:selectedIri",
        name: "Folder",
        component: DirectoryDetails,
        meta: {
          requiresLicense: true
        }
      },
      {
        path: "search",
        name: "Search",
        component: SearchResultsTable,
        meta: {
          requiresLicense: true
        }
      },
      {
        path: "eclSearch",
        name: "EclSearch",
        component: EclSearch,
        meta: {
          requiresLicense: true
        }
      },
      {
        path: "IMQuerySearch",
        name: "IMQuerySearch",
        component: IMQuerySearch,
        meta: {
          requiresLicense: true
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
        component: Login
      },
      {
        path: "confirm-code:returnUrl?",
        name: "ConfirmCode",
        component: ConfirmCode
      },
      {
        path: "register:returnUrl?",
        name: "Register",
        component: Register
      },
      {
        path: "my-account:returnUrl?",
        name: "UserDetails",
        component: UserDetails,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "my-account/edit:returnUrl?",
        name: "UserEdit",
        component: UserEdit,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "my-account/password-edit:returnUrl?",
        name: "PasswordEdit",
        component: PasswordEdit,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "logout:returnUrl?",
        name: "Logout",
        component: Logout
      },
      {
        path: "password-recovery:returnUrl?",
        name: "ForgotPassword",
        component: ForgotPassword
      },
      {
        path: "password-recovery/submit:returnUrl?",
        name: "ForgotPasswordSubmit",
        component: ForgotPasswordSubmit
      }
    ]
  },
  {
    path: "/creator",
    name: "Creator",
    component: Creator,
    meta: {
      requiresAuth: true,
      requiresCreateRole: true
    },
    children: [{ path: "type", name: "TypeSelector", component: TypeSelector }]
  },
  {
    path: "/editor/:selectedIri?",
    name: "Editor",
    component: Editor,
    meta: {
      requiresAuth: true,
      requiresLicense: true,
      requiresEditRole: true
    },
    children: []
  },
  {
    path: "/workflow",
    name: "Workflow",
    component: Workflow,
    meta: {
      requiresAuth: true,
      requiresLicense: true
    },
    children: [
      {
        path: "task",
        name: "TaskDefinition",
        component: TaskDefinition
      },
      {
        path: "tasks",
        name: "TaskViewer",
        component: TaskViewer
      }
    ]
  },
  {
    path: "/mapper",
    name: "Mapper",
    component: Mapper,
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
      requiresLicense: true
    }
  },
  // {
  //   path: "/query",
  //   name: "Query",
  //   component: Query,
  //   meta: {
  //     requiresAuth: true,
  //     requiresLicense: true
  //   }
  // },
  {
    path: "/snomedLicense",
    name: "License",
    component: SnomedLicense
  },
  { path: "/cookies", name: "Cookies", component: Cookies },
  {
    path: "/401/:requiredRole?",
    name: "AccessDenied",
    component: AccessDenied,
    props: true
  },
  {
    path: "/404",
    name: "EntityNotFound",
    component: EntityNotFound
  },
  {
    path: "/:pathMatch(.*)*",
    name: "PageNotFound",
    component: PageNotFound
  },
  {
    path: "/500",
    name: "ServerOffline",
    component: ServerOffline
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, from) => {
  const currentUrl = Env.DIRECTORY_URL + to.path.slice(1);
  if (to.path !== "/snomedLicense") {
    store.commit("updateSnomedReturnUrl", currentUrl);
    store.commit("updateAuthReturnUrl", currentUrl);
  }
  const iri = to.params.selectedIri;
  if (iri) {
    store.commit("updateConceptIri", iri as string);
  }
  if (to.name?.toString() == "Editor" && iri && typeof iri === "string") {
    if (iri) store.commit("updateEditorIri", iri);
    try {
      if (!(await EntityService.iriExists(urlToIri(iri)))) {
        router.push({ name: "EntityNotFound" });
      }
    } catch (_error) {
      router.push({ name: "EntityNotFound" });
    }
  }
  if (to.matched.some((record: any) => record.meta.requiresAuth)) {
    const res = await store.dispatch("authenticateCurrentUser");
    console.log("auth guard user authenticated: " + res.authenticated);
    if (!res.authenticated) {
      console.log("redirecting to login");
      router.push({ name: "Login" });
    }
  }

  if (to.matched.some((record: any) => record.meta.requiresCreateRole)) {
    const res = await store.dispatch("authenticateCurrentUser");
    console.log("auth guard user authenticated: " + res.authenticated);
    if (!res.authenticated) {
      console.log("redirecting to login");
      router.push({ name: "Login" });
    } else if (!store.state.currentUser.roles.includes("create")) {
      router.push({ name: "AccessDenied", params: { requiredRole: "create" } });
    }
  }

  if (to.matched.some((record: any) => record.meta.requiresEditRole)) {
    const res = await store.dispatch("authenticateCurrentUser");
    console.log("auth guard user authenticated: " + res.authenticated);
    if (!res.authenticated) {
      console.log("redirecting to login");
      router.push({ name: "Login" });
    } else if (!store.state.currentUser.roles.includes("edit")) {
      router.push({ name: "AccessDenied", params: { requiredRole: "edit" } });
    }
  }

  if (to.matched.some((record: any) => record.meta.requiresLicense)) {
    console.log("snomed license accepted:" + store.state.snomedLicenseAccepted);
    if (store.state.snomedLicenseAccepted !== "true") {
      return {
        path: "/snomedLicense"
      };
    }
  }

  if (to.name === "PageNotFound" && to.path.startsWith("/creator/")) {
    router.push({ name: "Creator" });
  }
  if (to.name === "PageNotFound" && to.path.startsWith("/editor/")) {
    const urlSections = to.path.split("/");
    if (urlSections.length > 2) {
      const selectedIriParam = to.path.split("/")[2];
      if (!selectedIriParam) router.push({ name: "EntityNotFound" });
      else router.push({ name: "Editor", params: { selectedIri: urlToIri(selectedIriParam) } });
    } else router.push({ name: "Editor" });
  }

  if (to.name === "Folder" && isObjectHasKeys(to.params, ["selectedIri"]) && to.params.selectedIri !== "http://endhealth.info/im#Favourites") {
    const iri = to.params.selectedIri as string;
    try {
      new URL(iri);
      if (!(await EntityService.iriExists(iri))) {
        router.push({ name: "EntityNotFound" });
      }
    } catch (_error) {
      router.push({ name: "EntityNotFound" });
    }
  }

  if (from.path.startsWith("/creator/") && !to.path.startsWith("/creator/")) {
    if (store.state.creatorHasChanges) {
      if (!window.confirm("Are you sure you want to leave this page. Unsaved changes will be lost.")) {
        return false;
      }
    }
  }

  if (from.path.startsWith("/editor/") && !to.path.startsWith("/editor/")) {
    if (store.state.editorHasChanges) {
      if (!window.confirm("Are you sure you want to leave this page. Unsaved changes will be lost.")) {
        return false;
      }
    }
  }
});

router.afterEach(to => {
  nextTick(() => {
    document.title = (to.meta.title as string) || APP_TITLE;
  });
});

export default router;
