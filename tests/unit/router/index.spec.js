import router from "@/router/index";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import store from "@/store/index";
import { flushPromises, shallowMount } from "@vue/test-utils";
import TopBar from "im-library";
import { vi } from "vitest";

vi.mock("@/main");

describe("router", () => {
  beforeEach(() => {
    console.log = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  describe("router ___ no snomed", () => {
    let wrapper;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.commit("updateSnomedLicenseAccepted", "false");
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      vi.clearAllMocks();
    });

    it("routes to snomedLicense if snomedAccepted ___ false", () => {
      expect(wrapper.vm.$route.path).toBe("/snomedLicense");
      store.commit("updateSnomedLicenseAccepted", "true");
    });
  });

  describe("router ___ snomed", () => {
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
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      vi.clearAllMocks();
    });

    it("routes to home if snomedAccepted ___ true", () => {
      expect(wrapper.vm.$route.path).toBe("/");
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
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button },
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
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button },
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
