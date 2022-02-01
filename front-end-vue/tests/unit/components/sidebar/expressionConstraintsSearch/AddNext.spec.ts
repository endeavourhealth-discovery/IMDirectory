import AddNext from "@/components/sidebar/expressionConstraintsSearch/AddNext.vue";
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { shallowMount } from "@vue/test-utils";
import Button from "primevue/button";

describe("AddNext.vue", () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(AddNext, {
      props: {
        id: "focusConcept_0addNext",
        position: 1,
        last: true,
        value: { previousComponentType: ECLType.CONSTRAINT, previousPosition: 0, parentGroup: ECLType.FOCUS_CONCEPT }
      },
      global: { components: { Button } }
    });
  });

  it("mounts", () => {
    expect(wrapper.vm.id).toBe("focusConcept_0addNext");
    expect(wrapper.vm.position).toBe(1);
    expect(wrapper.vm.last).toBe(true);
    expect(wrapper.vm.value).toStrictEqual({ previousComponentType: ECLType.CONSTRAINT, previousPosition: 0, parentGroup: ECLType.FOCUS_CONCEPT });
  });

  it("handles addNextClick", async () => {
    wrapper.vm.addItem("constraint");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().addClicked).toBeTruthy();
    expect(wrapper.emitted().addClicked[0]).toStrictEqual([{ selectedType: ECLType.CONSTRAINT, position: 1 }]);
  });

  it("handles deleteClicked", async () => {
    wrapper.vm.deleteClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().deleteClicked).toBeTruthy();
    expect(wrapper.emitted().deleteClicked[0]).toStrictEqual([
      {
        component: ECLComponent.ADD_NEXT,
        id: "focusConcept_0addNext",
        label: null,
        position: 1,
        type: ECLType.ADD_NEXT,
        value: null
      }
    ]);
  });

  it("can generateOptions ___ contraint", () => {
    wrapper.vm.generateOptions({ previousComponentType: ECLType.CONSTRAINT, previousPosition: 0, parentGroup: ECLType.FOCUS_CONCEPT });
    expect(wrapper.vm.options).toStrictEqual([]);
  });

  it("can generateOptions ___ focusConcept", () => {
    wrapper.vm.generateOptions({ previousComponentType: ECLType.FOCUS_CONCEPT, previousPosition: 0, parentGroup: ECLType.FOCUS_CONCEPT });
    expect(wrapper.vm.options).toStrictEqual([ECLType.LOGIC, ECLType.REFINEMENT_GROUP]);
  });

  it("can generateOptions ___ logic ___ not refinement", () => {
    wrapper.vm.generateOptions({ previousComponentType: ECLType.LOGIC, previousPosition: 0, parentGroup: ECLType.FOCUS_CONCEPT });
    expect(wrapper.vm.options).toStrictEqual([ECLType.FOCUS_CONCEPT]);
  });

  it("can generateOptions ___ logic ___ refinement", () => {
    wrapper.vm.generateOptions({ previousComponentType: ECLType.LOGIC, previousPosition: 0, parentGroup: ECLType.REFINEMENT_GROUP });
    expect(wrapper.vm.options).toStrictEqual([ECLType.REFINEMENT]);
  });

  it("can generateOptions ___ refinementGroup", () => {
    wrapper.vm.generateOptions({ previousComponentType: ECLType.REFINEMENT_GROUP, previousPosition: 0, parentGroup: ECLType.FOCUS_CONCEPT });
    expect(wrapper.vm.options).toStrictEqual([ECLType.LOGIC]);
  });

  it("can generateOptions ___ refinement", () => {
    wrapper.vm.generateOptions({ previousComponentType: ECLType.REFINEMENT, previousPosition: 0, parentGroup: ECLType.REFINEMENT_GROUP });
    expect(wrapper.vm.options).toStrictEqual([ECLType.LOGIC]);
  });
});
