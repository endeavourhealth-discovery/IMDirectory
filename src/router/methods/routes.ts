import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/directory",
    name: "Directory",
    component: () => import("@/views/Directory.vue"),
    meta: { requiresLicense: true, transition: "fade", mode: "out-in" },
    redirect: { name: "LandingPage" },
    children: [
      {
        alias: "/",
        path: "landingPage",
        name: "LandingPage",
        component: () => import("@/components/directory/LandingPage.vue"),
        meta: {
          requiresLicense: true,
          transitionDelay: "0.2s",
          title: "Home"
        }
      },
      {
        path: "folder/:selectedIri",
        name: "Folder",
        component: () => import("@/components/directory/DirectoryDetails.vue"),
        meta: {
          requiresLicense: true
        },
        props: true
      },
      {
        path: "search",
        name: "Search",
        component: () => import("@/components/shared/SearchResults.vue"),
        meta: {
          requiresLicense: true,
          title: "Search"
        }
      },
      {
        path: "eclSearch",
        name: "EclSearch",
        component: () => import("@/components/directory/EclSearch.vue"),
        meta: {
          requiresLicense: true,
          title: "Ecl search"
        }
      },
      {
        path: "IMQuerySearch",
        name: "IMQuerySearch",
        component: () => import("@/components/directory/IMQuerySearch.vue"),
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
    component: () => import("@/views/Auth.vue"),
    redirect: { name: "Login" },
    children: [
      {
        path: "login:returnUrl?",
        name: "Login",
        component: () => import("@/components/auth/Login.vue"),
        meta: { title: "Login" }
      },
      {
        path: "confirm-code:returnUrl?",
        name: "ConfirmCode",
        component: () => import("@/components/auth/ConfirmCode.vue"),
        meta: { title: "Confirm code" }
      },
      {
        path: "register:returnUrl?",
        name: "Register",
        component: () => import("@/components/auth/Register.vue"),
        meta: { title: "Register" }
      },
      {
        path: "my-account:returnUrl?",
        name: "UserDetails",
        component: () => import("@/components/auth/UserDetails.vue"),
        meta: {
          requiresAuth: true,
          title: "My account"
        }
      },
      {
        path: "my-account/edit:returnUrl?",
        name: "UserEdit",
        component: () => import("@/components/auth/UserEdit.vue"),
        meta: {
          requiresAuth: true,
          title: "My account"
        }
      },
      {
        path: "my-account/password-edit:returnUrl?",
        name: "PasswordEdit",
        component: () => import("@/components/auth/PasswordEdit.vue"),
        meta: {
          requiresAuth: true,
          title: "My account"
        }
      },
      {
        path: "logout:returnUrl?",
        name: "Logout",
        component: () => import("@/components/auth/Logout.vue"),
        meta: { title: "Logout" }
      },
      {
        path: "password-recovery:returnUrl?",
        name: "ForgotPassword",
        component: () => import("@/components/auth/ForgotPassword.vue"),
        meta: { title: "Reset password" }
      },
      {
        path: "password-recovery/submit:returnUrl?",
        name: "ForgotPasswordSubmit",
        component: () => import("@/components/auth/ForgotPasswordSubmit.vue"),
        meta: { title: "Reset password" }
      },
      {
        path: "mfa-setup",
        name: "MFASetup",
        component: () => import("@/components/auth/MFASetup.vue"),
        meta: { requiresReAuth: true, title: "My account" }
      },
      {
        path: "mfa-login",
        name: "MFALogin",
        component: () => import("@/components/auth/MFALogin.vue"),
        meta: { title: "Login" }
      },
      {
        path: "mfa-delete",
        name: "MFADelete",
        component: () => import("@/components/auth/MFADelete.vue"),
        meta: { requiresReAuth: true, title: "My account" }
      },
      {
        path: "changeTemporaryPassword:tempPassword?",
        props: true,
        name: "ChangeTemporaryPassword",
        component: () => import("@/components/auth/ChangeTemporaryPassword.vue"),
        meta: { title: "Reset password" }
      }
    ]
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/views/AdminToolbox.vue"),
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
    component: () => import("@/views/Creator.vue"),
    meta: {
      requiresAuth: true,
      requiresCreateRole: true,
      title: "Creator"
    }
  },
  {
    path: "/editor",
    props: true,
    meta: {
      requiresAuth: true,
      requiresLicense: true,
      requiresEditRole: true,
      requiresOrganisation: true
    },
    children: [
      {
        path: ":selectedIri?",
        name: "Editor",
        component: () => import("@/views/Editor.vue")
      }
    ]
  },
  {
    path: "/workflow",
    name: "Workflow",
    component: () => import("@/views/Workflow.vue"),
    redirect: { name: "MyWorkflows" },
    meta: {
      requiresAuth: true,
      requiresLicense: true
    },
    children: [
      {
        path: "myworkflows",
        name: "MyWorkflows",
        component: () => import("@/components/workflow/WorkflowTable.vue")
      },
      {
        path: "bugReport:id?",
        name: "ViewBugReport",
        component: () => import("@/components/workflow/ViewBugReport.vue"),
        props: true
      }
    ]
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
    component: () => import("@/views/Uprn.vue"),
    redirect: { name: "SingleAddressLookup" },
    meta: {
      requiresAuth: true,
      requiresUprnAgreement: true
    },
    children: [
      {
        path: "singleAddressLookup",
        name: "SingleAddressLookup",
        component: () => import("@/components/uprn/SingleAddressLookup.vue")
      },
      {
        path: "addressFileWorkflow",
        name: "AddressFileWorkflow",
        component: () => import("@/components/uprn/AddressFileWorkflow.vue")
      },
      {
        path: "addressFileDownload",
        name: "AddressFileDownload",
        component: () => import("@/components/uprn/AddressFileDownload.vue")
      }
    ]
  },
  {
    path: "/query",
    name: "Queries",
    component: () => import("@/views/Query.vue"),
    meta: {
      requiresAuth: true,
      requiresLicense: true,
      requiresCreateRole: true
    },
    children: [
      {
        path: ":queryIri?",
        name: "Query",
        component: () => import("@/views/Query.vue")
      }
    ]
  },
  {
    path: "/codeGenerator",
    name: "CodeGenerator",
    component: () => import("@/views/CodeGen.vue"),
    meta: {
      requiresAuth: true,
      requiresLicense: true,
      title: "Code generator"
    }
  },
  {
    path: "/snomedLicense",
    name: "License",
    component: () => import("@/views/SnomedLicense.vue"),
    meta: { title: "Snomed license" }
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/PrivacyPolicy.vue"),
    meta: { title: "Privacy" }
  },
  {
    path: "/cookies",
    name: "Cookies",
    component: () => import("@/views/Cookies.vue"),
    meta: { view: true, title: "Cookies" }
  },
  {
    path: "/uprn-agreement",
    name: "UPRNAgreement",
    component: () => import("@/views/UprnAgreement.vue"),
    meta: { title: "UPRN agreement" }
  },
  {
    path: "/401",
    props: true,
    meta: { title: "Access denied" },
    children: [
      {
        path: ":requiredAccess?:accessType?",
        name: "AccessDenied",
        component: () => import("@/views/AccessDenied.vue")
      }
    ]
  },
  {
    path: "/404",
    props: true,
    meta: { title: "404" },
    children: [
      {
        path: ":iri?",
        name: "EntityNotFound",
        component: () => import("@/views/EntityNotFound.vue")
      }
    ]
  },
  {
    path: "/:pathMatch(.*)*",
    name: "PageNotFound",
    component: () => import("@/views/PageNotFound.vue"),
    meta: { title: "Page not found" }
  },
  {
    path: "/500",
    name: "ServerOffline",
    component: () => import("@/views/ServerOffline.vue"),
    meta: { title: "Error" }
  },
  {
    path: "/error",
    name: "VueError",
    component: () => import("@/views/VueError.vue"),
    meta: { title: "Error" }
  },
  {
    path: "/bugReport",
    name: "BugReport",
    component: () => import("@/views/BugReport.vue"),
    meta: {
      requiresAuth: true,
      title: "Submit bug report"
    }
  }
];

export default routes;
