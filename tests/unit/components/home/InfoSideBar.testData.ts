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
    },
    {
      label: "Terms",
      predicate: "termCodes",
      type: "TermsTable",
      size: "100%",
      order: 301
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
      label: "Types",
      predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      type: "ArrayObjectNamesToStringWithLabel",
      size: "100%",
      order: 104
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
      "http://endhealth.info/im#roleGroup": [
        {
          "http://endhealth.info/im#groupNumber": "1",
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
      "http://endhealth.info/im#903421000252109": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903681000252106": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903501000252104": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903451000252101": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#hasSubSection": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903531000252106": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903341000252105": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#904001000252109": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903691000252109": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903801000252102": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903721000252100": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903831000252109": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903431000252107": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903371000252103": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903301000252108": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#im1Id": "SN_111266001",
      "http://endhealth.info/im#903561000252103": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903881000252105": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#hasProvenance": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#hasSubencounter": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
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
              "http://endhealth.info/im#mapPriority": "1",
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
      "http://endhealth.info/im#isMemberOf": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
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
      "http://endhealth.info/im#903901000252107": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903361000252109": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#matchedFrom": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903331000252101": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903551000252100": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#scheme": [
        {
          "@id": "http://snomed.info/sct#",
          name: "Snomed-CT code scheme and graph"
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
      ],
      "http://endhealth.info/im#provider": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903511000252101": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903481000252108": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903471000252105": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903291000252107": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#hasComponent": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#hasReplaced": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903391000252102": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903401000252100": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903321000252104": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903851000252103": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903601000252103": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#usedEntity": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#definitionalStatus": [
        {
          "@id": "http://endhealth.info/im#1251000252106",
          name: "Necessary and sufficient"
        }
      ],
      "http://endhealth.info/im#903411000252102": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#wasGeneratedBy": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903351000252107": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#isA": [
        {
          "@id": "http://www.w3.org/2000/01/rdf-schema#Class",
          name: "Class"
        },
        {
          "@id": "http://www.w3.org/2000/01/rdf-schema#Resource",
          name: "Resource"
        },
        {
          "@id": "http://snomed.info/sct#64572001",
          name: "Disease (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#404684003",
          name: "Clinical finding (finding)"
        },
        {
          "@id": "http://snomed.info/sct#417893002",
          name: "Deformity (finding)"
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
      "http://endhealth.info/im#inRoleGroupOf": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903311000252106": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ],
      "http://endhealth.info/im#903571000252109": [
        {
          "@id": "http://snomed.info/sct#47518006",
          name: "Scoliosis caused by radiation (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#72992003",
          name: "Thoracogenic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#405771009",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203646004",
          name: "Adolescent idiopathic scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203647008",
          name: "Post-surgical scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1162310008",
          name: "Scoliosis due to and following traumatic injury (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#310421000119106",
          name: "Infantile idiopathic scoliosis of cervical spine (disorder)"
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
          "@id": "http://snomed.info/sct#111267005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#156872006",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203643007",
          name: "Radiation scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#203801002",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#205442009",
          name: "Congenital [kyphosis] or [kyphoscoliosis] (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#240225004",
          name: "Acquired scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#254035000",
          name: "Congenital kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#268138008",
          name: "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281374005",
          name: "Acquired kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#281376007",
          name: "Thoracogenic kyphoscoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#287079004",
          name: "Kyphoscoliosis/scoliosis - acquired (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#298381005",
          name: "Kyphoscoliosis deformity of spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#301991000119105",
          name: "Adolescent idiopathic scoliosis of cervical spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302011000119105",
          name: "Adolescent idiopathic scoliosis of lumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302031000119100",
          name: "Adolescent idiopathic scoliosis of thoracic spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#302041000119109",
          name: "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#391051000000108",
          name: "[X]Other secondary scoliosis (disorder)"
        },
        {
          "@id": "http://snomed.info/sct#1127581000000103",
          name: "Health issues simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://snomed.info/sct#1127601000000107",
          name: "Healthcare matters simple reference set (foundation metadata concept)"
        },
        {
          "@id": "http://endhealth.info/emis#Nyu54",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#_M6A_",
          name: "Curvature of spine-acq."
        },
        {
          "@id": "http://endhealth.info/tpp#X70D3",
          name: "Acquired scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#Nyu54",
          name: "[X]Other secondary scoliosis"
        },
        {
          "@id": "http://endhealth.info/tpp#XE1JQ",
          name: "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)"
        },
        {
          "@id": "http://endhealth.info/icd10#M418",
          name: "Other forms of scoliosis"
        },
        {
          "@id": "http://endhealth.info/icd10#M419",
          name: "Scoliosis, unspecified"
        },
        {
          "@id": "http://endhealth.info/vis#Nyu54",
          name: "[X]Other secondary scoliosis"
        }
      ]
    },
    predicates: {
      "http://endhealth.info/im#903301000252108": "has fore mother",
      "http://endhealth.info/im#wasGeneratedBy": "was generated by",
      "http://endhealth.info/im#903371000252103": "has great grandfather",
      "http://endhealth.info/tpp#XE1JQ": "(Acq curv spine) or (acq kyph) or (acq lordos) or (acq scol)",
      "http://endhealth.info/im#code": "code",
      "http://endhealth.info/im#903601000252103": "has uncle",
      "http://endhealth.info/im#mapAdvice": "mapping advice",
      "http://endhealth.info/im#904001000252109": "is partner in",
      "http://endhealth.info/emis#Nyu54": "Acquired scoliosis",
      "http://snomed.info/sct#1162310008": "Scoliosis due to and following traumatic injury (disorder)",
      "http://endhealth.info/im#903901000252107": "is sister in law of",
      "http://endhealth.info/im#NationallyAssuredUK": "Nationally assured UK level",
      "http://snomed.info/sct#287079004": "Kyphoscoliosis/scoliosis - acquired (disorder)",
      "http://snomed.info/sct#302031000119100": "Adolescent idiopathic scoliosis of thoracic spine (disorder)",
      "http://endhealth.info/im#Inactive": "Inactive",
      "http://endhealth.info/im#matchedFrom": "matched from",
      "http://endhealth.info/im#Active": "Active",
      "http://www.w3.org/2000/01/rdf-schema#Class": "Class",
      "http://endhealth.info/im#scheme": "scheme",
      "http://snomed.info/sct#": "Snomed-CT code scheme and graph",
      "http://snomed.info/sct#289959001": "Musculoskeletal structure of spine (body structure)",
      "http://snomed.info/sct#302041000119109": "Adolescent idiopathic scoliosis of thoracolumbar spine (disorder)",
      "http://snomed.info/sct#31739005": "Lateral abnormal curvature (morphologic abnormality)",
      "http://snomed.info/sct#72992003": "Thoracogenic scoliosis (disorder)",
      "http://endhealth.info/im#903531000252106": "is daughter of",
      "http://endhealth.info/im#903691000252109": "has grandfather",
      "http://endhealth.info/im#hasSubSection": "has subsection",
      "http://snomed.info/sct#203801002": "[X]Other secondary scoliosis (disorder)",
      "http://snomed.info/sct#47518006": "Scoliosis caused by radiation (disorder)",
      "http://snomed.info/sct#33308003": "Disorder of back (disorder)",
      "http://endhealth.info/im#903431000252107": "is ancestor of",
      "http://endhealth.info/tpp#X70D3": "Acquired scoliosis",
      "http://snomed.info/sct#1127581000000103": "Health issues simple reference set (foundation metadata concept)",
      "http://snomed.info/sct#203646004": "Adolescent idiopathic scoliosis (disorder)",
      "http://snomed.info/sct#254035000": "Congenital kyphoscoliosis (disorder)",
      "http://endhealth.info/im#groupNumber": "group Number",
      "http://snomed.info/sct#281374005": "Acquired kyphoscoliosis (disorder)",
      "http://endhealth.info/im#903361000252109": "is aunt in law of",
      "http://endhealth.info/im#inRoleGroupOf": "is in role group of",
      "http://snomed.info/sct#302011000119105": "Adolescent idiopathic scoliosis of lumbar spine (disorder)",
      "http://endhealth.info/im#903311000252106": "is parent of",
      "http://snomed.info/sct#64572001": "Disease (disorder)",
      "http://endhealth.info/im#mappedTo": "mapped to",
      "http://snomed.info/sct#106028002": "Musculoskeletal finding (finding)",
      "http://snomed.info/sct#203643007": "Radiation scoliosis (disorder)",
      "http://endhealth.info/im#mapPriority": "mapPriority",
      "http://endhealth.info/vis#Nyu54": "[X]Other secondary scoliosis",
      "http://endhealth.info/im#assuranceLevel": "assurance level",
      "http://endhealth.info/im#903511000252101": "has great grand parent",
      "http://endhealth.info/im#903291000252107": "has child",
      "http://snomed.info/sct#240225004": "Acquired scoliosis (disorder)",
      "http://snomed.info/sct#268138008":
        "(Curvature of spine - acquired) or (kyphoscoliosis-acquired) or (lordosis - acquired) or (scoliosis - acquired) (disorder)",
      "http://endhealth.info/im#903391000252102": "is mother of",
      "http://snomed.info/sct#1127601000000107": "Healthcare matters simple reference set (foundation metadata concept)",
      "http://endhealth.info/im#hasReplaced": "has replaced",
      "http://snomed.info/sct#156872006": "Kyphoscoliosis/scoliosis - acquired (disorder)",
      "http://endhealth.info/im#903561000252103": "is grandmother of",
      "http://endhealth.info/im#903411000252102": "is aunt of",
      "http://endhealth.info/im#hasSubencounter": "has subencounter",
      "http://snomed.info/sct#24901004": "Other acquired scoliosis, NEC (disorder)",
      "http://snomed.info/sct#111266001": "Acquired scoliosis (disorder)",
      "http://snomed.info/sct#417893002": "Deformity (finding)",
      "http://endhealth.info/im#isA": "is a",
      "http://endhealth.info/icd10#M418": "Other forms of scoliosis",
      "http://endhealth.info/icd10#M419": "Scoliosis, unspecified",
      "http://snomed.info/sct#281376007": "Thoracogenic kyphoscoliosis (disorder)",
      "http://snomed.info/sct#12903001": "Acquired curvature of spine (disorder)",
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": "subClassOf",
      "http://endhealth.info/im#status": "status",
      "http://snomed.info/sct#404684003": "Clinical finding (finding)",
      "http://endhealth.info/im#903331000252101": "is mother in law of",
      "http://endhealth.info/im#903571000252109": "has wife",
      "http://snomed.info/sct#298381005": "Kyphoscoliosis deformity of spine (disorder)",
      "http://endhealth.info/im#provider": "provider",
      "http://snomed.info/sct#40668007": "Acquired musculoskeletal deformity (disorder)",
      "http://endhealth.info/im#roleGroup": "role group",
      "http://snomed.info/sct#116676008": "Associated morphology (attribute)",
      "http://endhealth.info/im#903501000252104": "has sister",
      "http://snomed.info/sct#246454002": "Occurrence (attribute)",
      "http://endhealth.info/im#903471000252105": "has father in law",
      "http://endhealth.info/im#903341000252105": "has fore father",
      "http://endhealth.info/tpp#Nyu54": "[X]Other secondary scoliosis",
      "http://snomed.info/sct#405771009": "Acquired kyphoscoliosis (disorder)",
      "http://snomed.info/sct#310421000119106": "Infantile idiopathic scoliosis of cervical spine (disorder)",
      "http://endhealth.info/im#903721000252100": "is brother in law of",
      "http://endhealth.info/im#903851000252103": "has great grandmother",
      "http://endhealth.info/im#903401000252100": "has father",
      "http://snomed.info/sct#298380006": "Deformity of spine (finding)",
      "http://endhealth.info/im#usedEntity": "used entity",
      "http://endhealth.info/im#903881000252105": "has grand parent",
      "http://endhealth.info/im#hasProvenance": "has provenance",
      "http://endhealth.info/im#im1Id": "im1 id",
      "http://snomed.info/sct#928000": "Disorder of musculoskeletal system (disorder)",
      "http://snomed.info/sct#64217002": "Curvature of spine (disorder)",
      "http://snomed.info/sct#767023003": "Period of life beginning after birth and ending before death (qualifier value)",
      "http://endhealth.info/im#definitionalStatus": "definitional status",
      "http://endhealth.info/im#hasMap": "has map",
      "http://snomed.info/sct#77567004": "Acquired deformity of spine (disorder)",
      "http://endhealth.info/im#903351000252107": "is brother of",
      "http://endhealth.info/im#isMemberOf": "is member of",
      "http://endhealth.info/im#1251000252106": "Necessary and sufficient",
      "http://endhealth.info/tpp#_M6A_": "Curvature of spine-acq.",
      "http://snomed.info/sct#301991000119105": "Adolescent idiopathic scoliosis of cervical spine (disorder)",
      "http://endhealth.info/im#someOf": "some of",
      "http://endhealth.info/im#903551000252100": "has son",
      "http://snomed.info/sct#205442009": "Congenital [kyphosis] or [kyphoscoliosis] (disorder)",
      "http://endhealth.info/im#903801000252102": "is female partner in",
      "http://snomed.info/sct#410730009": "Disorder of spinal region (disorder)",
      "http://snomed.info/sct#363698007": "Finding site (attribute)",
      "http://snomed.info/sct#203647008": "Post-surgical scoliosis (disorder)",
      "http://endhealth.info/im#903681000252106": "is parent in law of",
      "http://endhealth.info/im#hasTermCode": "has term code",
      "http://snomed.info/sct#391051000000108": "[X]Other secondary scoliosis (disorder)",
      "http://endhealth.info/im#903421000252109": "has great uncle",
      "http://snomed.info/sct#414252009": "Finding of back (finding)",
      "http://snomed.info/sct#298379008": "Finding of spinal region (finding)",
      "http://snomed.info/sct#362965005": "Disorder of body system (disorder)",
      "http://snomed.info/sct#111267005": "Kyphoscoliosis deformity of spine (disorder)",
      "http://endhealth.info/im#903481000252108": "has husband",
      "http://endhealth.info/im#hasComponent": "has component",
      "http://endhealth.info/im#903831000252109": "is male partner in",
      "http://snomed.info/sct#298382003": "Scoliosis deformity of spine (disorder)",
      "http://endhealth.info/im#903451000252101": "is great aunt of",
      "http://endhealth.info/im#903321000252104": "has uncle in law",
      "http://www.w3.org/2000/01/rdf-schema#Resource": "Resource"
    }
  }
};
