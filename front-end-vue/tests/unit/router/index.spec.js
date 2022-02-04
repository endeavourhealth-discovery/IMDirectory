import router from "@/router/index";
import App from "@/App.vue";
import Toast from "primevue/toast";
import store from "@/store/index";
import { flushPromises, shallowMount } from "@vue/test-utils";

describe("router", () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("router ___ no snomed", () => {
    let wrapper;

    beforeEach(async () => {
      jest.resetAllMocks();
      window.sessionStorage.clear();
      store.commit("updateSnomedLicenseAccepted", "false");
      store.dispatch = jest.fn().mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      jest.clearAllMocks();
    });

    it("routes to snomedLicense if snomedAccepted ___ false", () => {
      expect(wrapper.vm.$route.path).toBe("/snomedLicense");
      store.commit("updateSnomedLicenseAccepted", "true");
    });
  });

  describe("router ___ snomed", () => {
    let wrapper;

    beforeEach(async () => {
      jest.resetAllMocks();
      window.sessionStorage.clear();
      store.commit("updateSnomedLicenseAccepted", "true");
      store.dispatch = jest.fn().mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      jest.clearAllMocks();
    });

    it("routes to home if snomedAccepted ___ true", () => {
      expect(wrapper.vm.$route.path).toBe("/");
    });
  });

  describe("router ___ no auth", () => {
    let wrapper;

    beforeEach(async () => {
      jest.resetAllMocks();
      window.sessionStorage.clear();
      store.state.snomedLicenseAccepted = "true";
      store.dispatch = jest.fn().mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      jest.clearAllMocks();
    });

    it("routes to login if false", async () => {
      router.push({ name: "UserEdit" });
      await flushPromises();
      expect(wrapper.vm.$route.path).toBe("/user/login");
    });
  });

  describe("router ___ auth", () => {
    let wrapper;

    beforeEach(async () => {
      jest.resetAllMocks();
      window.sessionStorage.clear();
      store.state.snomedLicenseAccepted = "true";
      store.dispatch = jest.fn().mockResolvedValue({ authenticated: true });
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      jest.clearAllMocks();
    });

    it("routes to login if false", async () => {
      router.push({ name: "UserEdit" });
      await flushPromises();
      expect(wrapper.vm.$route.path).toBe("/user/my-account/edit");
    });
  });



});
