import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import axios from "axios";
import Home from "../views/Home.vue";
import Directory from "../views/Directory.vue";
import SearchResultsTable from "../views/SearchResultsTable.vue";
import LandingPage from "../views/LandingPage.vue";
import EclSearch from "../views/EclSearch.vue";
import { AccessDenied, PageNotFound, SnomedLicense, Services, EntityNotFound, Helpers } from "im-library";
import store from "@/store/index";
import { nextTick } from "vue";
const {
  DataTypeCheckers: { isObjectHasKeys }
} = Helpers;
const { Env } = Services;
import vm from "@/main";

const APP_TITLE = "IM Directory";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    redirect: { name: "LandingPage" },
    children: [
      {
        path: "",
        name: "LandingPage",
        component: LandingPage,
        meta: {
          requiresLicense: true
        }
      },
      {
        path: "folder/:selectedIri",
        name: "Folder",
        component: Directory,
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
  if (to.params.selectedIri) {
    store.commit("updateConceptIri", to.params.selectedIri as string);
  }
  if (to.matched.some((record: any) => record.meta.requiresAuth)) {
    const res = await store.dispatch("authenticateCurrentUser");
    console.log("auth guard user authenticated: " + res.authenticated);
    if (!res.authenticated) {
      console.log("redirecting to login");
      window.location.href = Env.AUTH_URL + "login?returnUrl=" + currentUrl;
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

  if (to.name === "Folder" && isObjectHasKeys(to.params, ["selectedIri"]) && to.params.selectedIri !== "http://endhealth.info/im#Favourites") {
    const iri = to.params.selectedIri as string;
    try {
      new URL(iri);
      if (!(await vm.$entityService.iriExists(iri))) {
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
