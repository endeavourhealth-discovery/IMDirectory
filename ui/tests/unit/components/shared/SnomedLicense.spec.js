import Dialog from "primevue/dialog";
import Button from "primevue/button";
import PrimeVue from "primevue/config";
import { expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/vue";
import { createStore } from "vuex";
import { flushPromises } from "@vue/test-utils";
import SnomedLicense from "@/components/shared/SnomedLicense.vue";

const store = createStore({
  state: {
    snomedLicenseAccepted: false,
    snomedReturnUrl: "testUrl.org"
  },
  mutations: {
    updateSnomedLicenseAccepted(state, status) {
      state.snomedLicenseAccepted = status;
      localStorage.setItem("snomedLicenseAccepted", status);
    }
  }
});

describe("SnomedLicense.vue ___ not accepted", () => {
  let mockLocation;
  let component;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockLocation = { href: "" };
    location = window.location;
    delete window.location;
    window.location = mockLocation;
    store.state.snomedLicenseAccepted = false;
    component = render(SnomedLicense, {
      global: {
        plugins: [PrimeVue, store],
        components: { Dialog, Button }
      }
    });
    await flushPromises();
  });

  afterEach(() => {
    window.location = location;
  });

  it("shows dialog if license not accepted", () => {
    store.state.snomedLicenseAccepted = false;
    component.getByTestId("license-dialog");
  });

  it("routes after accepted", async () => {
    const button = component.getByTestId("agree-button");
    await fireEvent.click(button);
    expect(component.queryByTestId("license-dialog")).toBeNull();
    expect(window.location.href).toBe("testUrl.org");
  });
});

describe("SnomedLicense.vue ___ accepted", () => {
  let mockLocation;
  let component;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockLocation = { href: "" };
    location = window.location;
    delete window.location;
    window.location = mockLocation;
    store.state.snomedLicenseAccepted = true;
    component = render(SnomedLicense, {
      global: {
        plugins: [PrimeVue, store],
        components: { Dialog, Button }
      }
    });
    await flushPromises();
  });

  afterEach(() => {
    window.location = location;
  });

  it("doesn't show dialog if license accepted", () => {
    expect(component.queryByTestId("license-dialog")).toBeNull();
  });
});
