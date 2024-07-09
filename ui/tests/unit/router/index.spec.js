import router from "@/router/index";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import DynamicDialog from "primevue/dynamicdialog";
import Button from "primevue/button";
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";
import ToggleSwitch from "primevue/toggleswitch";
import Drawer from "primevue/drawer";
import { flushPromises, shallowMount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import TopBar from "@/components/shared/TopBar.vue";
import { vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/vue";
import { nextTick } from "vue";
import { fakerFactory } from "@im-library/mocks/fakerFactory";
import { GithubService, UserService } from "@/services";
import { createTestingPinia } from "@pinia/testing";
import { useSharedStore } from "@/stores/sharedStore";
import { useCreatorStore } from "@/stores/creatorStore";
import { useEditorStore } from "@/stores/editorStore";
import { useUserStore } from "@/stores/userStore";
import { Auth } from "aws-amplify";

const mockAdd = vi.fn();

vi.mock("primevue/usetoast", () => ({
  useToast: () => ({
    add: mockAdd
  })
}));

let changeThemeMock = vi.fn();

vi.mock("@/composables/setupChangeTheme.ts", () => {
  return {
    default: () => ({
      changeTheme: () => changeThemeMock
    })
  };
});

let changeScaleMock = vi.fn();

vi.mock("@/composables/setupChangeScale.ts", () => {
  return {
    default: () => ({
      changeScale: () => changeScaleMock
    })
  };
});

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
      const userStore = useUserStore();
      userStore.updateSnomedLicenseAccepted(true);
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      UserService.getUserTheme = async () => "";
      UserService.getUserScale = async () => "";
      await router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, Menu, DynamicDialog, ToggleSwitch, Drawer },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true,
            BannerBar: true
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

  describe.skip("auth guard ___ false", async () => {
    let getLatestReleaseSpy;
    let userStore;
    let testLatestRelease = fakerFactory.githubRelease.create();
    let authenticateCurrentUserSpy;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      userStore = useUserStore();
      userStore.updateSnomedLicenseAccepted(true);
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: false });
      UserService.getUserTheme = async () => "";
      UserService.getUserScale = async () => "";
      await router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>TestLogin</span>" },
            UserEdit: { template: "<span>User Edit</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true,
            BannerBar: true
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
      const button = screen.getByText("Login");
      await fireEvent.click(button);
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("TestLogin"), { timeout: 10000 });
    });
  });

  describe.skip("auth guard ___ true", async () => {
    let getLatestReleaseSpy;
    let testLatestRelease = fakerFactory.githubRelease.create();
    let userStore;
    let authenticateCurrentUserSpy;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true });
      UserService.getUserTheme = async () => "";
      UserService.getUserScale = async () => "";
      await router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            UserEdit: { template: "<span>UserEdit</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true,
            BannerBar: true
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
      await waitFor(() => screen.getByText("UserEdit"), { timeout: 10000 });
    });
  });

  describe.skip("create guard", async () => {
    it("routes to page if true", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["create"] });
      let currentSessionSpy = vi
        .spyOn(Auth, "currentSession")
        .mockResolvedValue({ getIdToken: vi.fn().mockReturnValue({ getJwtToken: vi.fn().mockReturnValue("") }) });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Creator: { template: "<span>Creator</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true,
            BannerBar: true
          }
        }
      });

      router.push("/");
      await router.isReady();

      await flushPromises();
      await nextTick();
      vi.clearAllMocks();
      await waitFor(() => screen.getByText("Directory"), { timeout: 10000 });
      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Creator"), { timeout: 10000 });
    });

    it("routes to login authenticated false", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["create"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>TestLogin</span>" },
            Creator: { template: "<span>Creator</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true,
            BannerBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      screen.getByText("TestLogin");
      await waitFor(() => screen.getByText("TestLogin"), { timeout: 10000 });
    });

    it("routes to accessDenied if missing role", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: [] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
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
            FooterBar: true,
            BannerBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("AccessDenied"), { timeout: 10000 });
    });
  });

  describe.skip("edit guard", async () => {
    it("routes to page if true", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["edit"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Editor: { template: "<span>Editor</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true,
            BannerBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Editor"), { timeout: 10000 });
    });

    it("routes to login authenticated false", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["edit"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
          plugins: [router, PrimeVue],
          stubs: {
            SnomedLicense: { template: "<span>Test Snomed License</span>" },
            Directory: { template: "<span>Directory</span>" },
            Login: { template: "<span>Login</span>" },
            Editor: { template: "<span>Editor</span>" },
            ReleaseNotes: true,
            CookiesConsent: true,
            SnomedConsent: true,
            FooterBar: true,
            BannerBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Login"), { timeout: 10000 });
    });

    it("routes to accessDenied if missing role", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: [] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
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
            FooterBar: true,
            BannerBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("AccessDenied"), { timeout: 10000 });
    });
  });

  describe.skip("creatorHasChanges guard", async () => {
    it("doesn't leave if has changes", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const creatorStore = useCreatorStore();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["create"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      creatorStore.creatorHasChanges = true;
      window.confirm = vi.fn().mockReturnValue(false);
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
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
            FooterBar: true,
            BannerBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Creator"), { timeout: 10000 });
      router.push({ name: "Directory" });
      await waitFor(() => screen.getByText("Creator"), { timeout: 10000 });
    });

    it("leaves if doesn't have changes", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const creatorStore = useCreatorStore();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["create"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      creatorStore.creatorHasChanges = false;
      window.confirm = vi.fn().mockReturnValue(false);
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
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
            FooterBar: true,
            BannerBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Creator" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Creator"), { timeout: 10000 });
      router.push({ name: "Directory" });
      await waitFor(() => screen.getByText("Directory"), { timeout: 10000 });
    });
  });

  describe.skip("editorHasChanges guard", async () => {
    it("doesn't leave if has changes", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const editorStore = useEditorStore();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["edit"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      editorStore.editorHasChanges = true;
      window.confirm = vi.fn().mockReturnValue(false);
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
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
            FooterBar: true,
            BannerBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Editor"), { timeout: 10000 });
      router.push({ name: "Directory" });
      await waitFor(() => screen.getByText("Editor"), { timeout: 10000 });
    });

    it("leaves if doesn't have changes", async () => {
      let testLatestRelease = fakerFactory.githubRelease.create();
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const editorStore = useEditorStore();
      const userStore = useUserStore();
      userStore.snomedLicenseAccepted = true;
      let getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      const testUser = fakerFactory.user.create({ roles: ["edit"] });
      let authenticateCurrentUserSpy = vi.spyOn(userStore, "authenticateCurrentUser").mockResolvedValue({ authenticated: true, status: 200, user: testUser });
      userStore.currentUser = testUser;
      editorStore.editorHasChanges = false;
      window.confirm = vi.fn().mockReturnValue(false);
      router.push("/");
      await router.isReady();

      render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog, ToggleSwitch, Drawer },
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
            FooterBar: true,
            BannerBar: true
          }
        }
      });
      await flushPromises();
      await nextTick();
      vi.clearAllMocks();

      router.push({ name: "Editor" });
      await flushPromises();
      await nextTick();
      await waitFor(() => screen.getByText("Editor"), { timeout: 10000 });
      router.push({ name: "Directory" });
      await waitFor(() => screen.getByText("Directory"), { timeout: 10000 });
    });
  });
});
