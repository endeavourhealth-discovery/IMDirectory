import { setupValidity } from "@/composables/setupValidity";
import testData from "./setupValidity.testData";
import { mountComposable } from "../TestMethods";
import { flushPromises } from "@vue/test-utils";
import { IM } from "@/vocabulary";
import { ref } from "vue";
import { EntityService } from "@/services";
import { cloneDeep } from "lodash-es";

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
      expect(wrapper.vm.validationCheckStatus).toHaveLength(12);
      expect(wrapper.vm.validationCheckStatus).toContainEqual({ key: itemToRemove.path["@id"], deferred: expect.anything() });
      wrapper.vm.removeValidationCheckStatus(itemToRemove);
      expect(wrapper.vm.validationCheckStatus).not.toContainEqual({ key: itemToRemove.path["@id"], deferred: expect.anything() });
      expect(wrapper.vm.validationCheckStatus).toHaveLength(11);
    });
  });

  describe("clearValidationCheckStatus", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("can clear validationCheckStatus", () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(wrapper.vm.validationCheckStatus).toHaveLength(12);
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
      wrapper.vm.validationCheckStatus = [...testData.validationCheckStatus].map(item => {
        return { key: item.key, checkCompleted: true };
      });
      vi.advanceTimersByTime(500);
      vi.advanceTimersByTime(10000);
      await flushPromises();
    });

    it("checks if validations are completed ___ false", async () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      wrapper.vm.validationChecksCompleted().catch(err => expect(err).toBe(expect.stringContaining("Validation checks timed out:")));
      wrapper.vm.validationCheckStatus = [...testData.validationCheckStatus].map(item => {
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
          deferred: expect.anything(),
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

    it("can change status", async () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(wrapper.vm.validationCheckStatus).toContainEqual({ key: testData.validationCheckStatus[0].key, deferred: expect.anything() });
      wrapper.vm.updateValidationCheckStatus(testData.validationCheckStatus[0].key);
      await flushPromises();
      const found = wrapper.vm.validationCheckStatus.find(s => s.key === testData.validationCheckStatus[0].key);
      let result;
      found.deferred.promise.then(res => (result = res));
      await flushPromises();
      expect(result).toEqual("resolved");
    });
  });

  describe("updateValidity", () => {
    let checkValidationSpy;
    beforeEach(() => {
      vi.resetAllMocks();
      checkValidationSpy = vi.spyOn(EntityService, "checkValidation");
    });

    it("can update validity ___ shape validation ___ valid", async () => {
      const invalid = ref(true);
      const validationErrorMessage = ref("test");
      const editorEntity = ref({ ...testData.testEntity });
      const valueVariableMap = ref(cloneDeep(testData.testValueVariableMap));
      checkValidationSpy.mockResolvedValue({ valid: true, message: undefined });
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(testData.testShape.property[0].property[0].property[7].validation).toBeDefined();
      await wrapper.vm.updateValidity(
        testData.testShape.property[0].property[0].property[7],
        editorEntity,
        valueVariableMap,
        testData.testShape.property[0].property[0].property[7].path["@id"],
        invalid,
        validationErrorMessage
      );
      await flushPromises();
      expect(invalid.value).toEqual(false);
      expect(validationErrorMessage.value).toEqual();
    });

    it("can update validity ___ shape validation ___ invalid", async () => {
      const invalid = ref(false);
      const validationErrorMessage = ref();
      const editorEntity = ref({ ...testData.testEntity });
      const valueVariableMap = ref(cloneDeep(testData.testValueVariableMap));
      checkValidationSpy.mockResolvedValue({ valid: false, message: "Test error" });
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(testData.testShape.property[0].property[0].property[7].validation).toBeDefined();
      await wrapper.vm.updateValidity(
        testData.testShape.property[0].property[0].property[7],
        editorEntity,
        valueVariableMap,
        testData.testShape.property[0].property[0].property[7].path["@id"],
        invalid,
        validationErrorMessage
      );
      await flushPromises();
      expect(invalid.value).toEqual(true);
      expect(validationErrorMessage.value).toEqual("Test error");
    });

    it("can update validity ___ default validation ___ valid", async () => {
      const invalid = ref(true);
      const validationErrorMessage = ref("test");
      const editorEntity = ref({ ...testData.testEntity });
      const valueVariableMap = ref(cloneDeep(testData.testValueVariableMap));
      checkValidationSpy.mockResolvedValue({ valid: false, message: "Test error" });
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(testData.testShape.property[0].property[0].property[0].validation).toBeUndefined();
      await wrapper.vm.updateValidity(
        testData.testShape.property[0].property[0].property[0],
        editorEntity,
        valueVariableMap,
        testData.testShape.property[0].property[0].property[0].path["@id"],
        invalid,
        validationErrorMessage
      );
      await flushPromises();
      expect(invalid.value).toEqual(false);
      expect(validationErrorMessage.value).toEqual();
    });

    it("can update validity ___ default validation ___ invalid ___ minCount", async () => {
      const invalid = ref(false);
      const validationErrorMessage = ref();
      const editorEntity = ref({ ...testData.testEntity });
      delete editorEntity.value[testData.testShape.property[0].property[0].property[0].path["@id"]];
      const valueVariableMap = ref(cloneDeep(testData.testValueVariableMap));
      checkValidationSpy.mockResolvedValue({ valid: false, message: "Test error" });
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(testData.testShape.property[0].property[0].property[0].validation).toBeUndefined();
      await wrapper.vm.updateValidity(
        testData.testShape.property[0].property[0].property[0],
        editorEntity,
        valueVariableMap,
        testData.testShape.property[0].property[0].property[0].path["@id"],
        invalid,
        validationErrorMessage
      );
      await flushPromises();
      expect(invalid.value).toEqual(true);
      expect(validationErrorMessage.value).toEqual(`A minimum of ${testData.testShape.property[0].property[0].property[0].minCount} is required.`);
    });

    it("can update validity ___ default validation ___ invalid ___ maxCount", async () => {
      const invalid = ref(false);
      const validationErrorMessage = ref();
      const editorEntity = ref({ ...testData.testEntity });
      editorEntity.value[testData.testShape.property[0].property[0].property[0].path["@id"]] = [
        { "@id": "http://endhealth.info/im#Concept", name: "Terminology concept" },
        { "@id": "http://endhealth.info/im#Concept", name: "Terminology concept" },
        { "@id": "http://endhealth.info/im#Concept", name: "Terminology concept" }
      ];
      const testShape = { ...testData.testShape.property[0].property[0].property[0] };
      testShape.maxCount = 1;
      const valueVariableMap = ref(cloneDeep(testData.testValueVariableMap));
      checkValidationSpy.mockResolvedValue({ valid: false, message: "Test error" });
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(testData.testShape.property[0].property[0].property[0].validation).toBeUndefined();
      await wrapper.vm.updateValidity(testShape, editorEntity, valueVariableMap, testShape.path["@id"], invalid, validationErrorMessage);
      await flushPromises();
      expect(invalid.value).toEqual(true);
      expect(validationErrorMessage.value).toEqual(`A maximum of ${testShape.maxCount} is required.`);
    });

    it("can update validity ___ default validation ___ invalid ___ valueVariable", async () => {
      const invalid = ref(false);
      const validationErrorMessage = ref();
      const editorEntity = ref({ ...testData.testEntity });
      const testShape = { ...testData.testShape.property[0].property[0].property[2] };
      const valueVariableMap = ref(cloneDeep(testData.testValueVariableMap));
      valueVariableMap.value.delete("conceptIri");
      checkValidationSpy.mockResolvedValue({ valid: false, message: "Test error" });
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(testData.testShape.property[0].property[0].property[2].validation).toBeUndefined();
      await wrapper.vm.updateValidity(testShape, editorEntity, valueVariableMap, testShape.path["@id"], invalid, validationErrorMessage);
      await flushPromises();
      expect(invalid.value).toEqual(true);
      expect(validationErrorMessage.value).toEqual(`Missing required related item: ${testShape.argument[0].valueVariable}.`);
    });
  });

  describe("removeValidity", () => {
    let checkValidationSpy;
    beforeEach(() => {
      vi.resetAllMocks();
      checkValidationSpy = vi.spyOn(EntityService, "checkValidation");
    });

    it("can update validity ___ default validation ___ valid", async () => {
      const invalid = ref(true);
      const validationErrorMessage = ref("test");
      const editorEntity = ref({ ...testData.testEntity });
      const valueVariableMap = ref(cloneDeep(testData.testValueVariableMap));
      checkValidationSpy.mockResolvedValue({ isValid: false, message: "Test error" });
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      expect(testData.testShape.property[0].property[0].property[0].validation).toBeUndefined();
      await wrapper.vm.updateValidity(
        testData.testShape.property[0].property[0].property[0],
        editorEntity,
        valueVariableMap,
        testData.testShape.property[0].property[0].property[0].path["@id"],
        invalid,
        validationErrorMessage
      );
      await flushPromises();
      expect(wrapper.vm.editorValidity).toHaveLength(1);
      wrapper.vm.removeValidity({ key: testData.testShape.property[0].property[0].property[0].path["@id"], valid: true });
      expect(wrapper.vm.editorValidity).toHaveLength(0);
    });
  });

  describe("isValidEntity", () => {
    it("can check if entity is valid ___ true", () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      wrapper.vm.editorValidity = [
        { key: "test1", valid: true },
        { key: "test2", valid: true }
      ];
      expect(wrapper.vm.isValidEntity({ "http://endhealth.info/im#id": "testIri" })).toBe(true);
    });

    it("can check if entity is valid ___ false", () => {
      const wrapper = mountComposable(setupValidity, [testData.testShape]);
      wrapper.vm.editorValidity = [
        { key: "test1", valid: true },
        { key: "test2", valid: false }
      ];
      expect(wrapper.vm.isValidEntity({ "http://endhealth.info/im#id": "testIri" })).toBe(false);
    });
  });
});
