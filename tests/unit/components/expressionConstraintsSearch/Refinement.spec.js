import Refinement from "@/components/eclSearch/builder/Refinement.vue";
import { shallowMount } from "@vue/test-utils";
import { Enums } from "im-library";
const { ECLComponent } = Enums;

describe("Refinement.vue ___ value", () => {
  let wrapper;

  const REFINEMENT_BUILD = [
    {
      id: "Constraint_0",
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
      id: "Expression_1",
      position: 1,
      type: "Expression",
      queryString: "*",
      showButtons: { minus: false, plus: false }
    },
    { id: "Operator_2", value: { symbol: "=", name: "Equals" }, position: 2, type: "Operator", showButtons: { minus: false, plus: false }, queryString: "=" },
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
      id: "Expression_4",
      position: 4,
      type: "Expression",
      queryString: "*",
      showButtons: { minus: false, plus: false }
    },
    {
      id: "Constraint_3",
      value: { name: "Descendant or self of", symbol: "<<" },
      position: 3,
      type: "Constraint",
      queryString: "<<",
      showButtons: { minus: false, plus: false }
    }
  ];

  const REFINEMENT_BUILD_SORTED = [
    {
      id: "Constraint_0",
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
      id: "Expression_1",
      position: 1,
      type: "Expression",
      queryString: "*",
      showButtons: { minus: false, plus: false }
    },
    { id: "Operator_2", value: { symbol: "=", name: "Equals" }, position: 2, type: "Operator", showButtons: { minus: false, plus: false }, queryString: "=" },
    {
      id: "Constraint_3",
      value: { name: "Descendant or self of", symbol: "<<" },
      position: 3,
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
      id: "Expression_4",
      position: 4,
      type: "Expression",
      queryString: "*",
      showButtons: { minus: false, plus: false }
    }
  ];

  const REFINEMENT = {
    id: "refinementGroup_1refinement",
    queryString: "<< * = << *",
    position: 0,
    type: "Refinement",
    showButtons: { minus: true, plus: true },
    value: {
      children: [
        {
          id: "Constraint_0",
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
          id: "Expression_1",
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
        },
        {
          id: "Operator_2",
          queryString: "=",
          position: 2,
          type: "Operator",
          value: {
            name: "Equals",
            symbol: "="
          },
          showButtons: { minus: false, plus: false }
        },
        {
          id: "Constraint_3",
          queryString: "<<",
          position: 3,
          type: "Constraint",
          value: {
            name: "Descendant or self of",
            symbol: "<<"
          },
          showButtons: { minus: false, plus: false }
        },
        {
          showButtons: { minus: false, plus: false },
          id: "Expression_4",
          queryString: "*",
          position: 4,
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
          }
        }
      ]
    }
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    wrapper = shallowMount(Refinement, {
      props: {
        id: "refinementGroup_1refinement",
        showButtons: { minus: true, plus: true },
        position: 0,
        value: {
          children: REFINEMENT_BUILD
        }
      }
    });

    await wrapper.vm.$nextTick();
  });

  it("mounts", async () => {
    expect(wrapper.vm.refinementBuild).toStrictEqual(REFINEMENT_BUILD_SORTED);
    expect(wrapper.vm.id).toBe("refinementGroup_1refinement");
    expect(wrapper.vm.showButtons).toStrictEqual({ minus: true, plus: true });
    expect(wrapper.vm.position).toBe(0);
    expect(wrapper.vm.value).toStrictEqual({ children: REFINEMENT_BUILD });
  });

  it("sorts and updates on watch refinementBuild", async () => {
    wrapper.vm.$options.watch.refinementBuild.handler.call(wrapper.vm, REFINEMENT_BUILD);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.refinementBuild).toStrictEqual(REFINEMENT_BUILD_SORTED);
    expect(wrapper.emitted().updateClicked).toBeTruthy();
    expect(wrapper.emitted().updateClicked[0]).toStrictEqual([REFINEMENT]);
  });

  it("can handle deleteClicked", async () => {
    wrapper.vm.deleteClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().deleteClicked).toBeTruthy();
    expect(wrapper.emitted().deleteClicked[0]).toStrictEqual([REFINEMENT]);
  });

  it("can updateChild", async () => {
    expect(wrapper.vm.refinementBuild).toStrictEqual(REFINEMENT_BUILD_SORTED);
    wrapper.vm.updateChild({
      id: "refinementGroup_1refinementoperator",
      value: { symbol: "!=", name: "NotEquals" },
      position: 2,
      type: "operator",
      component: "Operator",
      label: "!="
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.refinementBuild[2]).toStrictEqual({
      id: "refinementGroup_1refinementoperator",
      value: { symbol: "!=", name: "NotEquals" },
      position: 2,
      type: "operator",
      component: "Operator",
      label: "!="
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

  it("can createRefinement", () => {
    wrapper.vm.generateRefinementQueryString = vi.fn().mockReturnValue("<< * = << *");
    expect(wrapper.vm.createRefinement()).toStrictEqual(REFINEMENT);
  });

  it("can generateRefinementQueryString", () => {
    expect(wrapper.vm.generateRefinementQueryString()).toBe("<< * = << *");
  });

  it("can generateRefinementQueryString ___ empty build", () => {
    wrapper.vm.refinementBuild = [];
    expect(wrapper.vm.generateRefinementQueryString()).toBe("");
  });

  it("can setStartBuild", () => {
    wrapper.vm.setStartBuild();
    expect(wrapper.vm.refinementBuild).toStrictEqual(REFINEMENT_BUILD);
  });
});

describe("Refinement.vue ___ no value", () => {
  let wrapper;

  const REFINEMENT_BUILD = [
    {
      id: "Constraint_0",
      value: null,
      position: 0,
      type: "Constraint",
      queryString: "",
      showButtons: { minus: false, plus: false }
    },
    {
      value: null,
      id: "Expression_1",
      position: 1,
      type: "Expression",
      queryString: "",
      showButtons: { minus: false, plus: false }
    },
    { id: "Operator_2", value: null, position: 2, type: "Operator", showButtons: { minus: false, plus: false }, queryString: "" },
    {
      id: "Constraint_3",
      value: null,
      position: 3,
      type: "Constraint",
      queryString: "",
      showButtons: { minus: false, plus: false }
    },
    {
      value: null,
      id: "Expression_4",
      position: 4,
      type: "Expression",
      queryString: "",
      showButtons: { minus: false, plus: false }
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    wrapper = shallowMount(Refinement, {
      props: {
        id: "refinementGroup_1refinement",
        last: true,
        position: 0,
        value: {
          children: []
        }
      }
    });
  });

  it("mounts", () => {
    expect(wrapper.vm.refinementBuild).toStrictEqual(REFINEMENT_BUILD);
    expect(wrapper.vm.id).toBe("refinementGroup_1refinement");
    expect(wrapper.vm.showButtons).toStrictEqual({ minus: true, plus: true });
    expect(wrapper.vm.position).toBe(0);
    expect(wrapper.vm.value).toStrictEqual({ children: [] });
    expect(wrapper.vm.refinementBuild).toStrictEqual(REFINEMENT_BUILD);
  });
});
