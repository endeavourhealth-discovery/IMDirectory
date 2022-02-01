import { shallowMount } from "@vue/test-utils";
import Definition from "@/components/concept/Definition.vue";
import Divider from "primevue/divider";
import ArrayObjectNamesToStringWithLabel from "@/components/generics/ArrayObjectNamesToStringWithLabel.vue";
import TextHTMLWithLabel from "@/components/generics/TextHTMLWithLabel.vue";
import TextWithLabel from "@/components/generics/TextWithLabel.vue";
import ObjectNameWithLabel from "@/components/generics/ObjectNameWithLabel.vue";
import ArrayObjectNameListboxWithLabel from "@/components/generics/ArrayObjectNameListboxWithLabel.vue";

describe("Definition.vue ___ no headers", () => {
  let wrapper;
  const CONCEPT = {
    "@id": "http://snomed.info/sct#298382003",
    "http://endhealth.info/im#isA": [
      { "@id": "http://snomed.info/sct#64217002", name: "Curvature of spine (disorder)" },
      { "@id": "http://snomed.info/sct#928000", name: "Disorder of musculoskeletal system (disorder)" },
      { "@id": "http://snomed.info/sct#699699005", name: "Disorder of vertebral column (disorder)" }
    ],
    "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Active", name: "Active" },
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }],
    "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)",
    subtypes: [
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
      },
      {
        name: "Distal arthrogryposis type 4 (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#715575001"
      },
      {
        name: "Duane anomaly, myopathy, scoliosis syndrome (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#722432000"
      },
      {
        name: "Horizontal gaze palsy with progressive scoliosis (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#702381007"
      },
      {
        name: "Idiopathic scoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203639008"
      },
      {
        name: "Idiopathic scoliosis AND/OR kyphoscoliosis (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#30611007"
      },
      {
        name: "Kyphoscoliosis and scoliosis (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203638000"
      },
      {
        name: "Kyphoscoliosis deformity of spine (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#405773007"
      },
      {
        name: "Lordoscoliosis (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#111268000"
      },
      {
        name: "Neuromuscular scoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203662005"
      },
      {
        name: "Postural scoliosis (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203645000"
      },
      {
        name: "Radioulnar synostosis with microcephaly and scoliosis syndrome (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#719162001"
      },
      {
        name: "Scoliosis in connective tissue anomalies (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203664006"
      },
      {
        name: "Scoliosis in neurofibromatosis (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203663000"
      },
      {
        name: "Scoliosis in skeletal dysplasia (disorder)",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#203661003"
      },
      {
        name: "Scoliosis of cervical spine (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#298392006"
      },
      {
        name: "Scoliosis of lumbar spine (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#298591003"
      },
      {
        name: "Scoliosis of thoracic spine (disorder)",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
        "@id": "http://snomed.info/sct#298494008"
      }
    ],
    semanticProperties: [
      {
        property: { name: "Associated morphology (attribute)", "@id": "http://snomed.info/sct#116676008" },
        type: { name: "Lateral abnormal curvature (morphologic abnormality)", "@id": "http://snomed.info/sct#31739005" }
      }
    ],
    dataModelProperties: []
  };
  const CONFIGS = [
    { label: "Name", predicate: "http://www.w3.org/2000/01/rdf-schema#label", type: "TextWithLabel", size: "50%", order: 0 },
    { label: "Iri", predicate: "@id", type: "TextWithLabel", size: "50%", order: 1 },
    { label: "Status", predicate: "http://endhealth.info/im#status", type: "ObjectNameWithLabel", size: "50%", order: 2 },
    { label: "Types", predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", type: "ArrayObjectNamesToStringWithLabel", size: "50%", order: 3 },
    { label: "Description", predicate: "http://www.w3.org/2000/01/rdf-schema#comment", type: "TextHTMLWithLabel", size: "100%", order: 4 },
    { label: "Divider", predicate: "http://endhealth.info/im#isA", type: "Divider", size: "100%", order: 5 },
    { label: "is a", predicate: "http://endhealth.info/im#isA", type: "ListboxWithLabel", size: "50%", order: 6 },
    { label: "has sub types", predicate: "subtypes", type: "ListboxWithLabel", size: "50%", order: 7 },
    { label: "Divider", predicate: "dataModelProperties", type: "Divider", size: "100%", order: 8 },
    { label: "Semantic properties", predicate: "semanticProperties", type: "SemanticProperties", size: "100%", order: 9 },
    { label: "Divider", predicate: "dataModelProperties", type: "Divider", size: "100%", order: 10 },
    { label: "Data model properties", predicate: "dataModelProperties", type: "DataModelProperties", size: "100%", order: 11 }
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(Definition, {
      global: {
        components: {
          Divider,
          ArrayObjectNamesToStringWithLabel,
          TextHTMLWithLabel,
          TextWithLabel,
          ObjectNameWithLabel,
          ArrayObjectNameListboxWithLabel
        }
      },
      props: {
        concept: CONCEPT,
        configs: CONFIGS
      }
    });
  });

  it("sets hasData ___ array ___ true", () => {
    expect(wrapper.vm.hasData(CONCEPT[CONFIGS[5].predicate])).toBe(true);
  });

  it("sets hasData ___ array ___ false", () => {
    expect(wrapper.vm.hasData([])).toBe(false);
  });

  it("sets hasData ___ string ___ true", () => {
    expect(wrapper.vm.hasData("testString")).toBe(true);
  });

  it("sets hasData ___ string ___ false", () => {
    expect(wrapper.vm.hasData("")).toBe(false);
  });

  it("sets hasData ___ object with count ___ true", () => {
    expect(wrapper.vm.hasData({ count: 7 })).toBe(true);
  });

  it("sets hasData ___ object with count ___ false", () => {
    expect(wrapper.vm.hasData({ count: 0 })).toBe(false);
  });

  it("sets hasData ___ object bundle ___ true", () => {
    expect(wrapper.vm.hasData({ entity: { intersectionOf: "testString" }, predicates: ["testString"] })).toBe(true);
  });

  it("sets hasData ___ object bundle ___ false", () => {
    expect(wrapper.vm.hasData({ entity: {}, predicates: ["testString"] })).toBe(false);
  });

  it("sets hasData ___ object ___ true", () => {
    expect(wrapper.vm.hasData({ property: { dataModel: "testString" }, concept: ["testString"] })).toBe(true);
  });

  it("sets hasData ___ object ___ false", () => {
    expect(wrapper.vm.hasData({})).toBe(false);
  });

  it("sets hasData ___ number ___ true", () => {
    expect(wrapper.vm.hasData(3)).toBe(true);
  });

  it("sets hasData ___ unknown ___ false", () => {
    const log = console.log;
    console.log = jest.fn();
    wrapper.vm.hasData(function testFunction() {
      return true;
    });
    expect(console.log).toHaveBeenCalledWith(`Unexpected data type encountered for function hasData in definition. Data: undefined`);
    console.log = log;
  });

  it("sets showItem ___ divider ___ true", () => {
    expect(wrapper.vm.showItem(CONFIGS[5], 5)).toBe(true);
  });

  it("sets showItem ___ divider ___ false", () => {
    expect(wrapper.vm.showItem(CONFIGS[10], 10)).toBe(false);
  });

  it("sets showItem ___ other ___ true", () => {
    expect(wrapper.vm.showItem(CONFIGS[3], 3)).toBe(true);
  });

  it("sets showItem ___ other ___ false", () => {
    expect(wrapper.vm.showItem(CONFIGS[11], 11)).toBe(false);
  });
});

describe("Definition.vue ___ with headers", () => {
  let wrapper;
  const CONCEPT = {
    "@id": "http://endhealth.info/im#ModellingEntityType",
    "http://www.w3.org/2000/01/rdf-schema#comment": "Classifies  types of entities used in the information model",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://endhealth.info/im#Concept", name: "Concept" }],
    "http://www.w3.org/2000/01/rdf-schema#label": "Modelling entity type",
    subtypes: [
      {
        name: "Class",
        hasChildren: true,
        type: [
          { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
          { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
        ],
        "@id": "http://www.w3.org/2002/07/owl#Class"
      },
      {
        name: "Concept",
        hasChildren: true,
        type: [{ name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }],
        "@id": "http://endhealth.info/im#Concept"
      },
      {
        name: "Concept Set",
        hasChildren: false,
        type: [
          { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
          { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
        ],
        "@id": "http://endhealth.info/im#ConceptSet"
      },
      {
        name: "Concept set group",
        hasChildren: false,
        type: [{ name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }],
        "@id": "http://endhealth.info/im#ConceptSetGroup"
      },
      {
        name: "Folder",
        hasChildren: false,
        type: [
          { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
          { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
        ],
        "@id": "http://endhealth.info/im#Folder"
      },
      {
        name: "Node shape",
        hasChildren: false,
        type: [
          { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" },
          { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
        ],
        "@id": "http://www.w3.org/ns/shacl#NodeShape"
      },
      {
        name: "ObjectProperty",
        hasChildren: true,
        type: [
          { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
          { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
        ],
        "@id": "http://www.w3.org/2002/07/owl#ObjectProperty"
      },
      {
        name: "Property",
        hasChildren: true,
        type: [
          { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
          { name: "Class", "@id": "http://www.w3.org/2000/01/rdf-schema#Class" }
        ],
        "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
      },
      {
        name: "Query template",
        hasChildren: false,
        type: [
          { name: "Address (record type)", "@id": "http://endhealth.info/im#Address" },
          { name: "Concept", "@id": "http://endhealth.info/im#Concept" }
        ],
        "@id": "http://endhealth.info/im#QueryTemplate"
      },
      {
        name: "Value set",
        hasChildren: false,
        type: [
          { name: "Concept", "@id": "http://endhealth.info/im#Concept" },
          { name: "Organisation  (record type)", "@id": "http://endhealth.info/im#Organisation" }
        ],
        "@id": "http://endhealth.info/im#ValueSet"
      }
    ],
    termCodes: [{ name: "Modelling entity type", scheme: "Discovery namespace" }],
    inferred: {
      entity: {},
      predicates: {}
    }
  };
  const CONFIGS = [
    { label: "Summary", predicate: "None", type: "TextSectionHeader", size: "100%", order: 100 },
    { label: "Name", predicate: "http://www.w3.org/2000/01/rdf-schema#label", type: "TextWithLabel", size: "50%", order: 101 },
    { label: "Iri", predicate: "@id", type: "TextWithLabel", size: "50%", order: 102 },
    { label: "Status", predicate: "http://endhealth.info/im#status", type: "ObjectNameTagWithLabel", size: "50%", order: 103 },
    { label: "Types", predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", type: "ArrayObjectNamesToStringWithLabel", size: "50%", order: 104 },
    { label: "Description", predicate: "http://www.w3.org/2000/01/rdf-schema#comment", type: "TextHTMLWithLabel", size: "100%", order: 105 },
    { label: "SummaryInferredDivider", predicate: "None", type: "SectionDivider", size: "100%", order: 200 },
    { label: "Definition", predicate: "None", type: "TextSectionHeader", size: "100%", order: 201 },
    { label: "Inferred", predicate: "inferred", type: "TextDefinition", size: "100%", order: 202 },
    { label: "InferredTermsDivider", predicate: "None", type: "SectionDivider", size: "100%", order: 300 },
    { label: "Terms", predicate: "termCodes", type: "TermsTable", size: "100%", order: 301 }
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    wrapper = shallowMount(Definition, {
      global: {
        components: {
          Divider,
          ArrayObjectNamesToStringWithLabel,
          TextHTMLWithLabel,
          TextWithLabel,
          ObjectNameWithLabel,
          ArrayObjectNameListboxWithLabel
        }
      },
      props: {
        concept: CONCEPT,
        configs: CONFIGS
      }
    });
  });

  it("sets showItem ___ TextSectionHeader ___ true", () => {
    expect(wrapper.vm.showItem(CONFIGS[0], 0)).toBe(true);
  });

  it("sets showItem ___ TextSectionHeader ___ false", () => {
    expect(wrapper.vm.showItem(CONFIGS[7], 7)).toBe(false);
  });
});
