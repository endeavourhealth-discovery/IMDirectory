import Refinement from "@/components/sidebar/expressionConstraintsSearch/Refinement.vue";
import { shallowMount } from "@vue/test-utils";

describe("Refinement.vue ___ value", () => {
  let wrapper;

  const REFINEMENT_BUILD = [
    {
      id: "refinementGroup_1refinementconstraint",
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
      id: "refinementGroup_1refinementexpression",
      position: 1,
      type: "expression",
      label: "*",
      component: "Expression"
    },
    { id: "refinementGroup_1refinementoperator", value: { symbol: "=", name: "Equals" }, position: 2, type: "operator", component: "Operator", label: "=" },
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
      id: "refinementGroup_1refinementexpression",
      position: 4,
      type: "expression",
      label: "*",
      component: "Expression"
    },
    {
      id: "refinementGroup_1refinementconstraint",
      value: { name: "Descendant or self of", symbol: "<<" },
      position: 3,
      type: "constraint",
      label: "<<",
      component: "Constraint"
    }
  ];

  const REFINEMENT_BUILD_SORTED = [
    {
      id: "refinementGroup_1refinementconstraint",
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
      id: "refinementGroup_1refinementexpression",
      position: 1,
      type: "expression",
      label: "*",
      component: "Expression"
    },
    { id: "refinementGroup_1refinementoperator", value: { symbol: "=", name: "Equals" }, position: 2, type: "operator", component: "Operator", label: "=" },
    {
      id: "refinementGroup_1refinementconstraint",
      value: { name: "Descendant or self of", symbol: "<<" },
      position: 3,
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
      id: "refinementGroup_1refinementexpression",
      position: 4,
      type: "expression",
      label: "*",
      component: "Expression"
    }
  ];

  const REFINEMENT = {
    component: "Refinement",
    id: "refinementGroup_1refinement",
    label: "<< * = << *",
    position: 0,
    type: "refinement",
    value: {
      children: [
        {
          component: "Constraint",
          id: "refinementGroup_1refinementconstraint",
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
          id: "refinementGroup_1refinementexpression",
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
        },
        {
          component: "Operator",
          id: "refinementGroup_1refinementoperator",
          label: "=",
          position: 2,
          type: "operator",
          value: {
            name: "Equals",
            symbol: "="
          }
        },
        {
          component: "Constraint",
          id: "refinementGroup_1refinementconstraint",
          label: "<<",
          position: 3,
          type: "constraint",
          value: {
            name: "Descendant or self of",
            symbol: "<<"
          }
        },
        {
          component: "Expression",
          id: "refinementGroup_1refinementexpression",
          label: "*",
          position: 4,
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

    wrapper = shallowMount(Refinement, {
      props: {
        id: "refinementGroup_1refinement",
        last: true,
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
    expect(wrapper.vm.last).toBe(true);
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
    wrapper.vm.addNextClicked();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().addNextOptionsClicked).toBeTruthy();
    expect(wrapper.emitted().addNextOptionsClicked[0]).toStrictEqual([
      {
        parentGroup: "refinementGroup",
        previousComponentType: "refinement",
        previousPosition: 0
      }
    ]);
  });

  it("can createRefinement", () => {
    wrapper.vm.generateRefinementLabel = jest.fn().mockReturnValue("<< * = << *");
    expect(wrapper.vm.createRefinement()).toStrictEqual(REFINEMENT);
  });

  it("can generateRefinementLabel", () => {
    expect(wrapper.vm.generateRefinementLabel()).toBe("<< * = << *");
  });

  it("can generateRefinementLabel ___ empty build", () => {
    wrapper.vm.refinementBuild = [];
    expect(wrapper.vm.generateRefinementLabel()).toBe("");
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
      id: "refinementGroup_1refinementconstraint",
      value: null,
      position: 0,
      type: "constraint",
      label: "",
      component: "Constraint"
    },
    {
      value: null,
      id: "refinementGroup_1refinementexpression",
      position: 1,
      type: "expression",
      label: "",
      component: "Expression"
    },
    { id: "refinementGroup_1refinementoperator", value: null, position: 2, type: "operator", component: "Operator", label: "" },
    {
      id: "refinementGroup_1refinementconstraint",
      value: null,
      position: 3,
      type: "constraint",
      label: "",
      component: "Constraint"
    },
    {
      value: null,
      id: "refinementGroup_1refinementexpression",
      position: 4,
      type: "expression",
      label: "",
      component: "Expression"
    }
  ];

  beforeEach(() => {
    jest.resetAllMocks();

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
    expect(wrapper.vm.last).toBe(true);
    expect(wrapper.vm.position).toBe(0);
    expect(wrapper.vm.value).toStrictEqual({ children: [] });
    expect(wrapper.vm.refinementBuild).toStrictEqual(REFINEMENT_BUILD);
  });
});
