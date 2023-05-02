import router from "@/router/index";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import DynamicDialog from "primevue/dynamicdialog";
import Button from "primevue/button";
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";
import InputSwitch from "primevue/inputswitch";
import Sidebar from "primevue/sidebar";
import { flushPromises, shallowMount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import TopBar from "@/components/shared/TopBar.vue";
import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/vue";
import { nextTick } from "vue";
import { fakerFactory } from "@im-library/mocks/fakerFactory";
import { GithubService } from "@/services";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/rootStore";
import { useUserStore } from "@/stores/userStore";

const mockAdd = vi.fn();

vi.mock("primevue/usetoast", () => ({
  useToast: () => ({
    add: mockAdd
  })
}));

describe("router", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("router ___ snomed", () => {
    let getLatestReleaseSpy;
    let testLatestRelease = fakerFactory.githubRelease.create();

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      rootStore.updateSnomedLicenseAccepted(true);
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, Menu, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });

      await flushPromises();
      await nextTick();
      vi.clearAllMocks();
    });

    it("snomedAccepted doesn't effect routing ___ true", () => {
      screen.getByText("Directory");
    });
  });

  describe("auth guard ___ false", () => {
    let getLatestReleaseSpy;
    let userStore;
    let testLatestRelease = fakerFactory.githubRelease.create();
    let authenticateCurrentUserSpy;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      userStore = useUserStore();
      rootStore.updateSnomedLicenseAccepted(true);
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });

      await flushPromises();
      await nextTick();
      vi.clearAllMocks();
    });

    it("routes to login if false", async () => {
      router.push({ name: "UserEdit" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Login"));
    });
  });

  describe("auth guard ___ true", () => {
    let getLatestReleaseSpy;
    let testLatestRelease = fakerFactory.githubRelease.create();
    let userStore;
    let authenticateCurrentUserSpy;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true });
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            UserEdit: { template: "<span>UserEdit</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });

      await flushPromises();
      await nextTick();
      vi.clearAllMocks();
    });

    it("routes to page if true", async () => {
      router.push({ name: "UserEdit" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("UserEdit"));
    });
  });

  describe("create guard", () => {
    it("routes to page if true", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["create"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Creator: { template: "<span>Creator</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Creator"));
    });

    it("routes to login authenticated false", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["create"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Creator: { template: "<span>Creator</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Login"));
    });

    it("routes to accessDenied if missing role", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: [] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Creator: { template: "<span>Creator</span>" },
            AccessDenied: { template: "<span>AccessDenied</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("AccessDenied"));
    });
  });

  describe("edit guard", () => {
    it("routes to page if true", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["edit"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Editor: { template: "<span>Editor</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Editor"));
    });

    it("routes to login authenticated false", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["edit"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Editor: { template: "<span>Editor</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Login"));
    });

    it("routes to accessDenied if missing role", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: [] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Editor: { template: "<span>Editor</span>" },
            AccessDenied: { template: "<span>AccessDenied</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("AccessDenied"));
    });
  });

  describe("creatorHasChanges guard", () => {
    it("doesn't leave if has changes", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["create"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      rootStore.creatorHasChanges = true;
      window.confirm = vi.fn().mockReturnValue(false);
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Creator: { template: "<span>Creator</span>" },
            AccessDenied: { template: "<span>AccessDenied</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Creator"));
      router.push({ name: "Directory" });
      await waitFor(() => screen.getByText("Creator"));
    });

    it("leaves if doesn't have changes", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["create"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      rootStore.creatorHasChanges = false;
      window.confirm = vi.fn().mockReturnValue(false);
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Creator: { template: "<span>Creator</span>" },
            AccessDenied: { template: "<span>AccessDenied</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Creator"));
      router.push({ name: "Directory" });
      await waitFor(() => screen.getByText("Directory"));
    });
  });

  describe("editorHasChanges guard", () => {
    it("doesn't leave if has changes", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["edit"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      rootStore.editorHasChanges = true;
      window.confirm = vi.fn().mockReturnValue(false);
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Editor: { template: "<span>Editor</span>" },
            AccessDenied: { template: "<span>AccessDenied</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Editor"));
      router.push({ name: "Directory" });
      await waitFor(() => screen.getByText("Editor"));
    });

    it("leaves if doesn't have changes", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      const userStore = useUserStore();
      rootStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["edit"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      rootStore.editorHasChanges = false;
      window.confirm = vi.fn().mockReturnValue(false);
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, InputSwitch, Sidebar },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Editor: { template: "<span>Editor</span>" },
            AccessDenied: { template: "<span>AccessDenied</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Editor"));
      router.push({ name: "Directory" });
      await waitFor(() => screen.getByText("Directory"));
    });
  });
});
