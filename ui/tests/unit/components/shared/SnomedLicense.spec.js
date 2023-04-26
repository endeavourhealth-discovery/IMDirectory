import Dialog from "primevue/dialog";
import Button from "primevue/button";
import PrimeVue from "primevue/config";
import { expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/vue";
import { flushPromises } from "@vue/test-utils";
import SnomedLicense from "@/components/shared/SnomedLicense.vue";
import { createTestingPinia } from "@pinia/testing";
import { useRootStore } from "@/stores/rootStore";

createTestingPinia({
  initialState: {
    root: {
      snomedLicenseAccepted: false,
      snomedReturnUrl: "testUrl.org"
    }
  }
});

const mockState = useRootStore();
mockState.updateSnomedLicenseAccepted = status => {
  mockState.snomedLicenseAccepted = status;
  localStorage.setItem("snomedLicenseAccepted", status);
};

describe("SnomedLicense.vue ___ not accepted", () => {
  let mockLocation;
  let component;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockLocation = { href: "" };
    location = window.location;
    delete window.location;
    window.location = mockLocation;
    component = render(SnomedLicense, {
      global: {
        plugins: [PrimeVue],
        components: { Dialog, Button }
      }
    });
    await flushPromises();
  });

  afterEach(() => {
    window.location = location;
  });

  it("shows dialog if license not accepted", () => {
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
    mockState.snomedLicenseAccepted = true;
    component = render(SnomedLicense, {
      global: {
        plugins: [PrimeVue],
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
