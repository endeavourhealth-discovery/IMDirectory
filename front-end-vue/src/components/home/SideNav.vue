<template>
  <transition name="layout-sidebar">
    <div class="layout-sidebar layout-sidebar-dark">
      <div id="sidebar" class="layout-menu-container p-d-flex p-flex-column p-jc-between p-ai-center">
        <div>
          <img class="im-logo" src="../../assets/logos/Logo-object-empty.png" alt="IM logo" @click="resetToHome" />
        </div>

        <div id="center-icons" style="color: grey">
          <div
            v-for="item in menuItems"
            :key="item.route"
            class="center-icon-container"
            v-bind:class="{ active: isActive(item.name) }"
            @click="iconClick(item)"
          >
            <font-awesome-icon class="sidebutton center-icon" :icon="item.icon" style="padding: 5px" fixed-width />
            <div class="center-icon-text">{{ item.name }}</div>
          </div>
        </div>

        <div class="footer user-settings">
          <span v-if="!isLoggedIn" id="user-icon" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" aria-hidden="true">
            <i class="fas fa-users" aria-hidden="true"></i>
          </span>
          <img
            v-if="isLoggedIn"
            class="avatar-icon"
            :src="getUrl(currentUser.avatar)"
            alt="avatar icon"
            @click="toggle"
            aria-haspopup="true"
            aria-controls="overlay_menu"
          />
          <Menu ref="menu" :model="getItems()" :popup="true" id="popup-user" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { IM } from "@/vocabulary/IM";
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { MODULE_IRIS } from "@/helpers/ModuleIris";
import { LoginItem, AccountItem, ModuleItem } from "@/models/sideNav/MenuItems";
import LoggerService from "@/services/LoggerService";

export default defineComponent({
  name: "SideNav",
  computed: mapState([
    "currentUser",
    "isLoggedIn",
    "sideNavHierarchyFocus",
    "selectedEntityType",
    "moduleSelectedEntities",
    "conceptIri",
    "focusHierarchy",
    "sidebarControlActivePanel"
  ]),
  watch: {
    selectedEntityType(newValue) {
      switch (newValue) {
        case "Ontology":
          this.$store.commit("updateSideNavHierarchyFocus", {
            name: this.menuItems[0].name,
            fullName: this.menuItems[0].fullName,
            iri: this.menuItems[0].iri,
            route: this.menuItems[0].route
          });
          break;
        case "Sets":
          this.$store.commit("updateSideNavHierarchyFocus", {
            name: this.menuItems[1].name,
            fullName: this.menuItems[1].fullName,
            iri: this.menuItems[1].iri,
            route: this.menuItems[1].route
          });
          break;
        case "DataModel":
          this.$store.commit("updateSideNavHierarchyFocus", {
            name: this.menuItems[2].name,
            fullName: this.menuItems[2].fullName,
            iri: this.menuItems[2].iri,
            route: this.menuItems[2].route
          });
          break;
        case "Property":
          this.$store.commit("updateSideNavHierarchyFocus", {
            name: this.menuItems[2].name,
            fullName: this.menuItems[2].fullName,
            iri: this.menuItems[2].iri,
            route: this.menuItems[2].route
          });
          break;
        case "Queries":
          this.$store.commit("updateSideNavHierarchyFocus", {
            name: this.menuItems[3].name,
            fullName: this.menuItems[3].fullName,
            iri: this.menuItems[3].iri,
            route: this.menuItems[3].route
          });
          break;
        case "Folder":
          this.handleCenterIconClick(this.sideNavHierarchyFocus);
          break;
        default:
          LoggerService.warn(undefined, `Unknown selectedEntityType detected in sidenav watcher. Type: "${newValue}"`);
          break;
      }
    },
    sideNavHierarchyFocus(newValue, oldValue) {
      if (newValue.name !== oldValue.name) {
        this.handleCenterIconClick(newValue);
      }
    }
  },
  data() {
    return {
      loginItems: [
        {
          label: "Login",
          icon: "fa fa-fw fa-user",
          to: "/user/login"
        },
        {
          label: "Register",
          icon: "fa fa-fw fa-user-plus",
          to: "/user/register"
        }
      ] as LoginItem[],

      accountItems: [
        {
          label: "My account",
          icon: "fa fa-fw fa-user",
          to: "/user/my-account"
        },
        {
          label: "Edit account",
          icon: "fa fa-fw fa-user-edit",
          to: "/user/my-account/edit"
        },
        {
          label: "Change password",
          icon: "fa fa-fw fa-user-lock",
          to: "/user/my-account/password-edit"
        },
        {
          label: "Logout",
          icon: "fa fa-fw fa-sign-out-alt",
          to: "/user/logout"
        }
      ] as AccountItem[],

      menuItems: [
        {
          icon: ["fas", "book"],
          name: "Ontology",
          fullName: "Ontologies",
          route: "Dashboard",
          iri: IM.MODULE_ONTOLOGY
        },
        {
          icon: ["fas", "layer-group"],
          name: "Sets",
          fullName: "Concept sets and value sets",
          route: "Dashboard",
          iri: IM.MODULE_SETS
        },
        {
          icon: ["fas", "archive"],
          name: "DataModel",
          fullName: "Data model",
          route: "Dashboard",
          iri: IM.MODULE_DATA_MODEL
        },
        {
          icon: ["fas", "search"],
          name: "Queries",
          fullName: "Query templates",
          route: "Dashboard",
          iri: IM.MODULE_QUERIES
        }
        // {
        //   icon: ["fas", "fax"],
        //   name: "Catalogue",
        //   fullName: "Catalogue",
        //   route: "Catalogue",
        //   iri: IM.MODULE_CATALOGUE
        // }
        // {
        //   icon: ["fas", "tasks"],
        //   name: "Workflow"
        // },
        // {
        //   icon: ["fas", "map"],
        //   name: "Maps"
        // },
        // {
        //   icon: ["fas", "map-marked-alt"],
        //   name: "Assign",
        //   route: "UPRN"
        // }
      ] as ModuleItem[]
    };
  },
  methods: {
    isActive(item: string): boolean {
      return item === this.sideNavHierarchyFocus.name;
    },

    getItems(): LoginItem[] | AccountItem[] {
      if (this.isLoggedIn) {
        return this.accountItems;
      } else {
        return this.loginItems;
      }
    },

    toggle(event: any): void {
      const menu = this.$refs.menu as any;
      menu.toggle(event);
    },

    getUrl(item: string): string {
      return require("@/assets/avatars/" + item);
    },

    async resetToHome(): Promise<void> {
      this.$store.commit("updateModuleSelectedEntities", { module: this.menuItems[0].name, iri: this.menuItems[0].iri });
      this.$store.commit("updateModuleSelectedEntities", { module: this.menuItems[1].name, iri: this.menuItems[1].iri });
      this.$store.commit("updateModuleSelectedEntities", { module: this.menuItems[2].name, iri: this.menuItems[2].iri });
      this.$store.commit("updateModuleSelectedEntities", { module: this.menuItems[3].name, iri: this.menuItems[3].iri });
      await this.$nextTick();
      this.handleCenterIconClick(this.menuItems[0]);
      this.$store.commit("updateResetTree", true);
    },

    iconClick(item: ModuleItem): void {
      this.$store.commit("updateSidebarControlActivePanel", 0);
      this.handleCenterIconClick(item);
    },

    handleCenterIconClick(item: ModuleItem): void {
      let route = item.route;
      let moduleIri = "";
      if (item.name === "Ontology" || item.name === "Sets" || item.name === "Queries" || item.name === "DataModel") {
        this.$store.commit("updateSideNavHierarchyFocus", {
          name: item.name,
          fullName: item.fullName,
          iri: item.iri,
          route: "Dashboard"
        });
        this.$store.commit("updateConceptIri", this.moduleSelectedEntities.get(item.name));
        this.$store.commit("updateActiveModule", item.name);
        if (!MODULE_IRIS.includes(this.moduleSelectedEntities.get(item.name))) {
          route = "Concept";
          moduleIri = this.moduleSelectedEntities.get(item.name);
        }
        this.$store.commit("updateFocusHierarchy", true);
      } else {
        this.$store.commit("updateSideNavHierarchyFocus", {
          name: item.name,
          fullName: item.fullName,
          iri: item.iri,
          route: item.route
        });
      }
      if (moduleIri !== "") {
        this.$router.push({
          name: route,
          params: { selectedIri: moduleIri }
        });
      } else {
        this.$router.push({ name: route });
      }
    }
  }
});
</script>

<style scoped>
.layout-sidebar {
  height: 100%;
}

.layout-menu-container {
  padding: 20px 0;
  height: 100%;
}

#center-icons {
  text-align: center;
  width: 100%;
  flex-grow: 20;
  overflow: auto;
}

.center-icon-container {
  width: 100%;
  padding-right: 5px;
  border-right: 0;
  margin-bottom: 20px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

.center-icon-text {
  padding-right: 0;
  width: 100%;
  word-break: break-all;
}

#center-icons .active {
  padding-right: 0;
  border-right: 5px solid lightgrey;
}

.disabled * {
  color: #555555;
  cursor: not-allowed !important;
}

.sidebutton {
  cursor: pointer;
}

.layout-sidebar .active .sidebutton {
  color: lightgrey !important;
}

.layout-sidebar .active div {
  color: lightgrey !important;
}

.user-settings {
  cursor: pointer;
  text-align: center;
  margin-top: auto;
  width: 100%;
}

#user-icon,
.settings-icon {
  width: 100%;
  color: lightgray;
  padding: 5px;
  cursor: pointer;
}

.settings-icon {
  padding-top: 20px;
}

.avatar-icon {
  border: 1px solid lightgray;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 5px;
}

.im-logo {
  text-align: center;
  color: lightgray;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 1rem;
}

@media screen and (max-width: 1439px) {
  .layout-menu-container {
    width: 8vw;
  }

  #user-icon,
  .sidebutton {
    font-size: 4vw;
  }

  .avatar-icon {
    width: 5vw;
  }

  .im-logo {
    width: 7vw;
  }

  .center-icon-text {
    font-size: 1rem;
  }
}

@media screen and (min-width: 1440px) {
  .layout-menu-container {
    width: 115px;
  }

  #user-icon,
  .sidebutton {
    font-size: 50px;
  }

  .avatar-icon {
    width: 80px;
  }

  .im-logo {
    width: 100px;
  }

  .center-icon-text {
    font-size: 1.5rem;
  }
}
</style>
