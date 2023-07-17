export const treeNodeProperty = {
  directFolderProperty: {
    key: "0-0-0-5",
    label: "calling name",
    typeIcon: ["fa-solid", "fa-pen-to-square"],
    color: "#e68a3388",
    conceptTypes: [{ "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property" }],
    data: "http://endhealth.info/im#callingName",
    leaf: true,
    loading: false,
    children: [],
    parent: {
      key: "0-0-0",
      label: "Demographic details",
      typeIcon: ["fa-solid", "fa-folder"],
      color: "#3f51a388",
      conceptTypes: [{ "@id": "http://endhealth.info/im#Folder" }],
      data: "http://endhealth.info/im#DemographicsGroup",
      leaf: false,
      loading: false,
      parent: {
        key: "0-0",
        label: "Patient",
        typeIcon: ["fa-solid", "fa-diagram-project"],
        color: "#781c8188",
        conceptTypes: [{ "@id": "http://www.w3.org/ns/shacl#NodeShape" }],
        data: "http://endhealth.info/im#Patient",
        leaf: false,
        loading: false,
        parent: { key: "0" },
        selectable: false
      },
      selectable: false
    },
    selectable: true,
    ttproperty: {
      "http://www.w3.org/ns/shacl#datatype": [{ "@id": "http://www.w3.org/2001/XMLSchema#string", name: "string" }],
      "http://www.w3.org/ns/shacl#order": 6,
      "http://www.w3.org/ns/shacl#path": [{ "@id": "http://endhealth.info/im#callingName", name: "calling name" }],
      "http://www.w3.org/ns/shacl#maxCount": 1,
      "http://www.w3.org/ns/shacl#group": [{ "@id": "http://endhealth.info/im#DemographicsGroup", name: "Demographic details" }]
    },
    selected: true
  },
  nestedProperty: {
    key: "0-0-0-9-0-0",
    label: "address line",
    typeIcon: ["fa-solid", "fa-pen-to-square"],
    color: "#e68a3388",
    conceptTypes: [{ "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property" }],
    data: "http://endhealth.info/im#addressLine",
    leaf: true,
    loading: false,
    children: [],
    parent: {
      key: "0-0-0-9-0",
      label: "Address",
      typeIcon: ["fa-solid", "fa-diagram-project"],
      color: "#781c8188",
      conceptTypes: [{ "@id": "http://www.w3.org/ns/shacl#NodeShape" }],
      data: "http://endhealth.info/im#Address",
      leaf: false,
      loading: false,
      parent: {
        key: "0-0-0-9",
        label: "home address",
        typeIcon: ["fa-solid", "fa-pen-to-square"],
        color: "#e68a3388",
        conceptTypes: [{ "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property" }],
        data: "http://endhealth.info/im#homeAddress",
        leaf: false,
        loading: false,
        parent: {
          key: "0-0-0",
          label: "Demographic details",
          typeIcon: ["fa-solid", "fa-folder"],
          color: "#3f51a388",
          conceptTypes: [{ "@id": "http://endhealth.info/im#Folder" }],
          data: "http://endhealth.info/im#DemographicsGroup",
          leaf: false,
          loading: false,
          parent: {
            key: "0-0",
            label: "Patient",
            typeIcon: ["fa-solid", "fa-diagram-project"],
            color: "#781c8188",
            conceptTypes: [{ "@id": "http://www.w3.org/ns/shacl#NodeShape" }],
            data: "http://endhealth.info/im#Patient",
            leaf: false,
            loading: false,
            parent: { key: "0" },
            selectable: false
          },
          selectable: false
        },
        selectable: true,
        ttproperty: {
          "http://www.w3.org/ns/shacl#order": 10,
          "http://www.w3.org/ns/shacl#path": [{ "@id": "http://endhealth.info/im#homeAddress", name: "home address" }],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#node": [{ "@id": "http://endhealth.info/im#Address", name: "Address" }],
          "http://www.w3.org/ns/shacl#group": [{ "@id": "http://endhealth.info/im#DemographicsGroup", name: "Demographic details" }]
        }
      },
      selectable: false
    },
    selectable: true,
    ttproperty: {
      "http://www.w3.org/ns/shacl#datatype": [{ "@id": "http://www.w3.org/2001/XMLSchema#string", name: "string" }],
      "http://www.w3.org/ns/shacl#order": 1,
      "http://www.w3.org/ns/shacl#path": [{ "@id": "http://endhealth.info/im#addressLine", name: "address line" }],
      "http://www.w3.org/ns/shacl#maxCount": 1
    },
    selected: true
  },
  nodeRefProperty: {
    key: "1-0-1",
    label: "text",
    typeIcon: ["fa-solid", "fa-pen-to-square"],
    color: "#e68a3388",
    conceptTypes: [{ "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property" }],
    data: "http://endhealth.info/im#text",
    leaf: true,
    loading: false,
    children: [],
    parent: {
      key: "1-0",
      label: "latestBP (Observation)",
      typeIcon: ["fa-solid", "fa-diagram-project"],
      color: "#781c8188",
      conceptTypes: [{ "@id": "http://www.w3.org/ns/shacl#NodeShape" }],
      data: "http://endhealth.info/im#Observation",
      leaf: false,
      loading: false,
      parent: { key: "1" },
      selectable: false
    },
    selectable: true,
    ttproperty: {
      "http://www.w3.org/ns/shacl#datatype": [{ "@id": "http://www.w3.org/2001/XMLSchema#string", name: "string" }],
      "http://www.w3.org/ns/shacl#order": 2,
      "http://www.w3.org/ns/shacl#path": [{ "@id": "http://endhealth.info/im#text", name: "text" }],
      "http://www.w3.org/ns/shacl#maxCount": 1,
      "http://endhealth.info/im#inheritedFrom": [{ "@id": "http://endhealth.info/im#Event", name: "Event" }]
    },
    selected: true
  }
};
