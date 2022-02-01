import ArrayObjectNameTagWithLabel from "@/components/generics/ArrayObjectNameTagWithLabel.vue";
import { shallowMount } from "@vue/test-utils";
import Tag from "primevue/tag";
import LoggerService from "@/services/LoggerService";

describe("ArraObjectNameTagWithLabel.vue", () => {
  let wrapper;

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(ArrayObjectNameTagWithLabel, {
      global: { components: { Tag } },
      props: { label: "Status", size: "50%", data: [{ "@id": "http://endhealth.info/im#Active", name: "Active" }] }
    });
  });

  it("mounts", () => {
    expect(wrapper.vm.label).toBe("Status");
    expect(wrapper.vm.size).toBe("50%");
    expect(wrapper.vm.data).toStrictEqual([{ "@id": "http://endhealth.info/im#Active", name: "Active" }]);
  });

  it("can check isArrayObject ___ true", () => {
    expect(ArrayObjectNameTagWithLabel.computed.isArrayObject.call({ data: [{ "@id": "http://endhealth.info/im#Active", name: "Active" }] })).toBe(true);
  });

  it("can check isArrayObject ___ false", () => {
    expect(ArrayObjectNameTagWithLabel.computed.isArrayObject.call({ data: { "@id": "http://endhealth.info/im#Active", name: "Active" } })).toBe(false);
  });

  it("can getSeverity ___ active", () => {
    expect(wrapper.vm.getSeverity({ "@id": "http://endhealth.info/im#Active", name: "Active" })).toBe("success");
  });

  it("can getSeverity ___ draft", () => {
    expect(wrapper.vm.getSeverity({ "@id": "http://endhealth.info/im#Draft", name: "Draft" })).toBe("warning");
  });

  it("can getSeverity ___ inactive", () => {
    expect(wrapper.vm.getSeverity({ "@id": "http://endhealth.info/im#Inactive", name: "Inactive" })).toBe("danger");
  });

  it("can getSeverity ___ none", () => {
    LoggerService.warn = jest.fn();
    expect(wrapper.vm.getSeverity({ "@id": "http://endhealth.info/im#Obsolete", name: "Obsolete" })).toBe("info");
    expect(LoggerService.warn).toHaveBeenCalledTimes(1);
    expect(LoggerService.warn).toHaveBeenCalledWith("TagWithLabel missing case for severity");
  });

  it("can getSeverity ___ no name", () => {
    LoggerService.warn = jest.fn();
    expect(wrapper.vm.getSeverity({ "@id": "http://endhealth.info/im#Obsolete" })).toBe("info");
  });
});
