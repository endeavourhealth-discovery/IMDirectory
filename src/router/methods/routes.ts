import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    name: "Callback",
    path: "/callback",
    component: () => import("@/views/Callback.vue"),
    props: route => ({
      state: route.query.state,
      code: route.query.code
    })
  },
  {
    name: "Main",
    path: "/",
    component: () => import("@/InformationManager.vue"),
    children: [
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
            path: "myworkflows/:taskType?",
            name: "MyWorkflows",
            component: () => import("@/components/workflow/WorkflowTable.vue"),
            props: true
          },
          {
            path: "bugReport/:id?",
            name: "ViewBugReport",
            component: () => import("@/components/workflow/ViewBugReport.vue"),
            props: true
          },
          {
            path: "roleRequest/:id?",
            name: "ViewRoleRequest",
            component: () => import("@/components/workflow/ViewRoleRequest.vue"),
            props: true
          },
          {
            path: "entityApproval/:id?",
            name: "ViewEntityApproval",
            component: () => import("@/components/workflow/ViewEntityApproval.vue"),
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
    ]
  }
];

export default routes;
