import router from "@/router/index";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import Button from "primevue/button";
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";
import Dialog from "primevue/dialog";
import store from "@/store/index";
import { flushPromises, shallowMount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import TopBar from "@/components/shared/TopBar.vue";
import { vi } from "vitest";
import { setupServer } from "msw/node";
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
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, Menu },
          plugins: [router, store, PrimeVue],
          stubs: { ReleaseNotes: true, SnomedLicense: { template: "<span>Snomed License Agreement</span>" } }
        }
      });

      await flushPromises();
      await nextTick();
      vi.clearAllMocks();
    });

    it("routes to snomedLicense if snomedAccepted ___ false", () => {
      component.getByText("Snomed License Agreement");
      store.commit("updateSnomedLicenseAccepted", "true");
    });
  });

  describe("router ___ snomed", () => {
    let component;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.commit("updateSnomedLicenseAccepted", "true");
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      component = render(App, {
        global: {
          components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button, Menu },
          plugins: [router, store],
          stubs: { ReleaseNotes: true, Directory: { template: "<span>Landing Page</span>" }, Toast: true }
        }
      });

      await flushPromises();
      await nextTick();
      vi.clearAllMocks();
    });

    it("routes to home if snomedAccepted ___ true", () => {
      component.getByText("Landing Page");
    });
  });

  // describe.skip("router ___ no auth", () => {
  //   let component;

  //   beforeEach(async () => {
  //     vi.resetAllMocks();
  //     window.sessionStorage.clear();
  //     store.state.snomedLicenseAccepted = "true";
  //     store.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
  //     router.push("/");
  //     await router.isReady();

  //     component = render(App, {
  //       global: {
  //         components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button },
  //         plugins: [router, store],
  //         stubs: { ReleaseNotes: true, Login: { template: "<span>Login</span>" }, Directory: true, Toast: true }
  //       }
  //     });

  //     await flushPromises();
  //     await nextTick();
  //     vi.clearAllMocks();
  //   });

  //   it("routes to login if false", async () => {
  //     await router.push({ name: "UserEdit" });
  //     await flushPromises();
  //     await nextTick();
  //     component.getByText("Login");
  //   });
  // });

  // // currently has no secure routes to test against
  // describe.skip("router ___ auth", () => {
  //   let wrapper;

  //   beforeEach(async () => {
  //     vi.resetAllMocks();
  //     window.sessionStorage.clear();
  //     store.state.snomedLicenseAccepted = "true";
  //     store.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
  //     router.push("/");
  //     await router.isReady();

  //     wrapper = shallowMount(App, {
  //       global: {
  //         components: { Toast, ConfirmDialog, TopBar, ProgressSpinner, Button },
  //         plugins: [router, store]
  //       }
  //     });

  //     await flushPromises();
  //     await wrapper.vm.$nextTick();
  //     vi.clearAllMocks();
  //   });

  //   it("routes to login if false", async () => {
  //     router.push({ name: "UserEdit" });
  //     await flushPromises();
  //     expect(wrapper.vm.$route.path).toBe("/user/my-account/edit");
  //   });
  // });
});
