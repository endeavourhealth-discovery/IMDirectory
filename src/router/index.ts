import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import DirectoryTable from "../components/home/DirectoryTable.vue";
import SearchResultsTable from "../views/SearchResultsTable.vue";
import LandingPage from "../views/LandingPage.vue";
import { SnomedLicense, Env, Helpers } from "im-library";
const {
  RouterGuards: { checkAuth, checkLicense }
} = Helpers;
import store from "@/store/index";
import { nextTick } from "vue";

const APP_TITLE = "IM Directory";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    redirect: { name: "LandingPage" },
    meta: {
      requiresLicense: true
    },
    children: [
      {
        path: "",
        name: "LandingPage",
        alias: ["/home"],
        component: LandingPage,
        meta: {
          requiresLicense: true
        }
      },
      {
        path: "folder/:selectedIri",
        name: "Folder",
        component: DirectoryTable,
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
      }
    ]
  },
  {
    path: "/snomedLicense",
    name: "License",
    component: SnomedLicense
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  let hasCalledNext = false;
  const currentUrl = Env.directoryUrl + "#" + to.path;
  if (to.path !== "/snomedLicense") {
    store.commit("updateSnomedReturnUrl", currentUrl);
    store.commit("updateAuthReturnUrl", currentUrl);
  }
  if (to.params.selectedIri) {
    store.commit("updateConceptIri", to.params.selectedIri as string);
  }
  hasCalledNext = await checkAuth(to, currentUrl, store, hasCalledNext, "Auth");
  hasCalledNext = checkLicense(to, next, store, hasCalledNext);
  if (!hasCalledNext) next();
});

router.afterEach(to => {
  nextTick(() => {
    document.title = (to.meta.title as string) || APP_TITLE;
  });
});

export default router;
