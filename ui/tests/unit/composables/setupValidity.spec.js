import { setupValidity } from "@/composables/setupValidity";
import testData from "./setupValidity.testData";
import { mountComposable } from "../TestMethods";
import { flushPromises } from "@vue/test-utils";
import { IM } from "@im-library/vocabulary";

describe("setupValidity", () => {
  describe("constructValidationCheckStatus", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("constructs validationCheckStatus", () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);

      wrapper.vm.constructValidationCheckStatus(testData.testShape);
      expect(wrapper.vm.validationCheckStatus).toEqual(testData.validationCheckStatus);
    });
  });

  describe("removeValidationCheckStatus", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("can remove a check", () => {
      const itemToRemove = testData.testShape.property[0].property[0].property[0];
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(wrapper.vm.validationCheckStatus).toHaveLength(10);
      expect(wrapper.vm.validationCheckStatus).toContainEqual({ key: itemToRemove.path["@id"], checkCompleted: false });
      wrapper.vm.removeValidationCheckStatus(itemToRemove);
      expect(wrapper.vm.validationCheckStatus).not.toContainEqual({ key: itemToRemove.path["@id"], checkCompleted: false });
      expect(wrapper.vm.validationCheckStatus).toHaveLength(9);
    });
  });

  describe("clearValidationCheckStatus", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("can clear validationCheckStatus", () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(wrapper.vm.validationCheckStatus).toHaveLength(10);
      wrapper.vm.clearValidationCheckStatus();
      expect(wrapper.vm.validationCheckStatus).toEqual([]);
    });
  });

  describe("validationChecksComplete", () => {
    beforeEach(() => {
      vi.resetAllMocks();
      vi.useFakeTimers();
    });

    it("checks if validations are completed ___ true", async () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      wrapper.vm.validationChecksCompleted().then(res => expect(res).toBe(true));
      wrapper.vm.validationCheckStatus.value = [...testData.validationCheckStatus].map(item => {
        return { key: item.key, checkCompleted: true };
      });
      vi.advanceTimersByTime(500);
      vi.advanceTimersByTime(10000);
      await flushPromises();
    });

    it("checks if validations are completed ___ false", async () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      wrapper.vm.validationChecksCompleted().catch(err => expect(err).toBe(expect.stringContaining("Validation checks timed out:")));
      wrapper.vm.validationCheckStatus.value = [...testData.validationCheckStatus].map(item => {
        return { key: item.key, checkCompleted: true };
      });
      vi.advanceTimersByTime(500);
      vi.advanceTimersByTime(10000);
      await flushPromises();
    });
  });

  describe("addPropertyToValidationCheckStatus", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("adds properties to validation check status", () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      wrapper.vm.validationCheckStatus = [];
      wrapper.vm.addPropertyToValidationCheckStatus(testData.testShape.property[0].property[0].property[0]);
      expect(wrapper.vm.validationCheckStatus).toEqual([
        {
          checkCompleted: false,
          key: testData.testShape.property[0].property[0].property[0].path["@id"]
        }
      ]);
    });

    it("adds children properties", () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      wrapper.vm.validationCheckStatus = [];
      wrapper.vm.addPropertyToValidationCheckStatus(testData.testShape.property[0]);
      expect(wrapper.vm.validationCheckStatus).toEqual(testData.validationCheckStatus);
    });

    it("excludes horizontal_layout, verticalLayout, toggleable", () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      wrapper.vm.validationCheckStatus = [];
      wrapper.vm.addPropertyToValidationCheckStatus(testData.testShape.property[0]);
      expect(wrapper.vm.validationCheckStatus).not.toContainEqual({ key: IM.CONCEPT, checkCompleted: false });
      expect(wrapper.vm.validationCheckStatus).not.toContainEqual({ key: "http://snomed.info/sct#370124000", checkCompleted: false });
    });
  });

  describe("updateValidationCheckStatus", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("can change status", () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(wrapper.vm.validationCheckStatus).toContainEqual({ key: testData.validationCheckStatus[0].key, checkCompleted: false });
      wrapper.vm.updateValidationCheckStatus(testData.validationCheckStatus[0].key);
      expect(wrapper.vm.validationCheckStatus).toContainEqual({ key: testData.validationCheckStatus[0].key, checkCompleted: true });
    });
  });
});
