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
import { render } from "@testing-library/vue";
import { nextTick } from "vue";
import { fakerFactory } from "@im-library/mocks/fakerFactory";
import { GithubService } from "@/services";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/rootStore";

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
    let component;
    let getLatestReleaseSpy;
    let testLatestRelease = fakerFactory.githubRelease.create();

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      rootStore.updateSnomedLicenseAccepted(true);
      // rootStore.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      router.push("/");
      await router.isReady();

      component = render(App, {
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
      component.getByText("Directory");
    });
  });

  // currently has no secure routes to test against
  describe.skip("router ___ no auth", () => {
    let wrapper;
    let getLatestReleaseSpy;
    let testLatestRelease = fakerFactory.githubRelease.create();

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      rootStore.snomedLicenseAccepted = true;
      // rootStore.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog },
          plugins: [router, rootStore]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      vi.clearAllMocks();
    });

    it("routes to login if false", async () => {
      router.push({ name: "UserEdit" });
      await flushPromises();
      expect(wrapper.vm.$route.path).toBe("/user/login");
    });
  });

  // currently has no secure routes to test against
  describe.skip("router ___ auth", () => {
    let wrapper;
    let getLatestReleaseSpy;
    let testLatestRelease = fakerFactory.githubRelease.create();

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const rootStore = useRootStore();
      rootStore.snomedLicenseAccepted = true;
      // rootStore.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog },
          plugins: [router, rootStore]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      vi.clearAllMocks();
    });

    it("routes to login if false", async () => {
      router.push({ name: "UserEdit" });
      await flushPromises();
      expect(wrapper.vm.$route.path).toBe("/user/my-account/edit");
    });
  });
});
