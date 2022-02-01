import { flushPromises, shallowMount } from "@vue/test-utils";
import SecondaryTree from "@/components/concept/SecondaryTree.vue";
import Button from "primevue/button";
import Tree from "primevue/tree";
import ProgressSpinner from "primevue/progressspinner";
import OverlayPanel from "primevue/overlaypanel";
import EntityService from "@/services/EntityService";
import Tooltip from "primevue/tooltip";

describe("SecondaryTree.vue", () => {
  let wrapper: any;
  let mockToast: any;
  let mockRoute: any;
  let mockRouter: any;
  let mockRef: any;

  const CONCEPT = {
    "@id": "http://snomed.info/sct#298382003",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }],
    "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)"
  };
  const PARENTS = [
    {
      name: "Curvature of spine (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#64217002"
    },
    {
      name: "Disorder of musculoskeletal system (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#928000"
    },
    {
      name: "Disorder of vertebral column (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#699699005"
    }
  ];
  const CHILDREN = [
    {
      name: "Acquired scoliosis (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#111266001"
    },
    {
      name: "Acrodysplasia scoliosis (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#773773006"
    },
    {
      name: "Congenital scoliosis due to bony malformation (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#205045003"
    }
  ];

  const SUMMARY = {
    name: "Acquired scoliosis",
    iri: "http://snomed.info/sct#111266001",
    code: "111266001",
    description: "Acquired scoliosis (disorder)",
    status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
    scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
    entityType: [
      { name: "Ontological Concept", "@id": "http://endhealth.info/im#Concept" },
      { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
    ],
    isDescendentOf: [],
    match: "629792015"
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    mockToast = {
      add: jest.fn()
    };
    mockRef = { render: () => {}, methods: { show: jest.fn(), hide: jest.fn() } };
    mockRoute = { name: "Concept" };
    mockRouter = { push: jest.fn() };

    EntityService.getPartialEntity = jest.fn().mockResolvedValue(CONCEPT);
    EntityService.getEntityParents = jest.fn().mockResolvedValue(PARENTS);
    EntityService.getEntityChildren = jest.fn().mockResolvedValue(CHILDREN);
    EntityService.getEntitySummary = jest.fn().mockResolvedValue(SUMMARY);

    wrapper = shallowMount(SecondaryTree, {
      global: {
        components: { Button, Tree, ProgressSpinner, OverlayPanel },
        mocks: { $toast: mockToast, $route: mockRoute, $router: mockRouter },
        stubs: { OverlayPanel: mockRef, FontAwesomeIcon: true },
        directives: { Tooltip: Tooltip }
      },
      props: { conceptIri: "http://snomed.info/sct#298382003" }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    await flushPromises();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.conceptAggregate).toStrictEqual({
      concept: CONCEPT,
      parents: PARENTS,
      children: CHILDREN
    });
    expect(wrapper.vm.root).toStrictEqual([
      {
        children: [
          {
            children: [],
            color: "#e39a3688",
            data: "http://snomed.info/sct#111266001",
            key: "Acquired scoliosis (disorder)",
            label: "Acquired scoliosis (disorder)",
            leaf: false,
            loading: false,
            typeIcon: ["far", "lightbulb"]
          },
          {
            children: [],
            color: "#e39a3688",
            data: "http://snomed.info/sct#773773006",
            key: "Acrodysplasia scoliosis (disorder)",
            label: "Acrodysplasia scoliosis (disorder)",
            leaf: true,
            loading: false,
            typeIcon: ["far", "lightbulb"]
          },
          {
            children: [],
            color: "#e39a3688",
            data: "http://snomed.info/sct#205045003",
            key: "Congenital scoliosis due to bony malformation (disorder)",
            label: "Congenital scoliosis due to bony malformation (disorder)",
            leaf: true,
            loading: false,
            typeIcon: ["far", "lightbulb"]
          }
        ],
        color: "#e39a3688",
        data: "http://snomed.info/sct#298382003",
        key: "Scoliosis deformity of spine (disorder)",
        label: "Scoliosis deformity of spine (disorder)",
        leaf: true,
        loading: false,
        typeIcon: ["far", "lightbulb"]
      }
    ]);
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
    expect(wrapper.vm.selectedKey).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
    expect(wrapper.vm.currentParent).toStrictEqual({ iri: "http://snomed.info/sct#64217002", listPosition: 0, name: "Curvature of spine (disorder)" });
    expect(wrapper.vm.alternateParents).toStrictEqual([
      { iri: "http://snomed.info/sct#928000", listPosition: 1, name: "Disorder of musculoskeletal system (disorder)" },
      { iri: "http://snomed.info/sct#699699005", listPosition: 2, name: "Disorder of vertebral column (disorder)" }
    ]);
    expect(wrapper.vm.parentPosition).toBe(0);
    expect(wrapper.vm.hoveredResult).toStrictEqual({});
  });

  it("hidesPopup on unMount", () => {
    wrapper.vm.hidePopup = jest.fn();
    wrapper.vm.overlayLocation = { 1: 1, 2: 2, 3: 3 };
    wrapper.unmount();
    expect(wrapper.vm.hidePopup).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.hidePopup).toHaveBeenCalledWith({ 1: 1, 2: 2, 3: 3 });
  });

  it("hidesPopup on unMount ___ no keys", () => {
    wrapper.vm.hidePopup = jest.fn();
    wrapper.vm.overlayLocation = {};
    wrapper.unmount();
    expect(wrapper.vm.hidePopup).not.toHaveBeenCalled();
  });

  it("updates on conceptIri watch change", async () => {
    wrapper.vm.getConceptAggregate = jest.fn();
    wrapper.vm.createTree = jest.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://snomed.info/sct#298382003");
    expect(wrapper.vm.selectedKey).toStrictEqual({});
    expect(wrapper.vm.alternateParents).toStrictEqual([]);
    expect(wrapper.vm.expandedKeys).toStrictEqual({});
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.getConceptAggregate).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    await flushPromises();
    expect(wrapper.vm.createTree).toHaveBeenCalledTimes(1);
  });

  it("can getConceptAggregate ___ success", async () => {
    wrapper.vm.conceptAggregate = {};
    expect(wrapper.vm.conceptAggregate).toStrictEqual({});
    wrapper.vm.getConceptAggregate("http://snomed.info/sct#298382003");
    await flushPromises();
    expect(EntityService.getPartialEntity).toHaveBeenCalledTimes(1);
    expect(EntityService.getPartialEntity).toHaveBeenCalledWith("http://snomed.info/sct#298382003", [
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "http://www.w3.org/2000/01/rdf-schema#label"
    ]);
    expect(EntityService.getEntityParents).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityParents).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.conceptAggregate).toStrictEqual({
      concept: CONCEPT,
      parents: PARENTS,
      children: CHILDREN
    });
  });

  it("can createTree ___  !selected in expanded", async () => {
    wrapper.vm.setParents = jest.fn();
    wrapper.vm.root = [];
    wrapper.vm.expandedKeys = {};
    wrapper.vm.selectedKey = {};
    wrapper.vm.createTree(CONCEPT, PARENTS, CHILDREN, 0);
    expect(wrapper.vm.root).toStrictEqual([
      {
        children: [
          {
            children: [],
            color: "#e39a3688",
            data: "http://snomed.info/sct#111266001",
            key: "Acquired scoliosis (disorder)",
            label: "Acquired scoliosis (disorder)",
            leaf: false,
            loading: false,
            typeIcon: ["far", "lightbulb"]
          },
          {
            children: [],
            color: "#e39a3688",
            data: "http://snomed.info/sct#773773006",
            key: "Acrodysplasia scoliosis (disorder)",
            label: "Acrodysplasia scoliosis (disorder)",
            leaf: true,
            loading: false,
            typeIcon: ["far", "lightbulb"]
          },
          {
            children: [],
            color: "#e39a3688",
            data: "http://snomed.info/sct#205045003",
            key: "Congenital scoliosis due to bony malformation (disorder)",
            label: "Congenital scoliosis due to bony malformation (disorder)",
            leaf: true,
            loading: false,
            typeIcon: ["far", "lightbulb"]
          }
        ],
        color: "#e39a3688",
        data: "http://snomed.info/sct#298382003",
        key: "Scoliosis deformity of spine (disorder)",
        label: "Scoliosis deformity of spine (disorder)",
        leaf: true,
        loading: false,
        typeIcon: ["far", "lightbulb"]
      }
    ]);
    expect(wrapper.vm.setParents).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.selectedKey).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
  });

  it("can createTree ___  selected in expanded", async () => {
    wrapper.vm.setParents = jest.fn();
    wrapper.vm.root = [];
    wrapper.vm.expandedKeys = { "Scoliosis deformity of spine (disorder)": true };
    wrapper.vm.selectedKey = {};
    wrapper.vm.createTree(CONCEPT, PARENTS, CHILDREN, 0);
    expect(wrapper.vm.root).toStrictEqual([
      {
        children: [
          {
            children: [],
            color: "#e39a3688",
            data: "http://snomed.info/sct#111266001",
            key: "Acquired scoliosis (disorder)",
            label: "Acquired scoliosis (disorder)",
            leaf: false,
            loading: false,
            typeIcon: ["far", "lightbulb"]
          },
          {
            children: [],
            color: "#e39a3688",
            data: "http://snomed.info/sct#773773006",
            key: "Acrodysplasia scoliosis (disorder)",
            label: "Acrodysplasia scoliosis (disorder)",
            leaf: true,
            loading: false,
            typeIcon: ["far", "lightbulb"]
          },
          {
            children: [],
            color: "#e39a3688",
            data: "http://snomed.info/sct#205045003",
            key: "Congenital scoliosis due to bony malformation (disorder)",
            label: "Congenital scoliosis due to bony malformation (disorder)",
            leaf: true,
            loading: false,
            typeIcon: ["far", "lightbulb"]
          }
        ],
        color: "#e39a3688",
        data: "http://snomed.info/sct#298382003",
        key: "Scoliosis deformity of spine (disorder)",
        label: "Scoliosis deformity of spine (disorder)",
        leaf: true,
        loading: false,
        typeIcon: ["far", "lightbulb"]
      }
    ]);
    expect(wrapper.vm.setParents).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.selectedKey).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
  });

  it("setsParents ___ length === 1", () => {
    wrapper.vm.currentParent = {};
    wrapper.vm.alternateParents = [];
    wrapper.vm.setParents(
      [
        {
          name: "Curvature of spine (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#64217002"
        }
      ],
      0
    );
    expect(wrapper.vm.currentParent).toStrictEqual({ iri: "http://snomed.info/sct#64217002", listPosition: 0, name: "Curvature of spine (disorder)" });
    expect(wrapper.vm.alternateParents).toStrictEqual([]);
  });

  it("setsParents ___ length > 1", () => {
    wrapper.vm.currentParent = {};
    wrapper.vm.alternateParents = [];
    wrapper.vm.setParents(
      [
        {
          name: "Curvature of spine (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#64217002"
        },
        {
          name: "Disorder of musculoskeletal system (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#928000"
        },
        {
          name: "Disorder of vertebral column (disorder)",
          hasChildren: false,
          type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
          "@id": "http://snomed.info/sct#699699005"
        }
      ],
      1
    );
    expect(wrapper.vm.currentParent).toStrictEqual({
      iri: "http://snomed.info/sct#928000",
      listPosition: 1,
      name: "Disorder of musculoskeletal system (disorder)"
    });
    expect(wrapper.vm.alternateParents).toStrictEqual([
      { iri: "http://snomed.info/sct#64217002", listPosition: 0, name: "Curvature of spine (disorder)" },
      { iri: "http://snomed.info/sct#699699005", listPosition: 2, name: "Disorder of vertebral column (disorder)" }
    ]);
  });

  it("setsParents ___ length === 0", () => {
    wrapper.vm.currentParent = {};
    wrapper.vm.alternateParents = [];
    wrapper.vm.setParents([], 0);
    expect(wrapper.vm.currentParent).toStrictEqual(null);
    expect(wrapper.vm.alternateParents).toStrictEqual([]);
  });

  it("can createTreeNode", () => {
    expect(
      wrapper.vm.createTreeNode(
        "Scoliosis deformity of spine (disorder)",
        "http://snomed.info/sct#298382003",
        [{ "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }],
        false
      )
    ).toStrictEqual({
      children: [],
      color: "#e39a3688",
      data: "http://snomed.info/sct#298382003",
      key: "Scoliosis deformity of spine (disorder)",
      label: "Scoliosis deformity of spine (disorder)",
      leaf: true,
      loading: false,
      typeIcon: ["far", "lightbulb"]
    });
  });

  it("can handle onNodeSelect", async () => {
    await flushPromises();
    wrapper.vm.selectedKey = { "Scoliosis of lumbar spine (disorder)": true };
    wrapper.vm.onNodeSelect();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedKey).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
  });

  it("can expandChildren ___ !key ___ resolved service", async () => {
    EntityService.getEntityChildren = jest.fn().mockResolvedValue([
      {
        name: "Acquired kyphoscoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#405771009"
      },
      {
        name: "Adolescent idiopathic scoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203646004"
      },
      {
        name: "Infantile idiopathic scoliosis of cervical spine (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#310421000119106"
      },
      {
        name: "Post-surgical scoliosis (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203647008"
      },
      {
        name: "Scoliosis caused by radiation (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#47518006"
      },
      {
        name: "Thoracogenic scoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#72992003"
      }
    ]);
    wrapper.vm.expandedKeys = {};
    const testNode = {
      key: "Acquired scoliosis (disorder)",
      label: "Acquired scoliosis (disorder)",
      typeIcon: ["far", "lightbulb"],
      color: "#e39a3688",
      data: "http://snomed.info/sct#111266001",
      leaf: false,
      loading: false,
      children: []
    };
    wrapper.vm.expandChildren(testNode);
    expect(testNode.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Acquired scoliosis (disorder)": true });
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(1);
    expect(testNode).toStrictEqual({
      children: [
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#405771009",
          key: "Acquired kyphoscoliosis (disorder)",
          label: "Acquired kyphoscoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203646004",
          key: "Adolescent idiopathic scoliosis (disorder)",
          label: "Adolescent idiopathic scoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#310421000119106",
          key: "Infantile idiopathic scoliosis of cervical spine (disorder)",
          label: "Infantile idiopathic scoliosis of cervical spine (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203647008",
          key: "Post-surgical scoliosis (disorder)",
          label: "Post-surgical scoliosis (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#47518006",
          key: "Scoliosis caused by radiation (disorder)",
          label: "Scoliosis caused by radiation (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#72992003",
          key: "Thoracogenic scoliosis (disorder)",
          label: "Thoracogenic scoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        }
      ],
      color: "#e39a3688",
      data: "http://snomed.info/sct#111266001",
      key: "Acquired scoliosis (disorder)",
      label: "Acquired scoliosis (disorder)",
      leaf: false,
      loading: false,
      typeIcon: ["far", "lightbulb"]
    });
    expect(testNode.loading).toBe(false);
  });

  it("can expandChildren ___ key ___ resolved service ___ dup children", async () => {
    EntityService.getEntityChildren = jest.fn().mockResolvedValue([
      {
        name: "Acquired kyphoscoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#405771009"
      },
      {
        name: "Adolescent idiopathic scoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203646004"
      },
      {
        name: "Infantile idiopathic scoliosis of cervical spine (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#310421000119106"
      },
      {
        name: "Post-surgical scoliosis (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203647008"
      },
      {
        name: "Scoliosis caused by radiation (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#47518006"
      },
      {
        name: "Thoracogenic scoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#72992003"
      }
    ]);
    wrapper.vm.expandedKeys = { "Acquired scoliosis (disorder)": true };
    const testNode = {
      key: "Acquired scoliosis (disorder)",
      label: "Acquired scoliosis (disorder)",
      typeIcon: ["far", "lightbulb"],
      color: "#e39a3688",
      data: "http://snomed.info/sct#111266001",
      leaf: false,
      loading: false,
      children: [
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#405771009",
          key: "Acquired kyphoscoliosis (disorder)",
          label: "Acquired kyphoscoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        }
      ]
    };
    wrapper.vm.expandChildren(testNode);
    expect(testNode.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Acquired scoliosis (disorder)": true });
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(1);
    expect(testNode).toStrictEqual({
      children: [
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#405771009",
          key: "Acquired kyphoscoliosis (disorder)",
          label: "Acquired kyphoscoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203646004",
          key: "Adolescent idiopathic scoliosis (disorder)",
          label: "Adolescent idiopathic scoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#310421000119106",
          key: "Infantile idiopathic scoliosis of cervical spine (disorder)",
          label: "Infantile idiopathic scoliosis of cervical spine (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#203647008",
          key: "Post-surgical scoliosis (disorder)",
          label: "Post-surgical scoliosis (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#47518006",
          key: "Scoliosis caused by radiation (disorder)",
          label: "Scoliosis caused by radiation (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        },
        {
          children: [],
          color: "#e39a3688",
          data: "http://snomed.info/sct#72992003",
          key: "Thoracogenic scoliosis (disorder)",
          label: "Thoracogenic scoliosis (disorder)",
          leaf: false,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        }
      ],
      color: "#e39a3688",
      data: "http://snomed.info/sct#111266001",
      key: "Acquired scoliosis (disorder)",
      label: "Acquired scoliosis (disorder)",
      leaf: false,
      loading: false,
      typeIcon: ["far", "lightbulb"]
    });
    expect(testNode.loading).toBe(false);
  });

  it("can check if containsChild ___ true", () => {
    const testNode = {
      key: "Acquired scoliosis (disorder)",
      label: "Acquired scoliosis (disorder)",
      typeIcon: "far fa-fw fa-lightbulb",
      color: "#e39a3688",
      data: "http://snomed.info/sct#111266001",
      leaf: false,
      loading: false,
      children: [
        {
          key: "Acquired kyphoscoliosis (disorder)",
          label: "Acquired kyphoscoliosis (disorder)",
          typeIcon: "far fa-fw fa-lightbulb",
          color: "#e39a3688",
          data: "http://snomed.info/sct#405771009",
          leaf: false,
          loading: false,
          children: []
        },
        {
          key: "Adolescent idiopathic scoliosis (disorder)",
          label: "Adolescent idiopathic scoliosis (disorder)",
          typeIcon: "far fa-fw fa-lightbulb",
          color: "#e39a3688",
          data: "http://snomed.info/sct#203646004",
          leaf: false,
          loading: false,
          children: []
        }
      ]
    };
    expect(
      wrapper.vm.containsChild(testNode.children, {
        name: "Acquired kyphoscoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#405771009"
      })
    ).toBe(true);
  });

  it("can check if containsChild ___ false", () => {
    const testNode = {
      key: "Acquired scoliosis (disorder)",
      label: "Acquired scoliosis (disorder)",
      typeIcon: "far fa-fw fa-lightbulb",
      color: "#e39a3688",
      data: "http://snomed.info/sct#111266001",
      leaf: false,
      loading: false,
      children: [
        {
          key: "Adolescent idiopathic scoliosis (disorder)",
          label: "Adolescent idiopathic scoliosis (disorder)",
          typeIcon: "far fa-fw fa-lightbulb",
          color: "#e39a3688",
          data: "http://snomed.info/sct#203646004",
          leaf: false,
          loading: false,
          children: []
        }
      ]
    };
    expect(
      wrapper.vm.containsChild(testNode.children, {
        name: "Acquired kyphoscoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#405771009"
      })
    ).toBe(false);
  });

  it("can expandParents ___ no key", async () => {
    wrapper.vm.expandedKeys = {};
    wrapper.vm.createExpandedParentTree = jest.fn().mockReturnValue({
      data: {
        key: "Curvature of spine (disorder)",
        label: "Curvature of spine (disorder)",
        typeIcon: "far fa-fw fa-lightbulb",
        color: "#e39a3688",
        data: "http://snomed.info/sct#64217002",
        leaf: false,
        loading: false,
        children: [
          {
            key: "Scoliosis deformity of spine (disorder)",
            label: "Scoliosis deformity of spine (disorder)",
            typeIcon: "far fa-fw fa-lightbulb",
            color: "#e39a3688",
            data: "http://snomed.info/sct#298382003",
            leaf: true,
            loading: false,
            children: [
              {
                key: "Acquired scoliosis (disorder)",
                label: "Acquired scoliosis (disorder)",
                typeIcon: "far fa-fw fa-lightbulb",
                color: "#e39a3688",
                data: "http://snomed.info/sct#111266001",
                leaf: false,
                loading: false,
                children: []
              }
            ]
          }
        ]
      }
    });
    wrapper.vm.setExpandedParentParents = jest.fn();
    wrapper.vm.expandParents(0);
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
    expect(EntityService.getEntityParents).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.createExpandedParentTree).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.setExpandedParentParents).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.root).toStrictEqual([
      {
        data: {
          children: [
            {
              children: [
                {
                  children: [],
                  color: "#e39a3688",
                  data: "http://snomed.info/sct#111266001",
                  key: "Acquired scoliosis (disorder)",
                  label: "Acquired scoliosis (disorder)",
                  leaf: false,
                  loading: false,
                  typeIcon: "far fa-fw fa-lightbulb"
                }
              ],
              color: "#e39a3688",
              data: "http://snomed.info/sct#298382003",
              key: "Scoliosis deformity of spine (disorder)",
              label: "Scoliosis deformity of spine (disorder)",
              leaf: true,
              loading: false,
              typeIcon: "far fa-fw fa-lightbulb"
            }
          ],
          color: "#e39a3688",
          data: "http://snomed.info/sct#64217002",
          key: "Curvature of spine (disorder)",
          label: "Curvature of spine (disorder)",
          leaf: false,
          loading: false,
          typeIcon: "far fa-fw fa-lightbulb"
        }
      }
    ]);
  });

  it("can expandParents ___ key", async () => {
    wrapper.vm.expandedKeys = { "Scoliosis deformity of spine (disorder)": true };
    wrapper.vm.createExpandedParentTree = jest.fn().mockReturnValue({
      data: {
        key: "Curvature of spine (disorder)",
        label: "Curvature of spine (disorder)",
        typeIcon: "far fa-fw fa-lightbulb",
        color: "#e39a3688",
        data: "http://snomed.info/sct#64217002",
        leaf: false,
        loading: false,
        children: [
          {
            key: "Scoliosis deformity of spine (disorder)",
            label: "Scoliosis deformity of spine (disorder)",
            typeIcon: "far fa-fw fa-lightbulb",
            color: "#e39a3688",
            data: "http://snomed.info/sct#298382003",
            leaf: true,
            loading: false,
            children: [
              {
                key: "Acquired scoliosis (disorder)",
                label: "Acquired scoliosis (disorder)",
                typeIcon: "far fa-fw fa-lightbulb",
                color: "#e39a3688",
                data: "http://snomed.info/sct#111266001",
                leaf: false,
                loading: false,
                children: []
              }
            ]
          }
        ]
      }
    });
    wrapper.vm.setExpandedParentParents = jest.fn();
    wrapper.vm.expandParents(0);
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Scoliosis deformity of spine (disorder)": true });
    expect(EntityService.getEntityParents).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.createExpandedParentTree).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.setExpandedParentParents).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.root).toStrictEqual([
      {
        data: {
          children: [
            {
              children: [
                {
                  children: [],
                  color: "#e39a3688",
                  data: "http://snomed.info/sct#111266001",
                  key: "Acquired scoliosis (disorder)",
                  label: "Acquired scoliosis (disorder)",
                  leaf: false,
                  loading: false,
                  typeIcon: "far fa-fw fa-lightbulb"
                }
              ],
              color: "#e39a3688",
              data: "http://snomed.info/sct#298382003",
              key: "Scoliosis deformity of spine (disorder)",
              label: "Scoliosis deformity of spine (disorder)",
              leaf: true,
              loading: false,
              typeIcon: "far fa-fw fa-lightbulb"
            }
          ],
          color: "#e39a3688",
          data: "http://snomed.info/sct#64217002",
          key: "Curvature of spine (disorder)",
          label: "Curvature of spine (disorder)",
          leaf: false,
          loading: false,
          typeIcon: "far fa-fw fa-lightbulb"
        }
      }
    ]);
  });

  it("can expandParents ___ no root", async () => {
    wrapper.vm.root = undefined;
    EntityService.getEntityParents = jest.fn().mockRejectedValue(false);
    wrapper.vm.expandParents(0);
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(EntityService.getEntityParents).not.toHaveBeenCalled();
  });

  it("can createExpandedParentTree", () => {
    expect(
      wrapper.vm.createExpandedParentTree(
        [
          {
            name: "Acquired curvature of spine (disorder)",
            hasChildren: false,
            type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
            "@id": "http://snomed.info/sct#12903001"
          },
          {
            name: "Scoliosis deformity of spine (disorder)",
            hasChildren: false,
            type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
            "@id": "http://snomed.info/sct#298382003"
          }
        ],
        0
      )
    ).toStrictEqual({
      children: [
        {
          children: [
            {
              children: [],
              color: "#e39a3688",
              data: "http://snomed.info/sct#111266001",
              key: "Acquired scoliosis (disorder)",
              label: "Acquired scoliosis (disorder)",
              leaf: false,
              loading: false,
              typeIcon: ["far", "lightbulb"]
            },
            {
              children: [],
              color: "#e39a3688",
              data: "http://snomed.info/sct#773773006",
              key: "Acrodysplasia scoliosis (disorder)",
              label: "Acrodysplasia scoliosis (disorder)",
              leaf: true,
              loading: false,
              typeIcon: ["far", "lightbulb"]
            },
            {
              children: [],
              color: "#e39a3688",
              data: "http://snomed.info/sct#205045003",
              key: "Congenital scoliosis due to bony malformation (disorder)",
              label: "Congenital scoliosis due to bony malformation (disorder)",
              leaf: true,
              loading: false,
              typeIcon: ["far", "lightbulb"]
            }
          ],
          color: "#e39a3688",
          data: "http://snomed.info/sct#298382003",
          key: "Scoliosis deformity of spine (disorder)",
          label: "Scoliosis deformity of spine (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        }
      ],
      color: "#e39a3688",
      data: "http://snomed.info/sct#12903001",
      key: "Acquired curvature of spine (disorder)",
      label: "Acquired curvature of spine (disorder)",
      leaf: false,
      loading: false,
      typeIcon: ["far", "lightbulb"]
    });
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Acquired curvature of spine (disorder)": true, "Scoliosis deformity of spine (disorder)": true });
  });

  it("can createExpandedParentTree ___ existingExpandedKey", () => {
    wrapper.vm.expandedKeys["Acquired curvature of spine (disorder)"] = true;
    expect(
      wrapper.vm.createExpandedParentTree(
        [
          {
            name: "Acquired curvature of spine (disorder)",
            hasChildren: false,
            type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
            "@id": "http://snomed.info/sct#12903001"
          },
          {
            name: "Scoliosis deformity of spine (disorder)",
            hasChildren: false,
            type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
            "@id": "http://snomed.info/sct#298382003"
          }
        ],
        0
      )
    ).toStrictEqual({
      children: [
        {
          children: [
            {
              children: [],
              color: "#e39a3688",
              data: "http://snomed.info/sct#111266001",
              key: "Acquired scoliosis (disorder)",
              label: "Acquired scoliosis (disorder)",
              leaf: false,
              loading: false,
              typeIcon: ["far", "lightbulb"]
            },
            {
              children: [],
              color: "#e39a3688",
              data: "http://snomed.info/sct#773773006",
              key: "Acrodysplasia scoliosis (disorder)",
              label: "Acrodysplasia scoliosis (disorder)",
              leaf: true,
              loading: false,
              typeIcon: ["far", "lightbulb"]
            },
            {
              children: [],
              color: "#e39a3688",
              data: "http://snomed.info/sct#205045003",
              key: "Congenital scoliosis due to bony malformation (disorder)",
              label: "Congenital scoliosis due to bony malformation (disorder)",
              leaf: true,
              loading: false,
              typeIcon: ["far", "lightbulb"]
            }
          ],
          color: "#e39a3688",
          data: "http://snomed.info/sct#298382003",
          key: "Scoliosis deformity of spine (disorder)",
          label: "Scoliosis deformity of spine (disorder)",
          leaf: true,
          loading: false,
          typeIcon: ["far", "lightbulb"]
        }
      ],
      color: "#e39a3688",
      data: "http://snomed.info/sct#12903001",
      key: "Acquired curvature of spine (disorder)",
      label: "Acquired curvature of spine (disorder)",
      leaf: false,
      loading: false,
      typeIcon: ["far", "lightbulb"]
    });
    expect(wrapper.vm.expandedKeys).toStrictEqual({ "Acquired curvature of spine (disorder)": true, "Scoliosis deformity of spine (disorder)": true });
  });

  it("can setExpandedParentParents ___ length === 0", async () => {
    expect(wrapper.vm.currentParent).toStrictEqual({ iri: "http://snomed.info/sct#64217002", listPosition: 0, name: "Curvature of spine (disorder)" });
    expect(wrapper.vm.alternateParents).toStrictEqual([
      { iri: "http://snomed.info/sct#928000", listPosition: 1, name: "Disorder of musculoskeletal system (disorder)" },
      { iri: "http://snomed.info/sct#699699005", listPosition: 2, name: "Disorder of vertebral column (disorder)" }
    ]);
    EntityService.getEntityParents = jest.fn().mockResolvedValue([]);
    wrapper.vm.setExpandedParentParents();
    await flushPromises();
    expect(EntityService.getEntityParents).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityParents).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.currentParent).toBe(null);
    expect(wrapper.vm.alternateParents).toStrictEqual([]);
  });

  it("can setExpandedParentParents ___ length === 1", async () => {
    expect(wrapper.vm.currentParent).toStrictEqual({ iri: "http://snomed.info/sct#64217002", listPosition: 0, name: "Curvature of spine (disorder)" });
    expect(wrapper.vm.alternateParents).toStrictEqual([
      { iri: "http://snomed.info/sct#928000", listPosition: 1, name: "Disorder of musculoskeletal system (disorder)" },
      { iri: "http://snomed.info/sct#699699005", listPosition: 2, name: "Disorder of vertebral column (disorder)" }
    ]);
    EntityService.getEntityParents = jest.fn().mockResolvedValue([
      {
        "@id": "http://endhealth.info/im#InformationModel",
        hasChildren: false,
        name: "Information Model",
        type: [{ name: "Folder", "@id": "http://endhealth.info/im#Folder" }]
      }
    ]);
    wrapper.vm.setExpandedParentParents();
    await flushPromises();
    expect(EntityService.getEntityParents).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityParents).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.currentParent).toStrictEqual({ iri: "http://endhealth.info/im#InformationModel", listPosition: 0, name: "Information Model" });
    expect(wrapper.vm.alternateParents).toStrictEqual([]);
  });

  it("can setExpandedParentParents ___ length > 1", async () => {
    expect(wrapper.vm.currentParent).toStrictEqual({ iri: "http://snomed.info/sct#64217002", listPosition: 0, name: "Curvature of spine (disorder)" });
    expect(wrapper.vm.alternateParents).toStrictEqual([
      { iri: "http://snomed.info/sct#928000", listPosition: 1, name: "Disorder of musculoskeletal system (disorder)" },
      { iri: "http://snomed.info/sct#699699005", listPosition: 2, name: "Disorder of vertebral column (disorder)" }
    ]);
    EntityService.getEntityParents = jest.fn().mockResolvedValue([
      {
        name: "Curvature of spine (disorder)",
        hasChildren: false,
        type: [
          {
            name: "Class",
            "@id": "http://www.w3.org/2002/07/owl#Class"
          }
        ],
        "@id": "http://snomed.info/sct#64217002"
      },
      {
        name: "Disorder of musculoskeletal system (disorder)",
        hasChildren: false,
        type: [
          {
            name: "Class",
            "@id": "http://www.w3.org/2002/07/owl#Class"
          }
        ],
        "@id": "http://snomed.info/sct#928000"
      },
      {
        name: "Disorder of vertebral column (disorder)",
        hasChildren: false,
        type: [
          {
            name: "Class",
            "@id": "http://www.w3.org/2002/07/owl#Class"
          }
        ],
        "@id": "http://snomed.info/sct#699699005"
      }
    ]);
    wrapper.vm.setExpandedParentParents();
    await flushPromises();
    expect(EntityService.getEntityParents).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityParents).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.currentParent).toStrictEqual({ iri: "http://snomed.info/sct#64217002", listPosition: 0, name: "Curvature of spine (disorder)" });
    expect(wrapper.vm.alternateParents).toStrictEqual([
      { iri: "http://snomed.info/sct#928000", listPosition: 1, name: "Disorder of musculoskeletal system (disorder)" },
      { iri: "http://snomed.info/sct#699699005", listPosition: 2, name: "Disorder of vertebral column (disorder)" }
    ]);
  });

  it("can get concept types", () => {
    expect(
      wrapper.vm.getConceptTypes([
        { name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" },
        { name: "NodeShape", "@id": "hppt://www.w3.org/2002/07/owl#NodeShape" }
      ])
    ).toBe("Class, NodeShape");
  });

  it("can showPopup", async () => {
    wrapper.vm.showPopup("testEvent", "http://snomed.info/sct#111266001");
    await flushPromises();
    expect(mockRef.methods.show).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.show).toHaveBeenCalledWith("testEvent");
    expect(wrapper.vm.overlayLocation).toBe("testEvent");
    expect(wrapper.vm.hoveredResult).toStrictEqual({
      name: "Acquired scoliosis",
      iri: "http://snomed.info/sct#111266001",
      code: "111266001",
      description: "Acquired scoliosis (disorder)",
      status: { name: "Active", "@id": "http://endhealth.info/im#Active" },
      scheme: { name: "Snomed-CT namespace", "@id": "http://snomed.info/sct#" },
      entityType: [
        { name: "Ontological Concept", "@id": "http://endhealth.info/im#Concept" },
        { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
      ],
      isDescendentOf: [],
      match: "629792015"
    });
    expect(EntityService.getEntitySummary).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntitySummary).toHaveBeenCalledWith("http://snomed.info/sct#111266001");
  });

  it("can hidePopup", () => {
    wrapper.vm.hidePopup("testEvent");
    expect(mockRef.methods.hide).toHaveBeenCalledTimes(1);
    expect(mockRef.methods.hide).toHaveBeenCalledWith("testEvent");
    expect(wrapper.vm.overlayLocation).toStrictEqual({});
  });

  it("can navigate ___ metaKey", () => {
    wrapper.vm.navigate({ metaKey: true }, "testIri");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "testIri" } });
  });

  it("can navigate ___ ctrlKey", () => {
    wrapper.vm.navigate({ ctrlKey: true }, "testIri");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "testIri" } });
  });

  it("can navigate ___ other", () => {
    wrapper.vm.navigate({ shiftKey: true }, "testIri");
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
