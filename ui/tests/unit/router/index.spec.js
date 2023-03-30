import router from "@/router/index";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import DynamicDialog from "primevue/dynamicdialog";
import Button from "primevue/button";
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";
import store from "@/store/index";
import { flushPromises, shallowMount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import TopBar from "@/components/shared/TopBar.vue";
import { vi } from "vitest";
import { render } from "@testing-library/vue";
import { nextTick } from "vue";

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

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.commit("updateSnomedLicenseAccepted", "false");
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
      router.push("/");
      await router.isReady();

      component = render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, Menu, DynamicDialog },
          plugins: [router, store, PrimeVue],
          stubs: { SnomedLicense: { template: "<span>Test Snomed License</span>" }, Directory: true, ReleaseNotes: true }
        }
      });

      await flushPromises();
      await nextTick();
      vi.clearAllMocks();
    });

    it("routes to snomedLicense if snomedAccepted ___ false", () => {
      component.getByText("Test Snomed License");
      store.commit("updateSnomedLicenseAccepted", "true");
    });
  });

  describe.skip("router ___ snomed", () => {
    let wrapper;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.commit("updateSnomedLicenseAccepted", "true");
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
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

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.state.snomedLicenseAccepted = "true";
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
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

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.state.snomedLicenseAccepted = "true";
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
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
