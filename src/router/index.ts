import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import DirectoryTable from "../components/home/DirectoryTable.vue";
import SearchResultsTable from "../views/SearchResultsTable.vue";
import LandingPage from "../views/LandingPage.vue";
import { SnomedLicense, Env } from "im-library";
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

router.beforeEach((to, from, next) => {
  const iri = to.params.selectedIri as string;
  const currentUrl = Env.directoryUrl + "#" + to.path;
  if (to.path !== "/snomedLicense") {
    store.commit("updateSnomedReturnUrl", currentUrl);
    store.commit("updateAuthReturnUrl", currentUrl);
  }
  if (to.matched.some(record => !record.meta.requiresAuth)) {
    store.commit("updateConceptIri", to.params.selectedIri as string);
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    store.dispatch("authenticateCurrentUser").then(res => {
      console.log("auth guard user authenticated:" + res.authenticated);
      if (!res.authenticated) {
        console.log("redirecting to login");
        window.location.href = Env.authUrl + "login?returnUrl=" + currentUrl;
      } else {
        if (to.matched.some(record => record.meta.requiresLicense)) {
          console.log("snomed license accepted:" + store.state.snomedLicenseAccepted);
          if (store.state.snomedLicenseAccepted !== "true") {
            next({
              path: "/snomedLicense"
            });
          } else {
            next();
          }
        }
      }
    });
  } else if (to.matched.some(record => record.meta.requiresLicense)) {
    console.log("snomed license accepted:" + store.state.snomedLicenseAccepted);
    if (store.state.snomedLicenseAccepted !== "true") {
      next({
        path: "/snomedLicense"
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

router.afterEach(to => {
  nextTick(() => {
    document.title = (to.meta.title as string) || APP_TITLE;
  });
});

export default router;
