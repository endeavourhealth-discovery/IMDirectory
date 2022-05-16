import FocusConcept from "@/components/eclSearch/builder/FocusConcept.vue";
import { shallowMount } from "@vue/test-utils";
import { Enums } from "im-library";
const { ECLComponent } = Enums;

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
      type: "Expression",
      queryString: "*",
      showButtons: { minus: false, plus: false }
    },
    {
      id: "focusConcept_0constraint",
      value: { name: "Descendant or self of", symbol: "<<" },
      position: 0,
      type: "Constraint",
      queryString: "<<",
      showButtons: { minus: false, plus: false }
    }
  ];

  const FOCUS_CONCEPT_BUILD_SORTED = [
    {
      id: "focusConcept_0constraint",
      value: { name: "Descendant or self of", symbol: "<<" },
      position: 0,
      type: "Constraint",
      queryString: "<<",
      showButtons: { minus: false, plus: false }
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
      type: "Expression",
      queryString: "*",
      showButtons: { minus: false, plus: false }
    }
  ];

  const FOCUS_CONCEPT = {
    id: "focusConcept_0",
    queryString: "<< *",
    position: 0,
    type: "FocusConcept",
    value: {
      children: [
        {
          id: "focusConcept_0constraint",
          queryString: "<<",
          position: 0,
          type: "Constraint",
          value: {
            name: "Descendant or self of",
            symbol: "<<"
          },
          showButtons: { minus: false, plus: false }
        },
        {
          id: "focusConcept_0expression",
          queryString: "*",
          position: 1,
          type: "Expression",
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
          },
          showButtons: { minus: false, plus: false }
        }
      ]
    },
    showButtons: { minus: false, plus: true }
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    wrapper = shallowMount(FocusConcept, {
      props: { id: "focusConcept_0", showButtons: { minus: false, plus: true }, position: 0, value: { children: FOCUS_CONCEPT_BUILD } }
    });

    await wrapper.vm.$nextTick();
  });

  it("mounts", () => {
    expect(wrapper.vm.focusConceptBuild).toStrictEqual(FOCUS_CONCEPT_BUILD_SORTED);
    expect(wrapper.vm.id).toBe("focusConcept_0");
    expect(wrapper.vm.showButtons).toStrictEqual({ minus: false, plus: true });
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
    wrapper.vm.addNextClicked(ECLComponent.LOGIC);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().addNextOptionsClicked).toBeTruthy();
    expect(wrapper.emitted().addNextOptionsClicked[0]).toStrictEqual([
      {
        position: 1,
        selectedType: ECLComponent.LOGIC
      }
    ]);
  });

  it("can createFocusConcept", () => {
    wrapper.vm.generateFocusConceptQueryString = vi.fn().mockReturnValue("<< *");
    expect(wrapper.vm.createFocusConcept()).toStrictEqual(FOCUS_CONCEPT);
  });

  it("can generateFocusConceptQueryString", () => {
    expect(wrapper.vm.generateFocusConceptQueryString()).toBe("<< *");
  });

  it("can generateFocusConceptQueryString ___ empty build", () => {
    wrapper.vm.focusConceptBuild = [];
    expect(wrapper.vm.generateFocusConceptQueryString()).toBe("");
  });

  it("can setStartBuild", () => {
    wrapper.vm.setStartBuild();
    expect(wrapper.vm.focusConceptBuild).toStrictEqual(FOCUS_CONCEPT_BUILD);
  });
});

describe("FocusConcept.vue ___ no value", () => {
  let wrapper;

  beforeEach(async () => {
    vi.resetAllMocks();

    wrapper = shallowMount(FocusConcept, { props: { id: "focusConcept_0", showButtons: { minus: false, plus: true }, position: 0, value: { children: [] } } });

    await wrapper.vm.$nextTick();
  });

  it("can setStartBuild", () => {
    wrapper.vm.setStartBuild();
    expect(wrapper.vm.focusConceptBuild).toStrictEqual([
      {
        id: "Constraint_0",
        queryString: "",
        position: 0,
        type: "Constraint",
        value: null,
        showButtons: { minus: false, plus: false }
      },
      {
        id: "Expression_1",
        queryString: "",
        position: 1,
        type: "Expression",
        value: null,
        showButtons: { minus: false, plus: false }
      }
    ]);
  });
});
