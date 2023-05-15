import Dialog from "primevue/dialog";
import Button from "primevue/button";
import PrimeVue from "primevue/config";
import { expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/vue";
import { flushPromises } from "@vue/test-utils";
import SnomedConsent from "@/components/app/SnomedConsent.vue";
import { createTestingPinia } from "@pinia/testing";
import { useSharedStore } from "@/stores/sharedStore.js";

createTestingPinia({
  initialState: {
    root: {
      snomedLicenseAccepted: false,
      snomedReturnUrl: "testUrl.org"
    }
  }
});

const mockState = useSharedStore();
mockState.updateSnomedLicenseAccepted = status => {
  mockState.snomedLicenseAccepted = status;
  localStorage.setItem("snomedLicenseAccepted", status);
};

const mockRoute = { name: "Concept", meta: { requiresLicense: true } };

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  }),
  useRoute: () => mockRoute
}));

describe("SnomedLicense.vue ___ not accepted", () => {
  let mockLocation;
  let component;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockLocation = { href: "" };
    location = window.location;
    delete window.location;
    window.location = mockLocation;
    mockState.snomedLicenseAccepted = false;
    component = render(SnomedConsent, {
      global: {
        plugins: [PrimeVue],
        components: { Dialog, Button },
        stubs: { TopBar: true }
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

  it("updates store after accepted", async () => {
    const button = component.getByTestId("agree-button");
    await fireEvent.click(button);
    expect(component.queryByTestId("license-dialog")).toBeNull();
    expect(mockState.snomedLicenseAccepted).toBe(true);
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
    component = render(SnomedConsent, {
      global: {
        plugins: [PrimeVue],
        components: { Dialog, Button },
        stubs: { TopBar: true }
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
