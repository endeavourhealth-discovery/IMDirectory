import { render, fireEvent, within, RenderResult } from "@testing-library/vue";
import { vi } from "vitest";
import AvatarWithSelector from "@/components/auth/AvatarWithSelector.vue";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import Popover from "primevue/popover";
import PrimeVue from "primevue/config";
import { describe, beforeEach, expect, it } from "vitest";
describe("AvatarWithSelector.vue", () => {
  let component: RenderResult;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(AvatarWithSelector, {
      props: { selectedAvatar: "colour/002-man.png" },
      global: {
        plugins: [PrimeVue],
        components: { Button, SelectButton, Popover }
      }
    });
  });

  it("renders props", () => {
    const image = component.getByAltText("avatar icon");
    expect(image.getAttribute("src")).to.contain("colour/002-man.png");
  });

  it("starts with a list of avatars", async () => {
    const avatarOpButton = component.getByTestId("avatar-op-button");
    await fireEvent.click(avatarOpButton);
    const buttons = within(component.getByTestId("avatar-button-options")).getAllByTestId("avatar-select-button");
    expect(buttons.length).to.equal(100);
  });

  it("renders correct image after change", async () => {
    const avatarOpButton = component.getByTestId("avatar-op-button");
    await fireEvent.click(avatarOpButton);
    const buttons = within(component.getByTestId("avatar-button-options")).getAllByTestId("avatar-select-button");
    await fireEvent.click(buttons[12]);
    expect(component.emitted()).to.contain.keys("avatarSelected");
    expect((component.emitted()["avatarSelected"][0] as any)[0]).to.equal("colour/013-woman.png");
    const image = component.getByTestId("avatar-image");
    expect(image.getAttribute("src")).to.contain("colour/013-woman.png");
  });
});
