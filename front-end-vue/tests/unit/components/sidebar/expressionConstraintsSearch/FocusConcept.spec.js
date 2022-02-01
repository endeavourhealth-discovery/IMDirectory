import FocusConcept from "@/components/sidebar/expressionConstraintsSearch/FocusConcept.vue";
import { shallowMount } from "@vue/test-utils";

describe("FocusConcept.vue ___ value", () => {
  let wrapper;

  const FOCUS_CONCEPT_BUILD = [
    {
      value: {
        code: "",
        name: "ANY",
        iri: "",
        isDescendentOf: [],
        weighting: 0,
        scheme: {},
        status: {},
        match: "ANY",
        entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
      },
      id: "focusConcept_0expression",
      position: 1,
      type: "expression",
      label: "*",
      component: "Expression"
    },
    {
      id: "focusConcept_0constraint",
      value: { name: "Descendant or self of", symbol: "<<" },
      position: 0,
      type: "constraint",
      label: "<<",
      component: "Constraint"
    }
  ];

  const FOCUS_CONCEPT_BUILD_SORTED = [
    {
      id: "focusConcept_0constraint",
      value: { name: "Descendant or self of", symbol: "<<" },
      position: 0,
      type: "constraint",
      label: "<<",
      component: "Constraint"
    },
    {
      value: {
        code: "",
        name: "ANY",
        iri: "",
        isDescendentOf: [],
        weighting: 0,
        scheme: {},
        status: {},
        match: "ANY",
        entityType: [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }]
      },
      id: "focusConcept_0expression",
      position: 1,
      type: "expression",
      label: "*",
      component: "Expression"
    }
  ];

  const FOCUS_CONCEPT = {
    component: "FocusConcept",
    id: "focusConcept_0",
    label: "<< *",
    position: 0,
    type: "focusConcept",
    value: {
      children: [
        {
          component: "Constraint",
          id: "focusConcept_0constraint",
          label: "<<",
          position: 0,
          type: "constraint",
          value: {
            name: "Descendant or self of",
            symbol: "<<"
          }
        },
        {
          component: "Expression",
          id: "focusConcept_0expression",
          label: "*",
          position: 1,
          type: "expression",
          value: {
            code: "",
            entityType: [
              {
                "@id": "http://endhealth.info/im#Concept",
                name: "Concept"
              }
            ],
            iri: "",
            isDescendentOf: [],
            match: "ANY",
            name: "ANY",
            scheme: {},
            status: {},
            weighting: 0
          }
        }
      ]
    }
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    wrapper = shallowMount(FocusConcept, { props: { id: "focusConcept_0", last: false, position: 0, value: { children: FOCUS_CONCEPT_BUILD } } });

    await wrapper.vm.$nextTick();
  });

  it("mounts", () => {
    expect(wrapper.vm.focusConceptBuild).toStrictEqual(FOCUS_CONCEPT_BUILD_SORTED);
    expect(wrapper.vm.id).toBe("focusConcept_0");
    expect(wrapper.vm.last).toBe(false);
    expect(wrapper.vm.position).toBe(0);
    expect(wrapper.vm.value).toStrictEqual({ children: FOCUS_CONCEPT_BUILD });
  });

  it("sorts and updates on watch focusConceptBuild", async () => {
    wrapper.vm.$options.watch.focusConceptBuild.handler.call(wrapper.vm, FOCUS_CONCEPT_BUILD);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.focusConceptBuild).toStrictEqual(FOCUS_CONCEPT_BUILD_SORTED);
    expect(wrapper.emitted().updateClicked).toBeTruthy();
    expect(wrapper.emitted().updateClicked[0]).toStrictEqual([FOCUS_CONCEPT]);
  });

  it("can handle deleteClicked", async () => {
    wrapper.vm.deleteClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().deleteClicked).toBeTruthy();
    expect(wrapper.emitted().deleteClicked[0]).toStrictEqual([FOCUS_CONCEPT]);
  });

  it("can updateChild", async () => {
    expect(wrapper.vm.focusConceptBuild).toStrictEqual(FOCUS_CONCEPT_BUILD_SORTED);
    wrapper.vm.updateChild({
      id: "focusConcept_0constraint",
      value: { name: "Descendant of", symbol: "<" },
      position: 0,
      type: "constraint",
      label: "<<",
      component: "Constraint"
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.focusConceptBuild[0]).toStrictEqual({
      id: "focusConcept_0constraint",
      value: { name: "Descendant of", symbol: "<" },
      position: 0,
      type: "constraint",
      label: "<<",
      component: "Constraint"
    });
  });

  it("can addNextClicked", async () => {
    wrapper.vm.addNextClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().addNextOptionsClicked).toBeTruthy();
    expect(wrapper.emitted().addNextOptionsClicked[0]).toStrictEqual([
      {
        parentGroup: "focusConcept",
        previousComponentType: "focusConcept",
        previousPosition: 0
      }
    ]);
  });

  it("can createFocusConcept", () => {
    wrapper.vm.generateFocusConceptLabel = jest.fn().mockReturnValue("<< *");
    expect(wrapper.vm.createFocusConcept()).toStrictEqual(FOCUS_CONCEPT);
  });

  it("can generateFocusConceptLabel", () => {
    expect(wrapper.vm.generateFocusConceptLabel()).toBe("<< *");
  });

  it("can generateFocusConceptLabel ___ empty build", () => {
    wrapper.vm.focusConceptBuild = [];
    expect(wrapper.vm.generateFocusConceptLabel()).toBe("");
  });

  it("can setStartBuild", () => {
    wrapper.vm.setStartBuild();
    expect(wrapper.vm.focusConceptBuild).toStrictEqual(FOCUS_CONCEPT_BUILD);
  });
});

describe("FocusConcept.vue ___ no value", () => {
  let wrapper;

  beforeEach(async () => {
    jest.resetAllMocks();

    wrapper = shallowMount(FocusConcept, { props: { id: "focusConcept_0", last: false, position: 0, value: { children: [] } } });

    await wrapper.vm.$nextTick();
  });

  it("can setStartBuild", () => {
    wrapper.vm.setStartBuild();
    expect(wrapper.vm.focusConceptBuild).toStrictEqual([
      {
        component: "Constraint",
        id: "focusConcept_0constraint",
        label: "",
        position: 0,
        type: "constraint",
        value: null
      },
      {
        component: "Expression",
        id: "focusConcept_0expression",
        label: "",
        position: 1,
        type: "expression",
        value: null
      }
    ]);
  });
});
