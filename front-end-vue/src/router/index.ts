import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Dashboard from "../views/Dashboard.vue";
import Datamodel from "../views/Concept.vue";
import Workflow from "../views/Workflow.vue";
import Catalogue from "../views/Catalogue.vue";
import UPRN from "../views/Uprn.vue";
import User from "../views/User.vue";
import Editor from "../views/Editor.vue";
import Login from "../components/user/Login.vue";
import Register from "../components/user/Register.vue";
import UserDetails from "../components/user/UserDetails.vue";
import UserEdit from "../components/user/UserEdit.vue";
import PasswordEdit from "../components/user/PasswordEdit.vue";
import ConfirmCode from "../components/user/ConfirmCode.vue";
import Logout from "../components/user/Logout.vue";
import ForgotPassword from "../components/user/ForgotPassword.vue";
import ForgotPasswordSubmit from "../components/user/ForgotPasswordSubmit.vue";
import CatalogueDashboard from "@/components/catalogue/CatalogueDashboard.vue";
import InstanceDetails from "@/components/catalogue/InstanceDetails.vue";
import SnomedLicense from "../views/SnomedLicense.vue";
import store from "@/store/index";
import { nextTick } from "vue";

const APP_TITLE = "Information Model";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/concept/http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23Thing",
    redirect: "/"
  },
  {
    path: "/user",
    name: "User",
    component: User,
    children: [
      {
        path: "login",
        name: "Login",
        component: Login
      },
      {
        path: "confirm-code",
        name: "ConfirmCode",
        component: ConfirmCode
      },
      {
        path: "register",
        name: "Register",
        component: Register
      },
      {
        path: "my-account",
        name: "UserDetails",
        component: UserDetails,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "my-account/edit",
        name: "UserEdit",
        component: UserEdit,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "my-account/password-edit",
        name: "PasswordEdit",
        component: PasswordEdit,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: "logout",
        name: "Logout",
        component: Logout
      },
      {
        path: "password-recovery",
        name: "ForgotPassword",
        component: ForgotPassword
      },
      {
        path: "password-recovery/submit",
        name: "ForgotPasswordSubmit",
        component: ForgotPasswordSubmit
      }
    ]
  },
  {
    path: "/",
    name: "Home",
    component: Home,
    redirect: { name: "Dashboard" },
    meta: {
      requiresLicense: true
    },
    children: [
      {
        path: "",
        name: "Dashboard",
        alias: ["/home", "/dashboard"],
        component: Dashboard,
        meta: {
          requiresLicense: true
        }
      },
      {
        path: "/concept/:selectedIri",
        name: "Concept",
        component: Datamodel,
        meta: {
          requiresLicense: true
        }
      }
    ]
  },
  {
    path: "/editor",
    name: "Editor",
    component: Editor,
    children: [
      {
        path: "/editor",
        name: "Create",
        component: Editor
      },
      {
        path: "/editor/:iri",
        name: "Edit",
        component: Editor
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/workflow",
    name: "Workflow",
    component: Workflow,
    meta: {
      requiresLicense: true
    }
  },
  {
    path: "/catalogue",
    name: "Catalogue",
    component: Catalogue,
    redirect: { name: "CatalogueDashboard" },
    meta: {
      requiresLicense: true
    },
    children: [
      {
        path: "dashboard",
        name: "CatalogueDashboard",
        component: CatalogueDashboard,
        meta: {
          requiresLicense: true
        }
      },
      {
        path: "individual/:selectedIri",
        name: "Individual",
        component: InstanceDetails,
        meta: {
          requiresLicense: true
        }
      }
    ]
  },
  {
    path: "/uprn",
    name: "UPRN",
    component: UPRN,
    meta: {
      requiresLicense: true
    }
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
  if (iri && store.state.blockedIris.includes(iri)) {
    return;
  }
  if (to.name?.toString() == "Concept") {
    store.commit("updateConceptIri", to.params.selectedIri as string);
  }
  if (to.name?.toString() == "Individual") {
    store.commit("updateInstanceIri", to.params.selectedIri as string);
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    store.dispatch("authenticateCurrentUser").then(res => {
      console.log("auth guard user authenticated:" + res.authenticated);
      if (!res.authenticated) {
        console.log("redirecting to login");
        next({
          path: "/user/login"
        });
      } else {
        next();
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
