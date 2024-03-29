import { render, fireEvent, RenderResult } from "@testing-library/vue";
import { vi } from "vitest";
import ButtonBar from "@/components/auth/ButtonBar.vue";
import Button from "primevue/button";
import { createTestingPinia } from "@pinia/testing";

createTestingPinia()

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush
  })
}));

describe("ButtonBar.vue ___ previousAppUrl", () => {
  let component: RenderResult;
  let location: any;
  let mockLocation: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockLocation = { href: "" };
    location = window.location;
    delete (window as any).location;
    window.location = mockLocation;

    component = render(ButtonBar, {
      global: { components: { Button } }
    });
  });

  afterEach(() => {
    window.location = location;
  });

  it("should route to home on home button click", async () => {
    const homeButton = component.getByTestId("button-bar-home-button");
    await fireEvent.click(homeButton);
    expect(window.location.href).to.equal("");
  });

  it("should go back on back button click", async () => {
    const backButton = component.getByTestId("button-bar-back-button");
    await fireEvent.click(backButton);
    expect(window.location.href).to.equal("");
  });
});

describe("ButtonBar.vue ___ no previousAppUrl", () => {
  let component: RenderResult;
  let location: any;
  let mockLocation: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockLocation = { href: "" };
    location = window.location;
    delete (window as any).location;
    window.location = mockLocation;

    component = render(ButtonBar, {
      global: {
        components: { Button }
      }
    });
  });

  afterEach(() => {
    window.location = location;
  });

  it("should route to home on home button click", async () => {
    const homeButton = component.getByTestId("button-bar-home-button");
    await fireEvent.click(homeButton);
    expect(window.location.href).to.equal("");
  });
});
