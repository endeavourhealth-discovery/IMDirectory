import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Directory from "@/views/Directory.vue";
import DirectoryDetails from "@/components/directory/DirectoryDetails.vue";
import SearchResultsTable from "@/components/directory/SearchResultsTable.vue";
import LandingPage from "@/components/directory/LandingPage.vue";
import EclSearch from "@/components/directory/EclSearch.vue";
import Auth from "@/views/Auth.vue";
import Login from "@/components/auth/Login.vue";
import ConfirmCode from "@/components/auth/ConfirmCode.vue";
import ForgotPassword from "@/components/auth/ForgotPassword.vue";
import ForgotPasswordSubmit from "@/components/auth/ForgotPasswordSubmit.vue";
import Logout from "@/components/auth/Logout.vue";
import PasswordEdit from "@/components/auth/PasswordEdit.vue";
import Register from "@/components/auth/Register.vue";
import UserDetails from "@/components/auth/UserDetails.vue";
import UserEdit from "@/components/auth/UserEdit.vue";
import Creator from "@/views/Creator.vue";
import TypeSelector from "@/components/creator/TypeSelector.vue";
import Editor from "@/views/Editor.vue";
import Mapper from "@/views/Mapper.vue";
import Workflow from "@/views/Workflow.vue";
import TaskDefinition from "@/components/workflow/TaskDefinition.vue";
import TaskViewer from "@/components/workflow/TaskViewer.vue";
import { AccessDenied, PageNotFound, SnomedLicense, EntityNotFound } from "im-library/components";
import { EntityService, Env } from "@/services";
import { DataTypeCheckers } from "im-library/helpers";
import store from "@/store/index";
import { nextTick } from "vue";
import { urlToIri } from "im-library/helpers/modules/Converters";
const { isObjectHasKeys } = DataTypeCheckers;

const APP_TITLE = "IM Directory";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/directory",
    name: "Directory",
    component: Directory,
    meta: { requiredLicense: true },
    redirect: { name: "LandingPage" },
    alias: "/",
    children: [
      {
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
      requiresAuth: true
    },
    children: [{ path: "type", name: "TypeSelector", component: TypeSelector }]
  },
  {
    path: "/editor/:selectedIri?",
    name: "Editor",
    component: Editor,
    meta: {
      requiresAuth: true,
      requiresLicense: true
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
    path: "/snomedLicense",
    name: "License",
    component: SnomedLicense
  },
  {
    path: "/401",
    name: "AccessDenied",
    component: AccessDenied
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
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, _from) => {
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
});

router.afterEach(to => {
  nextTick(() => {
    document.title = (to.meta.title as string) || APP_TITLE;
  });
});

export default router;
