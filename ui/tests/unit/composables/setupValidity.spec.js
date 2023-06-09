import { setupValidity } from "@/composables/setupValidity";
import testData from "./setupValidity.testData";
import { mountComposable } from "../TestMethods";

describe("constructValidationCheckStatus", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("constructs validationCheckStatus", () => {
    const testShape = testData.testShape;
    const wrapper = mountComposable(setupValidity, [testShape]);

    wrapper.vm.constructValidationCheckStatus();
    expect(wrapper.vm.validationCheckStatus).toEqual(testData.validationCheckStatus);
  });
});
