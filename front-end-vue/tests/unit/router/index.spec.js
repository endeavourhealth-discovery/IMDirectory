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

  describe("router ___ blockedIri", () => {
    let wrapper;

    beforeEach(async () => {
      jest.resetAllMocks();
      window.sessionStorage.clear();
      store.state.snomedLicenseAccepted = "true";
      store.state.blockedIris = ["http://www.w3.org/2001/XMLSchema#string"];
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

    it("doesn't route if iri is blocked", async () => {
      router.push({ name: "Concept", params: { selectedIri: "http://www.w3.org/2001/XMLSchema#string" } });
      await flushPromises();
      expect(wrapper.vm.$route.path).toBe("/");
    });
  });

  describe("router ___ concept", () => {
    let wrapper;

    beforeEach(async () => {
      jest.resetAllMocks();
      window.sessionStorage.clear();
      store.state.snomedLicenseAccepted = "true";
      store.commit = jest.fn();
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

    it("updates conceptIri on concept routing", async () => {
      router.push({ name: "Concept", params: { selectedIri: "http://snomed.info/sct#298382003" } });
      await flushPromises();
      expect(store.commit).toHaveBeenCalledTimes(1);
      expect(store.commit).toHaveBeenCalledWith("updateConceptIri", "http://snomed.info/sct#298382003");
      expect(wrapper.vm.$route.path).toBe("/concept/http:%2F%2Fsnomed.info%2Fsct%23298382003");
    });
  });

  describe("router ___ individual", () => {
    let wrapper;

    beforeEach(async () => {
      jest.resetAllMocks();
      window.sessionStorage.clear();
      store.state.snomedLicenseAccepted = "true";
      store.commit = jest.fn();
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

    it("updates instanceIri on individual routing", async () => {
      router.push({ name: "Individual", params: { selectedIri: "http://snomed.info/sct#298382003" } });
      await flushPromises();
      expect(store.commit).toHaveBeenCalledTimes(1);
      expect(store.commit).toHaveBeenCalledWith("updateInstanceIri", "http://snomed.info/sct#298382003");
      expect(wrapper.vm.$route.path).toBe("/catalogue/individual/http:%2F%2Fsnomed.info%2Fsct%23298382003");
    });
  });
});
