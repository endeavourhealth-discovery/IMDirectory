export default {
  DEFINITION: [
    {
      label: "Definition",
      predicate: "http://endhealth.info/im#definition",
      type: "TextDefinition",
      size: "100%",
      order: 201
    },
    {
      label: "Terms",
      predicate: "termCodes",
      type: "TermsTable",
      size: "100%",
      order: 301
    },
    {
      label: "Has sub types",
      predicate: "subtypes",
      type: "ArrayObjectNameListboxWithLabel",
      size: "100%",
      order: 202
    },
    {
      label: "Is child of",
      predicate: "http://endhealth.info/im#isChildOf",
      type: "ArrayObjectNameListboxWithLabel",
      size: "100%",
      order: 203
    },
    {
      label: "Has children",
      predicate: "http://endhealth.info/im#hasChildren",
      type: "ArrayObjectNameListboxWithLabel",
      size: "100%",
      order: 204
    },
    {
      label: "DefinitionTermsDivider",
      predicate: "None",
      type: "SectionDivider",
      size: "100%",
      order: 300
    }
  ],
  SUMMARY: [
    {
      label: "Summary",
      predicate: "None",
      type: "TextSectionHeader",
      size: "100%",
      order: 100
    },
    {
      label: "Name",
      predicate: "http://www.w3.org/2000/01/rdf-schema#label",
      type: "TextWithLabel",
      size: "100%",
      order: 101
    },
    {
      label: "Types",
      predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      type: "ArrayObjectNamesToStringWithLabel",
      size: "100%",
      order: 104
    },
    {
      label: "Iri",
      predicate: "@id",
      type: "TextWithLabel",
      size: "100%",
      order: 102
    },
    {
      label: "Code",
      predicate: "http://endhealth.info/im#code",
      type: "TextWithLabel",
      size: "100%",
      order: 103
    },
    {
      label: "Status",
      predicate: "http://endhealth.info/im#status",
      type: "ArrayObjectNameTagWithLabel",
      size: "100%",
      order: 103
    },
    {
      label: "Description",
      predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
      type: "TextHTMLWithLabel",
      size: "100%",
      order: 105
    }
  ],
  ENTITY: {
    "@id": "http://snomed.info/sct#111266001",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
      {
        "@id": "http://endhealth.info/im#Concept",
        name: "Terminology Concept"
      }
    ],
    "http://www.w3.org/2000/01/rdf-schema#label": "Acquired scoliosis (disorder)",
    "http://endhealth.info/im#status": [
      {
        "@id": "http://endhealth.info/im#Active",
        name: "Active"
      }
    ],
    "http://endhealth.info/im#code": "111266001"
  },
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
  INFERRED_BUNDLE: {
    entity: {
      "@id": "http://snomed.info/sct#111266001",
      "http://endhealth.info/im#isA": [
        {
          "@id": "http://snomed.info/sct#64572001",
          name: "Disease (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#928000",
          name: "Disorder of musculoskeletal system (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#362965005",
          name: "Disorder of body system (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#106028002",
          name: "Musculoskeletal finding (finding)"
        },
        {
          "@id": "http://snomed.info/sct#40668007",
          name: "Acquired musculoskeletal deformity (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#410730009",
          name: "Disorder of spinal region (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#417893002",
          name: "Deformity (finding)"
        },
        {
          "@id": "http://snomed.info/sct#414252009",
          name: "Finding of back (finding)"
        },
        {
          "@id": "http://snomed.info/sct#12903001",
          name: "Acquired curvature of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#64217002",
          name: "Curvature of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#77567004",
          name: "Acquired deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#404684003",
          name: "Clinical finding (finding)"
        },
        {
          "@id": "http://snomed.info/sct#298379008",
          name: "Finding of spinal region (finding)"
        },
        {
          "@id": "http://snomed.info/sct#33308003",
          name: "Disorder of back (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#24901004",
          name: "Other acquired scoliosis, NEC (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#111266001",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298380006",
          name: "Deformity of spine (finding)"
        },
        {
          "@id": "http://snomed.info/sct#298382003",
          name: "Scoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        }
      ],
      "http://endhealth.info/im#im1Id": "SN_111266001",
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
        {
          "@id": "http://snomed.info/sct#12903001",
          name: "Acquired curvature of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298382003",
          name: "Scoliosis deformity of spine (disorder)"
        }
      ],
      "http://endhealth.info/im#definitionalStatus": [
        {
          "@id": "http://endhealth.info/im#1251000252106",
          name: "Necessary and sufficient"
        }
      ],
      "http://endhealth.info/im#roleGroup": [
        {
          "http://endhealth.info/im#groupNumber": 1,
          "http://snomed.info/sct#116676008": [
            {
              "@id": "http://snomed.info/sct#31739005",
              name: "Lateral abnormal curvature (morphologic abnormality)"
            }
          ],
          "http://snomed.info/sct#363698007": [
            {
              "@id": "http://snomed.info/sct#289959001",
              name: "Musculoskeletal structure of spine (body structure)"
            }
          ],
          "http://snomed.info/sct#246454002": [
            {
              "@id": "http://snomed.info/sct#767023003",
              name: "Period of life beginning after birth and ending before death (qualifier value)"
            }
          ]
        }
      ],
      "http://endhealth.info/im#scheme": [
        {
          "@id": "http://snomed.info/sct#",
          name: "Snomed-CT code scheme and graph"
        }
      ],
      "http://endhealth.info/im#hasMap": [
        {
          "http://endhealth.info/im#someOf": [
            {
              "http://endhealth.info/im#mapAdvice": "ALWAYS M41.9 | FIFTH CHARACTER POSSIBLE",
              "http://endhealth.info/im#mapPriority": 2,
              "http://endhealth.info/im#assuranceLevel": [
                {
                  "@id": "http://endhealth.info/im#NationallyAssuredUK",
                  name: "Nationally assured UK level"
                }
              ],
              "http://endhealth.info/im#mappedTo": [
                {
                  "@id": "http://endhealth.info/icd10#M419",
                  name: "Scoliosis, unspecified"
                }
              ]
            },
            {
              "http://endhealth.info/im#mapAdvice": "ALWAYS M41.8 | FIFTH CHARACTER POSSIBLE",
              "http://endhealth.info/im#mapPriority": 1,
              "http://endhealth.info/im#assuranceLevel": [
                {
                  "@id": "http://endhealth.info/im#NationallyAssuredUK",
                  name: "Nationally assured UK level"
                }
              ],
              "http://endhealth.info/im#mappedTo": [
                {
                  "@id": "http://endhealth.info/icd10#M418",
                  name: "Other forms of scoliosis"
                }
              ]
            }
          ]
        }
      ],
      "http://endhealth.info/im#hasTermCode": [
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "Acquired scoliosis",
          "http://endhealth.info/im#status": [
            {
              "@id": "http://endhealth.info/im#Active",
              name: "Active"
            }
          ],
          "http://endhealth.info/im#code": "178485010"
        },
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "Acquired scoliosis (disorder)",
          "http://endhealth.info/im#status": [
            {
              "@id": "http://endhealth.info/im#Active",
              name: "Active"
            }
          ],
          "http://endhealth.info/im#code": "629792015"
        }
      ]
    },
    predicates: {
      "http://endhealth.info/im#code": "code",
      "http://endhealth.info/im#mapAdvice": "mapping advice",
      "http://snomed.info/sct#24901004": "Other acquired scoliosis, NEC (disorder)",
      "http://snomed.info/sct#111266001": "Acquired scoliosis (disorder)",
      "http://snomed.info/sct#417893002": "Deformity (finding)",
      "http://endhealth.info/im#isA": "is a",
      "http://endhealth.info/icd10#M418": "Other forms of scoliosis",
      "http://endhealth.info/icd10#M419": "Scoliosis, unspecified",
      "http://endhealth.info/im#NationallyAssuredUK": "Nationally assured UK level",
      "http://snomed.info/sct#12903001": "Acquired curvature of spine (disorder)",
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": "subClassOf",
      "http://endhealth.info/im#status": "status",
      "http://snomed.info/sct#287079004": "Kyphoscoliosis/scoliosis - acquired (disorder)",
      "http://snomed.info/sct#404684003": "Clinical finding (finding)",
      "http://endhealth.info/im#Inactive": "Inactive",
      "http://endhealth.info/im#Active": "Active",
      "http://snomed.info/sct#40668007": "Acquired musculoskeletal deformity (disorder)",
      "http://endhealth.info/im#roleGroup": "role group",
      "http://snomed.info/sct#116676008": "Associated morphology (attribute)",
      "http://endhealth.info/im#scheme": "scheme",
      "http://snomed.info/sct#246454002": "Occurrence (attribute)",
      "http://snomed.info/sct#": "Snomed-CT code scheme and graph",
      "http://snomed.info/sct#289959001": "Musculoskeletal structure of spine (body structure)",
      "http://snomed.info/sct#31739005": "Lateral abnormal curvature (morphologic abnormality)",
      "http://snomed.info/sct#203801002": "[X]Other secondary scoliosis (disorder)",
      "http://snomed.info/sct#298380006": "Deformity of spine (finding)",
      "http://snomed.info/sct#33308003": "Disorder of back (disorder)",
      "http://endhealth.info/im#im1Id": "im1 id",
      "http://snomed.info/sct#928000": "Disorder of musculoskeletal system (disorder)",
      "http://snomed.info/sct#64217002": "Curvature of spine (disorder)",
      "http://snomed.info/sct#767023003": "Period of life beginning after birth and ending before death (qualifier value)",
      "http://endhealth.info/im#definitionalStatus": "definitional status",
      "http://endhealth.info/im#hasMap": "has map",
      "http://snomed.info/sct#77567004": "Acquired deformity of spine (disorder)",
      "http://endhealth.info/im#groupNumber": "group Number",
      "http://endhealth.info/im#1251000252106": "Necessary and sufficient",
      "http://endhealth.info/im#someOf": "some of",
      "http://snomed.info/sct#64572001": "Disease (disorder)",
      "http://endhealth.info/im#mappedTo": "mapped to",
      "http://snomed.info/sct#106028002": "Musculoskeletal finding (finding)",
      "http://snomed.info/sct#410730009": "Disorder of spinal region (disorder)",
      "http://snomed.info/sct#363698007": "Finding site (attribute)",
      "http://endhealth.info/im#hasTermCode": "has term code",
      "http://endhealth.info/im#mapPriority": "mapPriority",
      "http://snomed.info/sct#391051000000108": "[X]Other secondary scoliosis (disorder)",
      "http://endhealth.info/im#assuranceLevel": "assurance level",
      "http://snomed.info/sct#414252009": "Finding of back (finding)",
      "http://snomed.info/sct#298379008": "Finding of spinal region (finding)",
      "http://snomed.info/sct#362965005": "Disorder of body system (disorder)",
      "http://snomed.info/sct#240225004": "Acquired scoliosis (disorder)",
      "http://snomed.info/sct#268138008":
        "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)",
      "http://snomed.info/sct#298382003": "Scoliosis deformity of spine (disorder)",
      "http://snomed.info/sct#156872006": "Kyphoscoliosis/scoliosis - acquired (disorder)"
    }
  }
};
