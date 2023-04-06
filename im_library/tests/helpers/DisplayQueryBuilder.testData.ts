export const Q_RegisteredGMS = {
  definition: {
    "@id": "http://endhealth.info/im#Q_RegisteredGMS",
    name: "Patients registered for GMS services on the reference date",
    description: "For any registration period,a registration start date before the reference date and no end date,or an end date after the reference date.",
    match: [
      {
        "@type": "http://endhealth.info/im#Patient",
        name: "Patient"
      },
      {
        path: [
          {
            "@id": "gpRegistration"
          }
        ],
        bool: "and",
        where: [
          {
            "@id": "patientType",
            in: [
              {
                "@id": "http://endhealth.info/im#2751000252106",
                name: "Regular GMS patient"
              }
            ]
          },
          {
            "@id": "effectiveDate",
            operator: "<=",
            relativeTo: {
              parameter: "$referenceDate"
            }
          },
          {
            bool: "or",
            where: [
              {
                "@id": "endDate",
                null: true
              },
              {
                "@id": "endDate",
                operator: ">",
                relativeTo: {
                  parameter: "$referenceDate"
                }
              }
            ]
          }
        ]
      }
    ]
  },
  nodes: [
    { key: "10", label: "Patient", type: "match", data: { "@type": "http://endhealth.info/im#Patient", name: "Patient" }, children: [] },
    {
      key: "11",
      label: "gpRegistration.patientType: Regular GMS patient",
      type: "match",
      data: {
        path: [{ "@id": "gpRegistration" }],
        bool: "and",
        where: [
          { "@id": "patientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] },
          { "@id": "effectiveDate", operator: "<=", relativeTo: { parameter: "$referenceDate" } },
          {
            bool: "or",
            where: [
              { "@id": "endDate", null: true },
              { "@id": "endDate", operator: ">", relativeTo: { parameter: "$referenceDate" } }
            ]
          }
        ]
      },
      children: [
        {
          key: "110",
          label: "effectiveDate <= $referenceDate",
          type: "where",
          data: { "@id": "effectiveDate", operator: "<=", relativeTo: { parameter: "$referenceDate" } },
          children: []
        }
      ]
    }
  ]
};

export const SMIPopulation = {
  definition: {
    match: [
      {
        "@set": "http://endhealth.info/im#Q_RegisteredGMS",
        name: "Registered with GP for GMS services on the reference date"
      },
      {
        path: [
          {
            "@id": "gpCurrentRegistration"
          },
          {
            "@type": "GPRegistration"
          }
        ],
        bool: "and",
        where: [
          {
            "@id": "gpPatientType",
            in: [
              {
                "@id": "http://endhealth.info/im#2751000252106",
                name: "Regular GMS patient",
                descendantsOrSelfOf: true
              }
            ],
            valueLabel: "GMSpatient"
          },
          {
            "@id": "age",
            operator: ">=",
            value: "18",
            unit: "YEAR"
          }
        ]
      },
      {
        path: [
          {
            "@type": "observation"
          },
          {
            "@type": "Observation",
            variable: "with1"
          }
        ],
        where: [
          {
            "@id": "concept",
            in: [
              {
                "@set": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11",
                name: "SMIResolved"
              },
              {
                "@set": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
                name: "SMI"
              }
            ],
            valueLabel: "SMIResolved,SMI"
          }
        ],
        orderBy: [
          {
            "@id": "effectiveDate",
            direction: "ascending",
            node: "with1",
            limit: 1
          }
        ]
      },
      {
        bool: "and",
        where: [
          {
            "@id": "concept",
            in: [
              {
                "@set": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
                name: "SMI"
              }
            ],
            node: "with1",
            valueLabel: "SMI"
          }
        ]
      }
    ]
  },
  nodes: [
    {
      key: "10",
      label: "Registered with GP for GMS services on the reference date",
      type: "match",
      data: { "@set": "http://endhealth.info/im#Q_RegisteredGMS", name: "Registered with GP for GMS services on the reference date" },
      children: []
    },
    {
      key: "11",
      label: "gpCurrentRegistration.GPRegistration.gpPatientType: Regular GMS patient",
      type: "match",
      data: {
        path: [{ "@id": "gpCurrentRegistration" }, { "@type": "GPRegistration" }],
        bool: "and",
        where: [
          {
            "@id": "gpPatientType",
            in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient", descendantsOrSelfOf: true }],
            valueLabel: "GMSpatient"
          },
          { "@id": "age", operator: ">=", value: "18", unit: "YEAR" }
        ]
      },
      children: [{ key: "110", label: "age >= 18 (YEAR)", type: "where", data: { "@id": "age", operator: ">=", value: "18", unit: "YEAR" }, children: [] }]
    },
    {
      key: "12",
      label: "observation.Observation(as with1).concept",
      type: "match",
      data: {
        path: [{ "@type": "observation" }, { "@type": "Observation", variable: "with1" }],
        where: [
          {
            "@id": "concept",
            in: [
              { "@set": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "SMIResolved" },
              { "@set": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }
            ],
            valueLabel: "SMIResolved,SMI"
          }
        ],
        orderBy: [{ "@id": "effectiveDate", direction: "ascending", node: "with1", limit: 1 }]
      },
      children: [
        { key: "120", label: "SMIResolved", type: "in", data: { "@set": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "SMIResolved" }, children: [] },
        { key: "121", label: "SMI", type: "in", data: { "@set": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }, children: [] },
        {
          key: "122",
          label: "order by: with1",
          type: "orderBy",
          data: { "@id": "effectiveDate", direction: "ascending", node: "with1", limit: 1 },
          children: []
        }
      ]
    },
    {
      key: "13",
      label: "with1.concept: SMI",
      type: "match",
      data: {
        bool: "and",
        where: [{ "@id": "concept", in: [{ "@set": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }], node: "with1", valueLabel: "SMI" }]
      },
      children: []
    }
  ]
};

export const Priority3b = {
  definition: {
    match: [
      {
        "@set": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf",
        name: "SMI Population"
      },
      {
        "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97",
        name: "Priority 1"
      },
      {
        "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd",
        name: "Priority 2"
      },
      {
        "@set": "urn:uuid:6d4abdbb-d278-4675-a98d-c340967daee6",
        name: "Priority 3a"
      }
    ]
  },
  nodes: [
    {
      key: "10",
      label: "SMI Population",
      type: "match",
      data: { "@set": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf", name: "SMI Population" },
      children: []
    },
    { key: "11", label: "Priority 1", type: "match", data: { "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97", name: "Priority 1" }, children: [] },
    { key: "12", label: "Priority 2", type: "match", data: { "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd", name: "Priority 2" }, children: [] },
    { key: "13", label: "Priority 3a", type: "match", data: { "@set": "urn:uuid:6d4abdbb-d278-4675-a98d-c340967daee6", name: "Priority 3a" }, children: [] }
  ]
};

export const Priority3a = {
  definition: {
    match: [
      {
        "@set": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf",
        name: "SMI Population"
      },
      {
        "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97",
        name: "Priority 1"
      },
      {
        "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd",
        name: "Priority 2"
      },
      {
        boolMatch: "or",
        match: [
          {
            path: [
              {
                "@type": "observation"
              },
              {
                "@type": "Observation",
                variable: "with37"
              }
            ],
            where: [
              {
                "@id": "concept",
                in: [
                  {
                    "@set": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                    name: "Hypertension"
                  },
                  {
                    "@set": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d",
                    name: "Unknown value set"
                  }
                ],
                valueLabel: "Hypertension"
              }
            ],
            orderBy: [
              {
                "@id": "effectiveDate",
                direction: "ascending",
                node: "with37",
                limit: 1
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                "@id": "concept",
                in: [
                  {
                    "@set": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                    name: "Hypertension"
                  }
                ],
                node: "with37",
                valueLabel: "Hypertension"
              }
            ]
          },
          {
            path: [
              {
                "@type": "observation"
              },
              {
                "@type": "Observation",
                variable: "with39"
              }
            ],
            where: [
              {
                "@id": "concept",
                in: [
                  {
                    "@set": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95",
                    name: "Diabetes"
                  },
                  {
                    "@set": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d",
                    name: "Diabetes (resovled)"
                  }
                ],
                valueLabel: "Diabetes,Diabetes (resovled)"
              }
            ],
            orderBy: [
              {
                "@id": "effectiveDate",
                direction: "ascending",
                node: "with39",
                limit: 1
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                "@id": "concept",
                in: [
                  {
                    "@set": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95",
                    name: "Diabetes"
                  }
                ],
                node: "with39",
                valueLabel: "Diabetes"
              }
            ]
          },
          {
            path: [
              {
                "@type": "observation"
              },
              {
                "@type": "Observation"
              }
            ],
            where: [
              {
                "@id": "concept",
                in: [
                  {
                    "@set": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452",
                    name: "Unknown value set"
                  },
                  {
                    "@set": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d",
                    name: "Unknown value set"
                  },
                  {
                    "@set": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4",
                    name: "Unknown value set"
                  },
                  {
                    "@set": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0",
                    name: "Unknown value set"
                  }
                ],
                valueLabel: "Unknown value set"
              }
            ]
          },
          {
            path: [
              {
                "@type": "observation"
              },
              {
                "@type": "Observation"
              }
            ],
            where: [
              {
                "@id": "concept",
                in: [
                  {
                    "@set": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5",
                    name: "Unknown value set"
                  },
                  {
                    "@set": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f",
                    name: "Unknown value set"
                  }
                ],
                valueLabel: "Unknown value set"
              }
            ]
          },
          {
            path: [
              {
                "@type": "observation"
              },
              {
                "@type": "Observation",
                variable: "with41"
              }
            ],
            where: [
              {
                "@id": "concept",
                in: [
                  {
                    "@id": "http://snomed.info/sct#60621009",
                    name: "Body mass index (observable entity)",
                    descendantsOrSelfOf: true
                  },
                  {
                    "@id": "http://snomed.info/sct#60621009",
                    name: "Body mass index (observable entity)",
                    descendantsOrSelfOf: true
                  },
                  {
                    "@id": "http://snomed.info/sct#60621009",
                    name: "Body mass index (observable entity)",
                    descendantsOrSelfOf: true
                  },
                  {
                    "@id": "http://snomed.info/sct#60621009",
                    name: "Body mass index (observable entity)",
                    descendantsOrSelfOf: true
                  },
                  {
                    "@id": "http://snomed.info/sct#60621009",
                    name: "Body mass index (observable entity)",
                    descendantsOrSelfOf: true
                  }
                ]
              }
            ],
            orderBy: [
              {
                "@id": "effectiveDate",
                direction: "ascending",
                node: "with41",
                limit: 1
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                "@id": "numericValue",
                operator: ">=",
                value: "35",
                node: "with41"
              }
            ]
          }
        ]
      }
    ]
  },
  nodes: [
    {
      key: "10",
      label: "SMI Population",
      type: "match",
      data: { "@set": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf", name: "SMI Population" },
      children: []
    },
    { key: "11", label: "Priority 1", type: "match", data: { "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97", name: "Priority 1" }, children: [] },
    { key: "12", label: "Priority 2", type: "match", data: { "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd", name: "Priority 2" }, children: [] },
    {
      key: "13",
      label: "any of",
      type: "match",
      data: {
        boolMatch: "or",
        match: [
          {
            path: [{ "@type": "observation" }, { "@type": "Observation", variable: "with37" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@set": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                  { "@set": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown value set" }
                ],
                valueLabel: "Hypertension"
              }
            ],
            orderBy: [{ "@id": "effectiveDate", direction: "ascending", node: "with37", limit: 1 }]
          },
          {
            bool: "and",
            where: [
              {
                "@id": "concept",
                in: [{ "@set": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }],
                node: "with37",
                valueLabel: "Hypertension"
              }
            ]
          },
          {
            path: [{ "@type": "observation" }, { "@type": "Observation", variable: "with39" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@set": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                  { "@set": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                ],
                valueLabel: "Diabetes,Diabetes (resovled)"
              }
            ],
            orderBy: [{ "@id": "effectiveDate", direction: "ascending", node: "with39", limit: 1 }]
          },
          {
            bool: "and",
            where: [
              { "@id": "concept", in: [{ "@set": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }], node: "with39", valueLabel: "Diabetes" }
            ]
          },
          {
            path: [{ "@type": "observation" }, { "@type": "Observation" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@set": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown value set" },
                  { "@set": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown value set" },
                  { "@set": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown value set" },
                  { "@set": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown value set" }
                ],
                valueLabel: "Unknown value set"
              }
            ]
          },
          {
            path: [{ "@type": "observation" }, { "@type": "Observation" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@set": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5", name: "Unknown value set" },
                  { "@set": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f", name: "Unknown value set" }
                ],
                valueLabel: "Unknown value set"
              }
            ]
          },
          {
            path: [{ "@type": "observation" }, { "@type": "Observation", variable: "with41" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true }
                ]
              }
            ],
            orderBy: [{ "@id": "effectiveDate", direction: "ascending", node: "with41", limit: 1 }]
          },
          { bool: "and", where: [{ "@id": "numericValue", operator: ">=", value: "35", node: "with41" }] }
        ]
      },
      children: [
        {
          key: "130",
          label: "observation.Observation(as with37).concept",
          type: "match",
          data: {
            path: [{ "@type": "observation" }, { "@type": "Observation", variable: "with37" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@set": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                  { "@set": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown value set" }
                ],
                valueLabel: "Hypertension"
              }
            ],
            orderBy: [{ "@id": "effectiveDate", direction: "ascending", node: "with37", limit: 1 }]
          },
          children: [
            {
              key: "1300",
              label: "Hypertension",
              type: "in",
              data: { "@set": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
              children: []
            },
            {
              key: "1301",
              label: "Unknown value set",
              type: "in",
              data: { "@set": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown value set" },
              children: []
            },
            {
              key: "1302",
              label: "order by: with37",
              type: "orderBy",
              data: { "@id": "effectiveDate", direction: "ascending", node: "with37", limit: 1 },
              children: []
            }
          ]
        },
        {
          key: "131",
          label: "with37.concept: Hypertension",
          type: "match",
          data: {
            bool: "and",
            where: [
              {
                "@id": "concept",
                in: [{ "@set": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }],
                node: "with37",
                valueLabel: "Hypertension"
              }
            ]
          },
          children: []
        },
        {
          key: "132",
          label: "observation.Observation(as with39).concept",
          type: "match",
          data: {
            path: [{ "@type": "observation" }, { "@type": "Observation", variable: "with39" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@set": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                  { "@set": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                ],
                valueLabel: "Diabetes,Diabetes (resovled)"
              }
            ],
            orderBy: [{ "@id": "effectiveDate", direction: "ascending", node: "with39", limit: 1 }]
          },
          children: [
            { key: "1320", label: "Diabetes", type: "in", data: { "@set": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }, children: [] },
            {
              key: "1321",
              label: "Diabetes (resovled)",
              type: "in",
              data: { "@set": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" },
              children: []
            },
            {
              key: "1322",
              label: "order by: with39",
              type: "orderBy",
              data: { "@id": "effectiveDate", direction: "ascending", node: "with39", limit: 1 },
              children: []
            }
          ]
        },
        {
          key: "133",
          label: "with39.concept: Diabetes",
          type: "match",
          data: {
            bool: "and",
            where: [
              { "@id": "concept", in: [{ "@set": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }], node: "with39", valueLabel: "Diabetes" }
            ]
          },
          children: []
        },
        {
          key: "134",
          label: "observation.Observation.concept",
          type: "match",
          data: {
            path: [{ "@type": "observation" }, { "@type": "Observation" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@set": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown value set" },
                  { "@set": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown value set" },
                  { "@set": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown value set" },
                  { "@set": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown value set" }
                ],
                valueLabel: "Unknown value set"
              }
            ]
          },
          children: [
            {
              key: "1340",
              label: "Unknown value set",
              type: "in",
              data: { "@set": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown value set" },
              children: []
            },
            {
              key: "1341",
              label: "Unknown value set",
              type: "in",
              data: { "@set": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown value set" },
              children: []
            },
            {
              key: "1342",
              label: "Unknown value set",
              type: "in",
              data: { "@set": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown value set" },
              children: []
            },
            {
              key: "1343",
              label: "Unknown value set",
              type: "in",
              data: { "@set": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown value set" },
              children: []
            }
          ]
        },
        {
          key: "135",
          label: "observation.Observation.concept",
          type: "match",
          data: {
            path: [{ "@type": "observation" }, { "@type": "Observation" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@set": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5", name: "Unknown value set" },
                  { "@set": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f", name: "Unknown value set" }
                ],
                valueLabel: "Unknown value set"
              }
            ]
          },
          children: [
            {
              key: "1350",
              label: "Unknown value set",
              type: "in",
              data: { "@set": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5", name: "Unknown value set" },
              children: []
            },
            {
              key: "1351",
              label: "Unknown value set",
              type: "in",
              data: { "@set": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f", name: "Unknown value set" },
              children: []
            }
          ]
        },
        {
          key: "136",
          label: "observation.Observation(as with41).concept",
          type: "match",
          data: {
            path: [{ "@type": "observation" }, { "@type": "Observation", variable: "with41" }],
            where: [
              {
                "@id": "concept",
                in: [
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
                  { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true }
                ]
              }
            ],
            orderBy: [{ "@id": "effectiveDate", direction: "ascending", node: "with41", limit: 1 }]
          },
          children: [
            {
              key: "1360",
              label: "Body mass index (observable entity)",
              type: "in",
              data: { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
              children: []
            },
            {
              key: "1361",
              label: "Body mass index (observable entity)",
              type: "in",
              data: { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
              children: []
            },
            {
              key: "1362",
              label: "Body mass index (observable entity)",
              type: "in",
              data: { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
              children: []
            },
            {
              key: "1363",
              label: "Body mass index (observable entity)",
              type: "in",
              data: { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
              children: []
            },
            {
              key: "1364",
              label: "Body mass index (observable entity)",
              type: "in",
              data: { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)", descendantsOrSelfOf: true },
              children: []
            },
            {
              key: "1365",
              label: "order by: with41",
              type: "orderBy",
              data: { "@id": "effectiveDate", direction: "ascending", node: "with41", limit: 1 },
              children: []
            }
          ]
        },
        {
          key: "137",
          label: "with41",
          type: "match",
          data: { bool: "and", where: [{ "@id": "numericValue", operator: ">=", value: "35", node: "with41" }] },
          children: [
            {
              key: "1370",
              label: "numericValue >= 35",
              type: "where",
              data: { "@id": "numericValue", operator: ">=", value: "35", node: "with41" },
              children: []
            }
          ]
        }
      ]
    }
  ]
};

export const Aged1664 = {
  definition: {
    match: [
      {
        "@set": "urn:uuid:a39c5aba-eed4-477b-bce2-3eeeb720a3ad",
        name: "Currently Registered Patients Aged 16+"
      },
      {
        where: [
          {
            "@id": "age",
            range: {
              to: {
                operator: ">",
                value: "65",
                unit: "YEAR",
                relativeTo: null
              },
              from: {
                operator: ">=",
                value: "16",
                unit: "YEAR",
                relativeTo: null
              }
            }
          }
        ]
      }
    ]
  },
  nodes: [
    {
      key: "10",
      label: "Currently Registered Patients Aged 16+",
      type: "match",
      data: { "@set": "urn:uuid:a39c5aba-eed4-477b-bce2-3eeeb720a3ad", name: "Currently Registered Patients Aged 16+" },
      children: []
    },
    {
      key: "11",
      label: "",
      type: "match",
      data: {
        where: [
          {
            "@id": "age",
            range: { to: { operator: ">", value: "65", unit: "YEAR", relativeTo: null }, from: { operator: ">=", value: "16", unit: "YEAR", relativeTo: null } }
          }
        ]
      },
      children: [
        {
          key: "110",
          label: "age  from >= 16 (YEAR) to >= 16 (YEAR)",
          type: "where",
          data: {
            "@id": "age",
            range: { to: { operator: ">", value: "65", unit: "YEAR", relativeTo: null }, from: { operator: ">=", value: "16", unit: "YEAR", relativeTo: null } }
          },
          children: []
        }
      ]
    }
  ]
};

export const Query_AllowableProperties = {
  definition: {
    name: "Allowable Properties for a concept",
    description: "'using property domains get the allowable properties from the supertypes of this concept",
    match: [
      {
        "@type": "http://endhealth.info/im#Concept",
        where: [
          {
            "@id": "http://www.w3.org/2000/01/rdf-schema#domain",
            in: [
              {
                parameter: "this",
                ancestorsOf: true
              }
            ]
          }
        ]
      }
    ],
    select: [
      {
        "@id": "http://endhealth.info/im#code"
      },
      {
        "@id": "http://www.w3.org/2000/01/rdf-schema#label"
      }
    ],
    activeOnly: true
  },
  nodes: [
    {
      key: "10",
      label: "Concept.domain: this",
      type: "match",
      data: {
        "@type": "http://endhealth.info/im#Concept",
        where: [{ "@id": "http://www.w3.org/2000/01/rdf-schema#domain", in: [{ parameter: "this", ancestorsOf: true }] }]
      },
      children: []
    },
    {
      key: "11",
      label: "select",
      type: "select",
      data: [{ "@id": "http://endhealth.info/im#code" }, { "@id": "http://www.w3.org/2000/01/rdf-schema#label" }],
      children: [
        { key: "110", label: "code", type: "select", data: { "@id": "http://endhealth.info/im#code" }, children: [] },
        { key: "111", label: "label", type: "select", data: { "@id": "http://www.w3.org/2000/01/rdf-schema#label" }, children: [] }
      ]
    }
  ]
};
