export default {
  ENTITY: {
    "@id": "http://snomed.info/sct#111266001",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
      {
        "@id": "http://endhealth.info/im#Concept",
        name: "Terminology Concept"
      }
    ],
    "http://www.w3.org/2000/01/rdf-schema#label": "Acquired scoliosis (disorder)"
  },

  PARENTS: [
    {
      name: "Acquired curvature of spine (disorder)",
      parents: [],
      hasChildren: false,
      hasGrandChildren: false,
      type: [
        {
          name: "Terminology Concept",
          "@id": "http://endhealth.info/im#Concept"
        }
      ],
      orderNumber: 0,
      "@id": "http://snomed.info/sct#12903001"
    },
    {
      name: "Scoliosis deformity of spine (disorder)",
      parents: [],
      hasChildren: false,
      hasGrandChildren: false,
      type: [
        {
          name: "Terminology Concept",
          "@id": "http://endhealth.info/im#Concept"
        }
      ],
      orderNumber: 0,
      "@id": "http://snomed.info/sct#298382003"
    }
  ],

  CHILDREN: {
    totalCount: 7,
    result: [
      {
        name: "Acquired kyphoscoliosis (disorder)",
        parents: [],
        hasChildren: true,
        hasGrandChildren: false,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#405771009"
      },
      {
        name: "Adolescent idiopathic scoliosis (disorder)",
        parents: [],
        hasChildren: true,
        hasGrandChildren: true,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#203646004"
      },
      {
        name: "Infantile idiopathic scoliosis of cervical spine (disorder)",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#310421000119106"
      },
      {
        name: "Post-surgical scoliosis (disorder)",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#203647008"
      },
      {
        name: "Scoliosis caused by radiation (disorder)",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#47518006"
      },
      {
        name: "Scoliosis due to and following traumatic injury (disorder)",
        parents: [],
        hasChildren: false,
        hasGrandChildren: false,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#1162310008"
      },
      {
        name: "Thoracogenic scoliosis (disorder)",
        parents: [],
        hasChildren: true,
        hasGrandChildren: false,
        type: [
          {
            name: "Terminology Concept",
            "@id": "http://endhealth.info/im#Concept"
          }
        ],
        orderNumber: 0,
        "@id": "http://snomed.info/sct#72992003"
      }
    ]
  },

  SUMMARY: {
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
  }
};
