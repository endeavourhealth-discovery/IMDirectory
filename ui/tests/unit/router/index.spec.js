import router from "@/router/index";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import DynamicDialog from "primevue/dynamicdialog";
import Button from "primevue/button";
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";
import { flushPromises, shallowMount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import TopBar from "@/components/shared/TopBar.vue";
import { vi } from "vitest";
import { render } from "@testing-library/vue";
import { nextTick } from "vue";
import { fakerFactory } from "@im-library/mocks/fakerFactory";
import { GithubService } from "@/services";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/root";

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
  describe("router ___ no snomed", () => {
    let component;
    let getLatestReleaseSpy;
    let testLatestRelease = fakerFactory.githubRelease.create();

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const store = useRootStore();
      store.updateSnomedLicenseAccepted(false);
      // store.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      router.push("/");
      await router.isReady();

      component = render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, Menu, DynamicDialog },
          plugins: [router, PrimeVue],
          stubs: { SnomedLicense: { template: "<span>Test Snomed License</span>" }, Directory: true, ReleaseNotes: true }
        }
      });

      await flushPromises();
      await nextTick();
      vi.clearAllMocks();
    });

    it("routes to snomedLicense if snomedAccepted ___ false", () => {
      const store = useRootStore();
      component.getByText("Test Snomed License");
      store.updateSnomedLicenseAccepted(true);
    });
  });

  describe.skip("router ___ snomed", () => {
    let wrapper;
    let getLatestReleaseSpy;
    let testLatestRelease = fakerFactory.githubRelease.create();

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      createTestingPinia();
      const store = useRootStore();
      store.updateSnomedLicenseAccepted(true);
      // store.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, Menu, DynamicDialog },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      vi.clearAllMocks();
    });

    it("routes to home if snomedAccepted ___ true", () => {
      expect(wrapper.vm.$route.path).toBe("/directory/landingPage");
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
      const store = useRootStore();
      store.snomedLicenseAccepted = true;
      // store.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog },
          plugins: [router, store]
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
      const store = useRootStore();
      store.snomedLicenseAccepted = true;
      // store.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
      getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, DynamicDialog },
          plugins: [router, store]
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
