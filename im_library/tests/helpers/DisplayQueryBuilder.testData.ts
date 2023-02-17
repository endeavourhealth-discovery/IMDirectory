export const Q_RegisteredGMS = {
  definition: {
    "@id": "http://endhealth.info/im#Q_RegisteredGMS",
    name: "Patients registered for GMS services on the reference date",
    description: "For any registration period,a registration start date before the reference date and no end date,or an end date after the reference date.",
    from: {
      type: {
        "@id": "http://endhealth.info/im#Patient",
        name: "Patient"
      },
      where: {
        id: "gpRegistration",
        where: [
          {
            id: "patientType",
            in: [
              {
                "@id": "http://endhealth.info/im#2751000252106",
                name: "Regular GMS patient"
              }
            ]
          },
          {
            id: "effectiveDate",
            operator: "<=",
            relativeTo: "$referenceDate"
          },
          {
            bool: "or",
            where: [
              {
                notExist: true,
                id: "endDate"
              },
              {
                id: "endDate",
                operator: ">",
                relativeTo: "$referenceDate"
              }
            ]
          }
        ]
      }
    }
  },
  nodes: [
    {
      key: "10",
      label: "Patients registered for GMS services on the reference date",
      type: "query",
      data: {
        "@id": "http://endhealth.info/im#Q_RegisteredGMS",
        name: "Patients registered for GMS services on the reference date",
        description: "For any registration period,a registration start date before the reference date and no end date,or an end date after the reference date.",
        from: {
          type: { "@id": "http://endhealth.info/im#Patient", name: "Patient" },
          where: {
            id: "gpRegistration",
            where: [
              { id: "patientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] },
              { id: "effectiveDate", operator: "<=", relativeTo: "$referenceDate" },
              {
                bool: "or",
                where: [
                  { notExist: true, id: "endDate" },
                  { id: "endDate", operator: ">", relativeTo: "$referenceDate" }
                ]
              }
            ]
          }
        }
      },
      children: [
        { key: "100", label: "Patient", type: "from", data: { "@id": "http://endhealth.info/im#Patient", name: "Patient" }, children: [] },
        {
          key: "101",
          label: "gpRegistration",
          type: "from",
          data: {
            id: "gpRegistration",
            where: [
              { id: "patientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] },
              { id: "effectiveDate", operator: "<=", relativeTo: "$referenceDate" },
              {
                bool: "or",
                where: [
                  { notExist: true, id: "endDate" },
                  { id: "endDate", operator: ">", relativeTo: "$referenceDate" }
                ]
              }
            ]
          },
          children: [
            {
              key: "1010",
              label: "patientType: Regular GMS patient",
              type: "where",
              data: { id: "patientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] },
              children: []
            },
            {
              key: "1011",
              label: "effectiveDate <= $referenceDate",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "1012",
              label: "any of",
              type: "where",
              data: {
                bool: "or",
                where: [
                  { notExist: true, id: "endDate" },
                  { id: "endDate", operator: ">", relativeTo: "$referenceDate" }
                ]
              },
              children: [
                { key: "10120", label: "endDate does not exist", type: "where", data: { notExist: true, id: "endDate" }, children: [] },
                {
                  key: "10121",
                  label: "endDate > $referenceDate",
                  type: "where",
                  data: { id: "endDate", operator: ">", relativeTo: "$referenceDate" },
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const SMIPopulation = {
  definition: {
    from: {
      "@id": "http://endhealth.info/im#Q_RegisteredGMS",
      name: "Registered with GP for GMS services on the reference date",
      sourceType: "set",
      description: "Registered with GP for GMS services on the reference date",
      where: {
        bool: "and",
        where: [
          {
            description: "gpCurrentRegistration",
            id: "gpCurrentRegistration",
            where: [
              {
                description: "GMSpatient",
                id: "gpPatientType",
                in: [
                  {
                    "@id": "http://endhealth.info/im#2751000252106",
                    name: "Regular GMS patient"
                  }
                ]
              }
            ]
          },
          {
            description: "age >= 18 (YEAR)",
            id: "age",
            operator: ">=",
            value: "18",
            unit: "YEAR"
          },
          {
            description: "observation",
            id: "observation",
            with: {
              description: "Latest null",
              id: "concept",
              in: [
                {
                  "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11",
                  name: "SMIResolved"
                },
                {
                  "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
                  name: "SMI"
                }
              ],
              latest: "effectiveDate",
              count: 1
            },
            where: [
              {
                description: "concept is : SMI",
                id: "concept",
                in: [
                  {
                    "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
                    name: "SMI"
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  nodes: [
    {
      key: "10",
      label: "Registered with GP for GMS services on the reference date",
      type: "query",
      data: {
        "@id": "http://endhealth.info/im#Q_RegisteredGMS",
        name: "Registered with GP for GMS services on the reference date",
        sourceType: "set",
        description: "Registered with GP for GMS services on the reference date",
        where: {
          bool: "and",
          where: [
            {
              description: "gpCurrentRegistration",
              id: "gpCurrentRegistration",
              where: [
                { description: "GMSpatient", id: "gpPatientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] }
              ]
            },
            { description: "age >= 18 (YEAR)", id: "age", operator: ">=", value: "18", unit: "YEAR" },
            {
              description: "observation",
              id: "observation",
              with: {
                description: "Latest null",
                id: "concept",
                in: [
                  { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "SMIResolved" },
                  { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }
                ],
                latest: "effectiveDate",
                count: 1
              },
              where: [{ description: "concept is : SMI", id: "concept", in: [{ "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }] }]
            }
          ]
        }
      },
      children: [
        {
          key: "100",
          label: "gpCurrentRegistration",
          type: "where",
          data: {
            description: "gpCurrentRegistration",
            id: "gpCurrentRegistration",
            where: [{ description: "GMSpatient", id: "gpPatientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] }]
          },
          children: [
            {
              key: "1000",
              label: "gpPatientType: Regular GMS patient",
              type: "where",
              data: { description: "GMSpatient", id: "gpPatientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] },
              children: []
            }
          ]
        },
        {
          key: "101",
          label: "age >= 18 (YEAR)",
          type: "where",
          data: { description: "age >= 18 (YEAR)", id: "age", operator: ">=", value: "18", unit: "YEAR" },
          children: []
        },
        {
          key: "102",
          label: "observation",
          type: "where",
          data: {
            description: "observation",
            id: "observation",
            with: {
              description: "Latest null",
              id: "concept",
              in: [
                { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "SMIResolved" },
                { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }
              ],
              latest: "effectiveDate",
              count: 1
            },
            where: [{ description: "concept is : SMI", id: "concept", in: [{ "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }] }]
          },
          children: [
            {
              key: "1020",
              label: "Latest concept from",
              type: "with",
              data: {
                description: "Latest null",
                id: "concept",
                in: [
                  { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "SMIResolved" },
                  { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }
                ],
                latest: "effectiveDate",
                count: 1
              },
              children: [
                {
                  key: "10200",
                  label: "SMIResolved",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "SMIResolved" },
                      { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: []
                },
                {
                  key: "10201",
                  label: "SMI",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "SMIResolved" },
                      { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: []
                }
              ]
            },
            {
              key: "1021",
              label: "concept: SMI",
              type: "where",
              data: { description: "concept is : SMI", id: "concept", in: [{ "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" }] },
              children: []
            }
          ]
        }
      ]
    }
  ]
};

export const Priority3b = {
  definition: {
    from: {
      "@id": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf",
      name: "SMI Population",
      sourceType: "set",
      description: "SMI Population",
      where: {
        bool: "and",
        where: [
          {
            description: " is : Priority 1not = ",
            bool: "not",
            in: [
              {
                "@id": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97",
                name: "Priority 1",
                sourceType: "set"
              }
            ]
          },
          {
            description: " is : Priority 2not = ",
            bool: "not",
            in: [
              {
                "@id": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd",
                name: "Priority 2",
                sourceType: "set"
              }
            ]
          },
          {
            description: " is : Priority 3anot = ",
            bool: "not",
            in: [
              {
                "@id": "urn:uuid:6d4abdbb-d278-4675-a98d-c340967daee6",
                name: "Priority 3a",
                sourceType: "set"
              }
            ]
          }
        ]
      }
    }
  },
  nodes: [
    {
      key: "10",
      label: "SMI Population",
      type: "query",
      data: {
        "@id": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf",
        name: "SMI Population",
        sourceType: "set",
        description: "SMI Population",
        where: {
          bool: "and",
          where: [
            {
              description: " is : Priority 1not = ",
              bool: "not",
              in: [{ "@id": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97", name: "Priority 1", sourceType: "set" }]
            },
            {
              description: " is : Priority 2not = ",
              bool: "not",
              in: [{ "@id": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd", name: "Priority 2", sourceType: "set" }]
            },
            {
              description: " is : Priority 3anot = ",
              bool: "not",
              in: [{ "@id": "urn:uuid:6d4abdbb-d278-4675-a98d-c340967daee6", name: "Priority 3a", sourceType: "set" }]
            }
          ]
        }
      },
      children: [
        {
          key: "100",
          label: "Not from Priority 1",
          type: "where",
          data: {
            description: " is : Priority 1not = ",
            bool: "not",
            in: [{ "@id": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97", name: "Priority 1", sourceType: "set" }]
          },
          children: []
        },
        {
          key: "101",
          label: "Not from Priority 2",
          type: "where",
          data: {
            description: " is : Priority 2not = ",
            bool: "not",
            in: [{ "@id": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd", name: "Priority 2", sourceType: "set" }]
          },
          children: []
        },
        {
          key: "102",
          label: "Not from Priority 3a",
          type: "where",
          data: {
            description: " is : Priority 3anot = ",
            bool: "not",
            in: [{ "@id": "urn:uuid:6d4abdbb-d278-4675-a98d-c340967daee6", name: "Priority 3a", sourceType: "set" }]
          },
          children: []
        }
      ]
    }
  ]
};

export const Priority3a = {
  definition: {
    from: {
      "@id": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf",
      name: "SMI Population",
      sourceType: "set",
      description: "SMI Population",
      where: {
        bool: "and",
        where: [
          {
            description: " is : Priority 1not = ",
            bool: "not",
            in: [
              {
                "@id": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97",
                name: "Priority 1",
                sourceType: "set"
              }
            ]
          },
          {
            description: " is : Priority 2not = ",
            bool: "not",
            in: [
              {
                "@id": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd",
                name: "Priority 2",
                sourceType: "set"
              }
            ]
          },
          {
            where: [
              {
                bool: "or",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest null",
                      id: "concept",
                      in: [
                        {
                          "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                          name: "Hypertension"
                        },
                        {
                          "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d",
                          name: "Unknown code set"
                        }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Hypertension",
                        id: "concept",
                        in: [
                          {
                            "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                            name: "Hypertension"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest null",
                      id: "concept",
                      in: [
                        {
                          "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95",
                          name: "Diabetes"
                        },
                        {
                          "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d",
                          name: "Diabetes (resovled)"
                        }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Diabetes",
                        id: "concept",
                        in: [
                          {
                            "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95",
                            name: "Diabetes"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    where: [
                      {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          {
                            "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452",
                            name: "Unknown code set"
                          },
                          {
                            "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d",
                            name: "Unknown code set"
                          },
                          {
                            "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4",
                            name: "Unknown code set"
                          },
                          {
                            "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0",
                            name: "Unknown code set"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    where: [
                      {
                        description: "concept is : Unknown code set, ",
                        id: "concept",
                        in: [
                          {
                            "@id": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5",
                            name: "Unknown code set"
                          },
                          {
                            "@id": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f",
                            name: "Unknown code set"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest Body mass index ....",
                      id: "concept",
                      in: [
                        {
                          "@id": "http://snomed.info/sct#60621009",
                          name: "Body mass index (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#60621009",
                          name: "Body mass index (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#60621009",
                          name: "Body mass index (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#60621009",
                          name: "Body mass index (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#60621009",
                          name: "Body mass index (observable entity)"
                        }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "numericValue >= 35",
                        id: "numericValue",
                        operator: ">=",
                        value: "35"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  nodes: [
    {
      key: "10",
      label: "SMI Population",
      type: "query",
      data: {
        "@id": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf",
        name: "SMI Population",
        sourceType: "set",
        description: "SMI Population",
        where: {
          bool: "and",
          where: [
            {
              description: " is : Priority 1not = ",
              bool: "not",
              in: [{ "@id": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97", name: "Priority 1", sourceType: "set" }]
            },
            {
              description: " is : Priority 2not = ",
              bool: "not",
              in: [{ "@id": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd", name: "Priority 2", sourceType: "set" }]
            },
            {
              where: [
                {
                  bool: "or",
                  where: [
                    {
                      description: "observation",
                      id: "observation",
                      with: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      where: [
                        {
                          description: "concept is : Hypertension",
                          id: "concept",
                          in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                        }
                      ]
                    },
                    {
                      description: "observation",
                      id: "observation",
                      with: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                          { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      where: [
                        {
                          description: "concept is : Diabetes",
                          id: "concept",
                          in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }]
                        }
                      ]
                    },
                    {
                      description: "observation",
                      id: "observation",
                      where: [
                        {
                          description: "concept is : Unknown code set, , , .. ",
                          id: "concept",
                          in: [
                            { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                            { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                            { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                            { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                          ]
                        }
                      ]
                    },
                    {
                      description: "observation",
                      id: "observation",
                      where: [
                        {
                          description: "concept is : Unknown code set, ",
                          id: "concept",
                          in: [
                            { "@id": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5", name: "Unknown code set" },
                            { "@id": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f", name: "Unknown code set" }
                          ]
                        }
                      ]
                    },
                    {
                      description: "observation",
                      id: "observation",
                      with: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      where: [{ description: "numericValue >= 35", id: "numericValue", operator: ">=", value: "35" }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      children: [
        {
          key: "100",
          label: "Not from Priority 1",
          type: "where",
          data: {
            description: " is : Priority 1not = ",
            bool: "not",
            in: [{ "@id": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97", name: "Priority 1", sourceType: "set" }]
          },
          children: []
        },
        {
          key: "101",
          label: "Not from Priority 2",
          type: "where",
          data: {
            description: " is : Priority 2not = ",
            bool: "not",
            in: [{ "@id": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd", name: "Priority 2", sourceType: "set" }]
          },
          children: []
        },
        {
          key: "102",
          label: "any of",
          type: "where",
          data: {
            bool: "or",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                    { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  }
                ]
              },
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                    { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  { description: "concept is : Diabetes", id: "concept", in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }] }
                ]
              },
              {
                description: "observation",
                id: "observation",
                where: [
                  {
                    description: "concept is : Unknown code set, , , .. ",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                      { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                      { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                      { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                    ]
                  }
                ]
              },
              {
                description: "observation",
                id: "observation",
                where: [
                  {
                    description: "concept is : Unknown code set, ",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5", name: "Unknown code set" },
                      { "@id": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f", name: "Unknown code set" }
                    ]
                  }
                ]
              },
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Body mass index ....",
                  id: "concept",
                  in: [
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [{ description: "numericValue >= 35", id: "numericValue", operator: ">=", value: "35" }]
              }
            ]
          },
          children: [
            {
              key: "1020",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                    { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  }
                ]
              },
              children: [
                {
                  key: "10200",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "102000",
                      label: "Hypertension",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "102001",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "10201",
                  label: "concept: Hypertension",
                  type: "where",
                  data: {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  },
                  children: []
                }
              ]
            },
            {
              key: "1021",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                    { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  { description: "concept is : Diabetes", id: "concept", in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }] }
                ]
              },
              children: [
                {
                  key: "10210",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                      { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "102100",
                      label: "Diabetes",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                          { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "102101",
                      label: "Diabetes (resovled)",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                          { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "10211",
                  label: "concept: Diabetes",
                  type: "where",
                  data: {
                    description: "concept is : Diabetes",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }]
                  },
                  children: []
                }
              ]
            },
            {
              key: "1022",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                where: [
                  {
                    description: "concept is : Unknown code set, , , .. ",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                      { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                      { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                      { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                    ]
                  }
                ]
              },
              children: [
                {
                  key: "10220",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "concept is : Unknown code set, , , .. ",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                      { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                      { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                      { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                    ]
                  },
                  children: [
                    {
                      key: "102200",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                          { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                          { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                          { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "102201",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                          { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                          { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                          { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "102202",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                          { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                          { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                          { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "102203",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                          { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                          { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                          { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              key: "1023",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                where: [
                  {
                    description: "concept is : Unknown code set, ",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5", name: "Unknown code set" },
                      { "@id": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f", name: "Unknown code set" }
                    ]
                  }
                ]
              },
              children: [
                {
                  key: "10230",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "concept is : Unknown code set, ",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5", name: "Unknown code set" },
                      { "@id": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f", name: "Unknown code set" }
                    ]
                  },
                  children: [
                    {
                      key: "102300",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5", name: "Unknown code set" },
                          { "@id": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "102301",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:15bd20c8-c92f-496c-8560-896299a632e5", name: "Unknown code set" },
                          { "@id": "urn:uuid:c97f55a2-fe6e-4da2-8865-a95b7cc80f4f", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              key: "1024",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Body mass index ....",
                  id: "concept",
                  in: [
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [{ description: "numericValue >= 35", id: "numericValue", operator: ">=", value: "35" }]
              },
              children: [
                {
                  key: "10240",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest Body mass index ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "102400",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "102401",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "102402",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "102403",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "102404",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "10241",
                  label: "numericValue >= 35",
                  type: "where",
                  data: { description: "numericValue >= 35", id: "numericValue", operator: ">=", value: "35" },
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const Priority1 = {
  definition: {
    from: {
      "@id": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf",
      name: "SMI Population",
      sourceType: "set",
      description: "SMI Population",
      where: {
        bool: "or",
        where: [
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    {
                      "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                      name: "Hypertension"
                    },
                    {
                      "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d",
                      name: "Unknown code set"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [
                      {
                        "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                        name: "Hypertension"
                      }
                    ]
                  }
                ]
              },
              {
                description: "observation",
                id: "observation",
                bool: "and",
                with: {
                  description: "Latest null",
                  bool: "and",
                  where: [
                    {
                      description: "SystolicBP",
                      id: "concept",
                      in: [
                        {
                          "@id": "http://snomed.info/sct#271649006",
                          name: "Systolic blood pressure (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#271649006",
                          name: "Systolic blood pressure (observable entity)"
                        }
                      ]
                    },
                    {
                      id: "effectiveDate",
                      operator: "<=",
                      value: "18",
                      unit: "MONTH",
                      relativeTo: "$referenceDate"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "OfficeBasedSystolic",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#271649006",
                        name: "Systolic blood pressure (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#271649006",
                        name: "Systolic blood pressure (observable entity)"
                      }
                    ]
                  },
                  {
                    description: "numericValue >= 140",
                    id: "numericValue",
                    operator: ">=",
                    value: "140"
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    {
                      "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                      name: "Hypertension"
                    },
                    {
                      "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d",
                      name: "Unknown code set"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [
                      {
                        "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                        name: "Hypertension"
                      }
                    ]
                  }
                ]
              },
              {
                description: "observation",
                id: "observation",
                bool: "and",
                with: {
                  description: "Latest null",
                  bool: "and",
                  where: [
                    {
                      description: "BloodPressure",
                      id: "concept",
                      in: [
                        {
                          "@id": "http://snomed.info/sct#271650006",
                          name: "Diastolic blood pressure (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#271650006",
                          name: "Diastolic blood pressure (observable entity)"
                        }
                      ]
                    },
                    {
                      id: "effectiveDate",
                      operator: "<=",
                      value: "18",
                      unit: "MONTH",
                      relativeTo: "$referenceDate"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "OfficeBasedDiastolic",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#271650006",
                        name: "Diastolic blood pressure (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#271650006",
                        name: "Diastolic blood pressure (observable entity)"
                      }
                    ]
                  },
                  {
                    description: "numericValue >= 90",
                    id: "numericValue",
                    operator: ">=",
                    value: "90"
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    {
                      "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                      name: "Hypertension"
                    },
                    {
                      "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d",
                      name: "Unknown code set"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [
                      {
                        "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                        name: "Hypertension"
                      }
                    ]
                  }
                ]
              },
              {
                description: "observation",
                id: "observation",
                bool: "and",
                with: {
                  description: "Latest null",
                  bool: "and",
                  where: [
                    {
                      description: "SAP - Systolic arterial pressure ....",
                      id: "concept",
                      in: [
                        {
                          "@id": "http://snomed.info/sct#271649006",
                          name: "Systolic blood pressure (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#271649006",
                          name: "Systolic blood pressure (observable entity)"
                        }
                      ]
                    },
                    {
                      id: "effectiveDate",
                      operator: "<=",
                      value: "18",
                      unit: "MONTH",
                      relativeTo: "$referenceDate"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "HomeBasedSystolic",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#413606001",
                        name: "Average home systolic blood pressure (observable entity)"
                      },
                      {
                        "@id": "http://endhealth.info/emis#1994021000006104",
                        name: "Home systolic blood pressure"
                      }
                    ]
                  },
                  {
                    description: "numericValue >= 135",
                    id: "numericValue",
                    operator: ">=",
                    value: "135"
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    {
                      "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                      name: "Hypertension"
                    },
                    {
                      "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d",
                      name: "Unknown code set"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [
                      {
                        "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                        name: "Hypertension"
                      }
                    ]
                  }
                ]
              },
              {
                description: "observation",
                id: "observation",
                bool: "and",
                with: {
                  description: "Latest null",
                  bool: "and",
                  where: [
                    {
                      description: "DAP - Diastolic arterial pressure ....",
                      id: "concept",
                      in: [
                        {
                          "@id": "http://snomed.info/sct#271650006",
                          name: "Diastolic blood pressure (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#271650006",
                          name: "Diastolic blood pressure (observable entity)"
                        }
                      ]
                    },
                    {
                      id: "effectiveDate",
                      operator: "<=",
                      value: "18",
                      unit: "MONTH",
                      relativeTo: "$referenceDate"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "HomeBasedDiastolic",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#413605002",
                        name: "Average home diastolic blood pressure (observable entity)"
                      },
                      {
                        "@id": "http://endhealth.info/emis#1993951000006106",
                        name: "Home diastolic blood pressure"
                      },
                      {
                        "@id": "http://snomed.info/sct#314465004",
                        name: "24 hour diastolic blood pressure (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#198091000000104",
                        name: "Ambulatory diastolic blood pressure (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#198091000000104",
                        name: "Ambulatory diastolic blood pressure (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#314461008",
                        name: "Average day interval diastolic blood pressure (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#314462001",
                        name: "Average 24 hour diastolic blood pressure (observable entity)"
                      }
                    ]
                  },
                  {
                    description: "numericValue >= 85",
                    id: "numericValue",
                    operator: ">=",
                    value: "85"
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    {
                      "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95",
                      name: "Diabetes"
                    },
                    {
                      "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d",
                      name: "Diabetes (resovled)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Diabetes",
                    id: "concept",
                    in: [
                      {
                        "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95",
                        name: "Diabetes"
                      }
                    ]
                  }
                ]
              },
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest HbA1C",
                  id: "concept",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#999791000000106",
                      name: "Haemoglobin A1c level - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#1049301000000100",
                      name: "Haemoglobin A1c level (diagnostic reference range) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#1049321000000109",
                      name: "Haemoglobin A1c level (monitoring ranges) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "numericValue >= 59",
                    id: "numericValue",
                    operator: ">=",
                    value: "59"
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Qrisk2OrQRisk3",
                  id: "concept",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#718087004",
                      name: "QRISK2 cardiovascular disease 10 year risk score (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#1085871000000105",
                      name: "QRISK3 cardiovascular disease 10 year risk calculator score (observable entity)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "numericValue >= 10",
                    id: "numericValue",
                    operator: ">=",
                    value: "10"
                  }
                ]
              },
              {
                description: "not = ",
                bool: "not",
                where: [
                  {
                    description: "prescription",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "SelectedStatinsLast6M",
                        id: "concept",
                        in: [
                          {
                            "@id": "http://snomed.info/sct#19722511000001105",
                            name: "Atorvastatin 20mg chewable tablets sugar free (product)"
                          },
                          {
                            "@id": "http://snomed.info/sct#39733011000001106",
                            name: "Atorvastatin 20mg tablets (product)"
                          }
                        ]
                      },
                      {
                        description: "effectiveDate <= 6 MONTH",
                        id: "effectiveDate",
                        operator: "<=",
                        value: "6",
                        unit: "MONTH",
                        relativeTo: "$referenceDate"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                where: [
                  {
                    description: "concept is : Unknown code set, , , .. ",
                    id: "concept",
                    in: [
                      {
                        "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452",
                        name: "Unknown code set"
                      },
                      {
                        "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d",
                        name: "Unknown code set"
                      },
                      {
                        "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4",
                        name: "Unknown code set"
                      },
                      {
                        "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0",
                        name: "Unknown code set"
                      }
                    ]
                  }
                ]
              },
              {
                description: "not = ",
                bool: "not",
                where: [
                  {
                    description: "prescription",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "HighIntensityStatinLast6M",
                        id: "concept",
                        in: [
                          {
                            "@id": "http://snomed.info/sct#39733111000001107",
                            name: "Atorvastatin 40mg tablets (product)"
                          },
                          {
                            "@id": "http://snomed.info/sct#20528611000001105",
                            name: "Atorvastatin 60mg tablets (product)"
                          }
                        ]
                      },
                      {
                        description: "effectiveDate <= 6 MONTH",
                        id: "effectiveDate",
                        operator: "<=",
                        value: "6",
                        unit: "MONTH",
                        relativeTo: "$referenceDate"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    {
                      "@id": "urn:uuid:b8e618ac-9a75-40d7-a3f9-698c94c6591c",
                      name: "Unknown code set"
                    },
                    {
                      "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06",
                      name: "AF"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : AF",
                    id: "concept",
                    in: [
                      {
                        "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06",
                        name: "AF"
                      }
                    ]
                  }
                ]
              },
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest CHA2DS2",
                  id: "concept",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#735259005",
                      name: "Congestive heart failure, hypertension, age 2, diabetes mellitus, stroke 2, vascular disease, age, sex category stroke risk score (observable entity)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "numericValue >= 2",
                    id: "numericValue",
                    operator: ">=",
                    value: "2"
                  }
                ]
              },
              {
                description: "not = ",
                bool: "not",
                where: [
                  {
                    description: "prescription",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          {
                            "@id": "http://endhealth.info/emis#157321000033103",
                            name: "Warfarin"
                          },
                          {
                            "@id": "http://snomed.info/sct#63167009",
                            name: "Warfarin sodium (substance)"
                          },
                          {
                            "@id": "http://endhealth.info/emis#1230221000033107",
                            name: "Edoxaban tosilate"
                          },
                          {
                            "@id": "http://snomed.info/sct#700029008",
                            name: "Dabigatran etexilate (substance)"
                          },
                          {
                            "@id": "http://snomed.info/sct#698090000",
                            name: "Apixaban (substance)"
                          },
                          {
                            "@id": "http://snomed.info/sct#442031002",
                            name: "Rivaroxaban (substance)"
                          },
                          {
                            "@id": "http://snomed.info/sct#387260007",
                            name: "Phenindione (substance)"
                          },
                          {
                            "@id": "http://snomed.info/sct#387457003",
                            name: "Acenocoumarol (substance)"
                          }
                        ]
                      },
                      {
                        description: "effectiveDate <= 6 MONTH",
                        id: "effectiveDate",
                        operator: "<=",
                        value: "6",
                        unit: "MONTH",
                        relativeTo: "$referenceDate"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Body mass index ....",
                  id: "concept",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "numericValue >= 30",
                    id: "numericValue",
                    operator: ">=",
                    value: "30"
                  }
                ]
              },
              {
                description: "On Olanzapine, Clozapine in the last 6 months",
                id: "prescription",
                bool: "and",
                where: [
                  {
                    description: "Olanzapine ....",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#386849001",
                        name: "Olanzapine (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#725801000",
                        name: "Olanzapine embonate monohydrate (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#387568001",
                        name: "Clozapine (substance)"
                      }
                    ]
                  },
                  {
                    id: "effectiveDate",
                    operator: "<=",
                    value: "6",
                    unit: "MONTH",
                    relativeTo: "$referenceDate"
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Body mass index ....",
                  id: "concept",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#60621009",
                      name: "Body mass index (observable entity)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "numericValue >= 27.5",
                    id: "numericValue",
                    operator: ">=",
                    value: "27.5"
                  }
                ]
              },
              {
                description: "On Olanzapine, Clozapine in the last 6 months",
                id: "prescription",
                bool: "and",
                where: [
                  {
                    description: "Olanzapine ....",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#386849001",
                        name: "Olanzapine (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#725801000",
                        name: "Olanzapine embonate monohydrate (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#387568001",
                        name: "Clozapine (substance)"
                      }
                    ]
                  },
                  {
                    id: "effectiveDate",
                    operator: "<=",
                    value: "6",
                    unit: "MONTH",
                    relativeTo: "$referenceDate"
                  }
                ]
              },
              {
                description: "Asian or chinese",
                id: "observation",
                where: [
                  {
                    description: "Indians (Hindi-speaking) ....",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#64483007",
                        name: "Indians (Hindi-speaking) (ethnic group)"
                      },
                      {
                        "@id": "http://snomed.info/sct#81035008",
                        name: "Pakistani (Urduspeakers) (ethnic group)"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                where: [
                  {
                    description: "concept is : Type 1 Diabetes",
                    id: "concept",
                    in: [
                      {
                        "@id": "urn:uuid:5a0192fd-27ea-4b30-8f8d-db17ab89284a",
                        name: "Type 1 Diabetes"
                      }
                    ]
                  }
                ]
              },
              {
                description: "Age years >18",
                id: "age",
                operator: ">=",
                value: "18",
                unit: "YEAR"
              },
              {
                description: "On Atorvastin, Rosuvastin, Pravastin,Fluvastin,Simvastin in the last 6 months",
                id: "prescription",
                bool: "and",
                where: [
                  {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#373444002",
                        name: "Atorvastatin (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#700067006",
                        name: "Rosuvastatin (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#96306007",
                        name: "Pravastatin sodium (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#387585004",
                        name: "Fluvastatin (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#387584000",
                        name: "Simvastatin (substance)"
                      }
                    ]
                  },
                  {
                    id: "effectiveDate",
                    operator: "<=",
                    value: "6",
                    unit: "MONTH",
                    relativeTo: "$referenceDate"
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Diabetes mellitus without complication ....",
                  id: "concept",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#111552007",
                      name: "Diabetes mellitus without complication (disorder)"
                    },
                    {
                      "@id": "http://snomed.info/sct#112991000000101",
                      name: "Lipoatrophic diabetes mellitus without complication (disorder)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "Diabetes mellitus without complication ....",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#111552007",
                        name: "Diabetes mellitus without complication (disorder)"
                      },
                      {
                        "@id": "http://snomed.info/sct#11530004",
                        name: "Brittle diabetes mellitus (finding)"
                      }
                    ]
                  }
                ]
              },
              {
                description: "Age years >40",
                id: "age",
                operator: ">=",
                value: "40",
                unit: "YEAR"
              },
              {
                description: "On Atorvastin, Rosuvastin, Pravastin,Fluvastin,Simvastin in the last 6 months",
                id: "prescription",
                bool: "and",
                where: [
                  {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#373444002",
                        name: "Atorvastatin (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#700067006",
                        name: "Rosuvastatin (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#96306007",
                        name: "Pravastatin sodium (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#387585004",
                        name: "Fluvastatin (substance)"
                      },
                      {
                        "@id": "http://snomed.info/sct#387584000",
                        name: "Simvastatin (substance)"
                      }
                    ]
                  },
                  {
                    id: "effectiveDate",
                    operator: "<=",
                    value: "6",
                    unit: "MONTH",
                    relativeTo: "$referenceDate"
                  }
                ]
              }
            ]
          },
          {
            bool: "and",
            where: [
              {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    {
                      "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                      name: "Hypertension"
                    },
                    {
                      "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d",
                      name: "Unknown code set"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [
                      {
                        "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                        name: "Hypertension"
                      }
                    ]
                  }
                ]
              },
              {
                description: "not = ",
                bool: "not",
                where: [
                  {
                    description: "No blood pressure in the last 18 months",
                    id: "observation",
                    bool: "and",
                    where: [
                      {
                        description: "SAP - Systolic arterial pressure ....",
                        id: "concept",
                        in: [
                          {
                            "@id": "http://snomed.info/sct#271649006",
                            name: "Systolic blood pressure (observable entity)"
                          },
                          {
                            "@id": "http://snomed.info/sct#271649006",
                            name: "Systolic blood pressure (observable entity)"
                          }
                        ]
                      },
                      {
                        id: "effectiveDate",
                        operator: "<=",
                        value: "18",
                        unit: "MONTH",
                        relativeTo: "$referenceDate"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  nodes: [
    {
      key: "10",
      label: "SMI Population",
      type: "query",
      data: {
        "@id": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf",
        name: "SMI Population",
        sourceType: "set",
        description: "SMI Population",
        where: {
          bool: "or",
          where: [
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "concept is : Hypertension",
                      id: "concept",
                      in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                    }
                  ]
                },
                {
                  description: "observation",
                  id: "observation",
                  bool: "and",
                  with: {
                    description: "Latest null",
                    bool: "and",
                    where: [
                      {
                        description: "SystolicBP",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                        ]
                      },
                      { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "OfficeBasedSystolic",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                        { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                      ]
                    },
                    { description: "numericValue >= 140", id: "numericValue", operator: ">=", value: "140" }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "concept is : Hypertension",
                      id: "concept",
                      in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                    }
                  ]
                },
                {
                  description: "observation",
                  id: "observation",
                  bool: "and",
                  with: {
                    description: "Latest null",
                    bool: "and",
                    where: [
                      {
                        description: "BloodPressure",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" }
                        ]
                      },
                      { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "OfficeBasedDiastolic",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" },
                        { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" }
                      ]
                    },
                    { description: "numericValue >= 90", id: "numericValue", operator: ">=", value: "90" }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "concept is : Hypertension",
                      id: "concept",
                      in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                    }
                  ]
                },
                {
                  description: "observation",
                  id: "observation",
                  bool: "and",
                  with: {
                    description: "Latest null",
                    bool: "and",
                    where: [
                      {
                        description: "SAP - Systolic arterial pressure ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                        ]
                      },
                      { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "HomeBasedSystolic",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#413606001", name: "Average home systolic blood pressure (observable entity)" },
                        { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
                      ]
                    },
                    { description: "numericValue >= 135", id: "numericValue", operator: ">=", value: "135" }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "concept is : Hypertension",
                      id: "concept",
                      in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                    }
                  ]
                },
                {
                  description: "observation",
                  id: "observation",
                  bool: "and",
                  with: {
                    description: "Latest null",
                    bool: "and",
                    where: [
                      {
                        description: "DAP - Diastolic arterial pressure ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" }
                        ]
                      },
                      { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "HomeBasedDiastolic",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                        { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                        { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                        { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                        { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                        { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                        { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                      ]
                    },
                    { description: "numericValue >= 85", id: "numericValue", operator: ">=", value: "85" }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                      { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    { description: "concept is : Diabetes", id: "concept", in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }] }
                  ]
                },
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest HbA1C",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#999791000000106",
                        name: "Haemoglobin A1c level - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#1049301000000100",
                        name: "Haemoglobin A1c level (diagnostic reference range) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#1049321000000109",
                        name: "Haemoglobin A1c level (monitoring ranges) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                      }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [{ description: "numericValue >= 59", id: "numericValue", operator: ">=", value: "59" }]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest Qrisk2OrQRisk3",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#718087004", name: "QRISK2 cardiovascular disease 10 year risk score (observable entity)" },
                      {
                        "@id": "http://snomed.info/sct#1085871000000105",
                        name: "QRISK3 cardiovascular disease 10 year risk calculator score (observable entity)"
                      }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [{ description: "numericValue >= 10", id: "numericValue", operator: ">=", value: "10" }]
                },
                {
                  description: "not = ",
                  bool: "not",
                  where: [
                    {
                      description: "prescription",
                      id: "prescription",
                      bool: "and",
                      where: [
                        {
                          description: "SelectedStatinsLast6M",
                          id: "concept",
                          in: [
                            { "@id": "http://snomed.info/sct#19722511000001105", name: "Atorvastatin 20mg chewable tablets sugar free (product)" },
                            { "@id": "http://snomed.info/sct#39733011000001106", name: "Atorvastatin 20mg tablets (product)" }
                          ]
                        },
                        {
                          description: "effectiveDate <= 6 MONTH",
                          id: "effectiveDate",
                          operator: "<=",
                          value: "6",
                          unit: "MONTH",
                          relativeTo: "$referenceDate"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  where: [
                    {
                      description: "concept is : Unknown code set, , , .. ",
                      id: "concept",
                      in: [
                        { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                        { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                        { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                        { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                      ]
                    }
                  ]
                },
                {
                  description: "not = ",
                  bool: "not",
                  where: [
                    {
                      description: "prescription",
                      id: "prescription",
                      bool: "and",
                      where: [
                        {
                          description: "HighIntensityStatinLast6M",
                          id: "concept",
                          in: [
                            { "@id": "http://snomed.info/sct#39733111000001107", name: "Atorvastatin 40mg tablets (product)" },
                            { "@id": "http://snomed.info/sct#20528611000001105", name: "Atorvastatin 60mg tablets (product)" }
                          ]
                        },
                        {
                          description: "effectiveDate <= 6 MONTH",
                          id: "effectiveDate",
                          operator: "<=",
                          value: "6",
                          unit: "MONTH",
                          relativeTo: "$referenceDate"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:b8e618ac-9a75-40d7-a3f9-698c94c6591c", name: "Unknown code set" },
                      { "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [{ description: "concept is : AF", id: "concept", in: [{ "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }] }]
                },
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest CHA2DS2",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#735259005",
                        name: "Congestive heart failure, hypertension, age 2, diabetes mellitus, stroke 2, vascular disease, age, sex category stroke risk score (observable entity)"
                      }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [{ description: "numericValue >= 2", id: "numericValue", operator: ">=", value: "2" }]
                },
                {
                  description: "not = ",
                  bool: "not",
                  where: [
                    {
                      description: "prescription",
                      id: "prescription",
                      bool: "and",
                      where: [
                        {
                          description: "AntiCoagulants",
                          id: "concept",
                          in: [
                            { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                            { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                            { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                            { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                            { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                            { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                            { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                            { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                          ]
                        },
                        {
                          description: "effectiveDate <= 6 MONTH",
                          id: "effectiveDate",
                          operator: "<=",
                          value: "6",
                          unit: "MONTH",
                          relativeTo: "$referenceDate"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest Body mass index ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [{ description: "numericValue >= 30", id: "numericValue", operator: ">=", value: "30" }]
                },
                {
                  description: "On Olanzapine, Clozapine in the last 6 months",
                  id: "prescription",
                  bool: "and",
                  where: [
                    {
                      description: "Olanzapine ....",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                        { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                        { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                      ]
                    },
                    { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest Body mass index ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [{ description: "numericValue >= 27.5", id: "numericValue", operator: ">=", value: "27.5" }]
                },
                {
                  description: "On Olanzapine, Clozapine in the last 6 months",
                  id: "prescription",
                  bool: "and",
                  where: [
                    {
                      description: "Olanzapine ....",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                        { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                        { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                      ]
                    },
                    { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                  ]
                },
                {
                  description: "Asian or chinese",
                  id: "observation",
                  where: [
                    {
                      description: "Indians (Hindi-speaking) ....",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#64483007", name: "Indians (Hindi-speaking) (ethnic group)" },
                        { "@id": "http://snomed.info/sct#81035008", name: "Pakistani (Urduspeakers) (ethnic group)" }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  where: [
                    {
                      description: "concept is : Type 1 Diabetes",
                      id: "concept",
                      in: [{ "@id": "urn:uuid:5a0192fd-27ea-4b30-8f8d-db17ab89284a", name: "Type 1 Diabetes" }]
                    }
                  ]
                },
                { description: "Age years >18", id: "age", operator: ">=", value: "18", unit: "YEAR" },
                {
                  description: "On Atorvastin, Rosuvastin, Pravastin,Fluvastin,Simvastin in the last 6 months",
                  id: "prescription",
                  bool: "and",
                  where: [
                    {
                      description: "Atorvastatin ....",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                        { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                        { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                        { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                        { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                      ]
                    },
                    { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest Diabetes mellitus without complication ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                      { "@id": "http://snomed.info/sct#112991000000101", name: "Lipoatrophic diabetes mellitus without complication (disorder)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "Diabetes mellitus without complication ....",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                        { "@id": "http://snomed.info/sct#11530004", name: "Brittle diabetes mellitus (finding)" }
                      ]
                    }
                  ]
                },
                { description: "Age years >40", id: "age", operator: ">=", value: "40", unit: "YEAR" },
                {
                  description: "On Atorvastin, Rosuvastin, Pravastin,Fluvastin,Simvastin in the last 6 months",
                  id: "prescription",
                  bool: "and",
                  where: [
                    {
                      description: "Atorvastatin ....",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                        { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                        { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                        { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                        { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                      ]
                    },
                    { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                  ]
                }
              ]
            },
            {
              bool: "and",
              where: [
                {
                  description: "observation",
                  id: "observation",
                  with: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  where: [
                    {
                      description: "concept is : Hypertension",
                      id: "concept",
                      in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                    }
                  ]
                },
                {
                  description: "not = ",
                  bool: "not",
                  where: [
                    {
                      description: "No blood pressure in the last 18 months",
                      id: "observation",
                      bool: "and",
                      where: [
                        {
                          description: "SAP - Systolic arterial pressure ....",
                          id: "concept",
                          in: [
                            { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                            { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                          ]
                        },
                        { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      children: [
        {
          key: "100",
          label: "any of",
          type: "where",
          data: {
            bool: "or",
            where: [
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest null",
                      id: "concept",
                      in: [
                        { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                        { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Hypertension",
                        id: "concept",
                        in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                      }
                    ]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    bool: "and",
                    with: {
                      description: "Latest null",
                      bool: "and",
                      where: [
                        {
                          description: "SystolicBP",
                          id: "concept",
                          in: [
                            { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                            { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                          ]
                        },
                        { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "OfficeBasedSystolic",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                        ]
                      },
                      { description: "numericValue >= 140", id: "numericValue", operator: ">=", value: "140" }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest null",
                      id: "concept",
                      in: [
                        { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                        { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Hypertension",
                        id: "concept",
                        in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                      }
                    ]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    bool: "and",
                    with: {
                      description: "Latest null",
                      bool: "and",
                      where: [
                        {
                          description: "BloodPressure",
                          id: "concept",
                          in: [
                            { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" },
                            { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" }
                          ]
                        },
                        { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "OfficeBasedDiastolic",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" }
                        ]
                      },
                      { description: "numericValue >= 90", id: "numericValue", operator: ">=", value: "90" }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest null",
                      id: "concept",
                      in: [
                        { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                        { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Hypertension",
                        id: "concept",
                        in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                      }
                    ]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    bool: "and",
                    with: {
                      description: "Latest null",
                      bool: "and",
                      where: [
                        {
                          description: "SAP - Systolic arterial pressure ....",
                          id: "concept",
                          in: [
                            { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                            { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                          ]
                        },
                        { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "HomeBasedSystolic",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#413606001", name: "Average home systolic blood pressure (observable entity)" },
                          { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
                        ]
                      },
                      { description: "numericValue >= 135", id: "numericValue", operator: ">=", value: "135" }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest null",
                      id: "concept",
                      in: [
                        { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                        { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Hypertension",
                        id: "concept",
                        in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                      }
                    ]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    bool: "and",
                    with: {
                      description: "Latest null",
                      bool: "and",
                      where: [
                        {
                          description: "DAP - Diastolic arterial pressure ....",
                          id: "concept",
                          in: [
                            { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" },
                            { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" }
                          ]
                        },
                        { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "HomeBasedDiastolic",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                          { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                          { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                        ]
                      },
                      { description: "numericValue >= 85", id: "numericValue", operator: ">=", value: "85" }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest null",
                      id: "concept",
                      in: [
                        { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                        { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Diabetes",
                        id: "concept",
                        in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }]
                      }
                    ]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest HbA1C",
                      id: "concept",
                      in: [
                        {
                          "@id": "http://snomed.info/sct#999791000000106",
                          name: "Haemoglobin A1c level - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#1049301000000100",
                          name: "Haemoglobin A1c level (diagnostic reference range) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                        },
                        {
                          "@id": "http://snomed.info/sct#1049321000000109",
                          name: "Haemoglobin A1c level (monitoring ranges) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                        }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [{ description: "numericValue >= 59", id: "numericValue", operator: ">=", value: "59" }]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest Qrisk2OrQRisk3",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#718087004", name: "QRISK2 cardiovascular disease 10 year risk score (observable entity)" },
                        {
                          "@id": "http://snomed.info/sct#1085871000000105",
                          name: "QRISK3 cardiovascular disease 10 year risk calculator score (observable entity)"
                        }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [{ description: "numericValue >= 10", id: "numericValue", operator: ">=", value: "10" }]
                  },
                  {
                    description: "not = ",
                    bool: "not",
                    where: [
                      {
                        description: "prescription",
                        id: "prescription",
                        bool: "and",
                        where: [
                          {
                            description: "SelectedStatinsLast6M",
                            id: "concept",
                            in: [
                              { "@id": "http://snomed.info/sct#19722511000001105", name: "Atorvastatin 20mg chewable tablets sugar free (product)" },
                              { "@id": "http://snomed.info/sct#39733011000001106", name: "Atorvastatin 20mg tablets (product)" }
                            ]
                          },
                          {
                            description: "effectiveDate <= 6 MONTH",
                            id: "effectiveDate",
                            operator: "<=",
                            value: "6",
                            unit: "MONTH",
                            relativeTo: "$referenceDate"
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    where: [
                      {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                          { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                          { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                          { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                        ]
                      }
                    ]
                  },
                  {
                    description: "not = ",
                    bool: "not",
                    where: [
                      {
                        description: "prescription",
                        id: "prescription",
                        bool: "and",
                        where: [
                          {
                            description: "HighIntensityStatinLast6M",
                            id: "concept",
                            in: [
                              { "@id": "http://snomed.info/sct#39733111000001107", name: "Atorvastatin 40mg tablets (product)" },
                              { "@id": "http://snomed.info/sct#20528611000001105", name: "Atorvastatin 60mg tablets (product)" }
                            ]
                          },
                          {
                            description: "effectiveDate <= 6 MONTH",
                            id: "effectiveDate",
                            operator: "<=",
                            value: "6",
                            unit: "MONTH",
                            relativeTo: "$referenceDate"
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest null",
                      id: "concept",
                      in: [
                        { "@id": "urn:uuid:b8e618ac-9a75-40d7-a3f9-698c94c6591c", name: "Unknown code set" },
                        { "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [{ description: "concept is : AF", id: "concept", in: [{ "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }] }]
                  },
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest CHA2DS2",
                      id: "concept",
                      in: [
                        {
                          "@id": "http://snomed.info/sct#735259005",
                          name: "Congestive heart failure, hypertension, age 2, diabetes mellitus, stroke 2, vascular disease, age, sex category stroke risk score (observable entity)"
                        }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [{ description: "numericValue >= 2", id: "numericValue", operator: ">=", value: "2" }]
                  },
                  {
                    description: "not = ",
                    bool: "not",
                    where: [
                      {
                        description: "prescription",
                        id: "prescription",
                        bool: "and",
                        where: [
                          {
                            description: "AntiCoagulants",
                            id: "concept",
                            in: [
                              { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                              { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                              { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                              { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                              { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                              { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                              { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                              { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                            ]
                          },
                          {
                            description: "effectiveDate <= 6 MONTH",
                            id: "effectiveDate",
                            operator: "<=",
                            value: "6",
                            unit: "MONTH",
                            relativeTo: "$referenceDate"
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest Body mass index ....",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [{ description: "numericValue >= 30", id: "numericValue", operator: ">=", value: "30" }]
                  },
                  {
                    description: "On Olanzapine, Clozapine in the last 6 months",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "Olanzapine ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                          { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                          { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                        ]
                      },
                      { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest Body mass index ....",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                        { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [{ description: "numericValue >= 27.5", id: "numericValue", operator: ">=", value: "27.5" }]
                  },
                  {
                    description: "On Olanzapine, Clozapine in the last 6 months",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "Olanzapine ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                          { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                          { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                        ]
                      },
                      { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                    ]
                  },
                  {
                    description: "Asian or chinese",
                    id: "observation",
                    where: [
                      {
                        description: "Indians (Hindi-speaking) ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#64483007", name: "Indians (Hindi-speaking) (ethnic group)" },
                          { "@id": "http://snomed.info/sct#81035008", name: "Pakistani (Urduspeakers) (ethnic group)" }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    where: [
                      {
                        description: "concept is : Type 1 Diabetes",
                        id: "concept",
                        in: [{ "@id": "urn:uuid:5a0192fd-27ea-4b30-8f8d-db17ab89284a", name: "Type 1 Diabetes" }]
                      }
                    ]
                  },
                  { description: "Age years >18", id: "age", operator: ">=", value: "18", unit: "YEAR" },
                  {
                    description: "On Atorvastin, Rosuvastin, Pravastin,Fluvastin,Simvastin in the last 6 months",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "Atorvastatin ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                          { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                          { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                          { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                          { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                        ]
                      },
                      { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest Diabetes mellitus without complication ....",
                      id: "concept",
                      in: [
                        { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                        { "@id": "http://snomed.info/sct#112991000000101", name: "Lipoatrophic diabetes mellitus without complication (disorder)" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "Diabetes mellitus without complication ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                          { "@id": "http://snomed.info/sct#11530004", name: "Brittle diabetes mellitus (finding)" }
                        ]
                      }
                    ]
                  },
                  { description: "Age years >40", id: "age", operator: ">=", value: "40", unit: "YEAR" },
                  {
                    description: "On Atorvastin, Rosuvastin, Pravastin,Fluvastin,Simvastin in the last 6 months",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "Atorvastatin ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                          { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                          { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                          { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                          { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                        ]
                      },
                      { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                    ]
                  }
                ]
              },
              {
                bool: "and",
                where: [
                  {
                    description: "observation",
                    id: "observation",
                    with: {
                      description: "Latest null",
                      id: "concept",
                      in: [
                        { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                        { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                      ],
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Hypertension",
                        id: "concept",
                        in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                      }
                    ]
                  },
                  {
                    description: "not = ",
                    bool: "not",
                    where: [
                      {
                        description: "No blood pressure in the last 18 months",
                        id: "observation",
                        bool: "and",
                        where: [
                          {
                            description: "SAP - Systolic arterial pressure ....",
                            id: "concept",
                            in: [
                              { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                              { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                            ]
                          },
                          { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          children: [
            {
              key: "1000",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                    { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  }
                ]
              },
              children: [
                {
                  key: "10000",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "100000",
                      label: "Hypertension",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "100001",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "10001",
                  label: "concept: Hypertension",
                  type: "where",
                  data: {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  },
                  children: []
                }
              ]
            },
            {
              key: "1001",
              label: "concept from",
              type: "where",
              data: {
                description: "OfficeBasedSystolic",
                id: "concept",
                in: [
                  { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                  { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                ]
              },
              children: [
                {
                  key: "10010",
                  label: "Systolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "OfficeBasedSystolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "10011",
                  label: "Systolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "OfficeBasedSystolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                }
              ]
            },
            {
              key: "1002",
              label: "numericValue >= 140",
              type: "where",
              data: { description: "numericValue >= 140", id: "numericValue", operator: ">=", value: "140" },
              children: []
            },
            {
              key: "1003",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                    { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  }
                ]
              },
              children: [
                {
                  key: "10030",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "100300",
                      label: "Hypertension",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "100301",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "10031",
                  label: "concept: Hypertension",
                  type: "where",
                  data: {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  },
                  children: []
                }
              ]
            },
            {
              key: "1004",
              label: "concept from",
              type: "where",
              data: {
                description: "OfficeBasedDiastolic",
                id: "concept",
                in: [
                  { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" },
                  { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" }
                ]
              },
              children: [
                {
                  key: "10040",
                  label: "Diastolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "OfficeBasedDiastolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "10041",
                  label: "Diastolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "OfficeBasedDiastolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#271650006", name: "Diastolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                }
              ]
            },
            {
              key: "1005",
              label: "numericValue >= 90",
              type: "where",
              data: { description: "numericValue >= 90", id: "numericValue", operator: ">=", value: "90" },
              children: []
            },
            {
              key: "1006",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                    { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  }
                ]
              },
              children: [
                {
                  key: "10060",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "100600",
                      label: "Hypertension",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "100601",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "10061",
                  label: "concept: Hypertension",
                  type: "where",
                  data: {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  },
                  children: []
                }
              ]
            },
            {
              key: "1007",
              label: "concept from",
              type: "where",
              data: {
                description: "HomeBasedSystolic",
                id: "concept",
                in: [
                  { "@id": "http://snomed.info/sct#413606001", name: "Average home systolic blood pressure (observable entity)" },
                  { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
                ]
              },
              children: [
                {
                  key: "10070",
                  label: "Average home systolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "HomeBasedSystolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#413606001", name: "Average home systolic blood pressure (observable entity)" },
                      { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
                    ]
                  },
                  children: []
                },
                {
                  key: "10071",
                  label: "Home systolic blood pressure",
                  type: "where",
                  data: {
                    description: "HomeBasedSystolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#413606001", name: "Average home systolic blood pressure (observable entity)" },
                      { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
                    ]
                  },
                  children: []
                }
              ]
            },
            {
              key: "1008",
              label: "numericValue >= 135",
              type: "where",
              data: { description: "numericValue >= 135", id: "numericValue", operator: ">=", value: "135" },
              children: []
            },
            {
              key: "1009",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                    { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  }
                ]
              },
              children: [
                {
                  key: "10090",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "100900",
                      label: "Hypertension",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "100901",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "10091",
                  label: "concept: Hypertension",
                  type: "where",
                  data: {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  },
                  children: []
                }
              ]
            },
            {
              key: "10010",
              label: "concept from",
              type: "where",
              data: {
                description: "HomeBasedDiastolic",
                id: "concept",
                in: [
                  { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                  { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                  { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                  { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                  { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                  { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                  { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                ]
              },
              children: [
                {
                  key: "100100",
                  label: "Average home diastolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "HomeBasedDiastolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                      { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                      { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100101",
                  label: "Home diastolic blood pressure",
                  type: "where",
                  data: {
                    description: "HomeBasedDiastolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                      { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                      { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100102",
                  label: "24 hour diastolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "HomeBasedDiastolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                      { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                      { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100103",
                  label: "Ambulatory diastolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "HomeBasedDiastolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                      { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                      { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100104",
                  label: "Ambulatory diastolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "HomeBasedDiastolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                      { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                      { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100105",
                  label: "Average day interval diastolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "HomeBasedDiastolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                      { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                      { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100106",
                  label: "Average 24 hour diastolic blood pressure (observable entity)",
                  type: "where",
                  data: {
                    description: "HomeBasedDiastolic",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#413605002", name: "Average home diastolic blood pressure (observable entity)" },
                      { "@id": "http://endhealth.info/emis#1993951000006106", name: "Home diastolic blood pressure" },
                      { "@id": "http://snomed.info/sct#314465004", name: "24 hour diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#198091000000104", name: "Ambulatory diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314461008", name: "Average day interval diastolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#314462001", name: "Average 24 hour diastolic blood pressure (observable entity)" }
                    ]
                  },
                  children: []
                }
              ]
            },
            {
              key: "10011",
              label: "numericValue >= 85",
              type: "where",
              data: { description: "numericValue >= 85", id: "numericValue", operator: ">=", value: "85" },
              children: []
            },
            {
              key: "10012",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                    { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  { description: "concept is : Diabetes", id: "concept", in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }] }
                ]
              },
              children: [
                {
                  key: "100120",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                      { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "1001200",
                      label: "Diabetes",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                          { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1001201",
                      label: "Diabetes (resovled)",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" },
                          { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Diabetes (resovled)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100121",
                  label: "concept: Diabetes",
                  type: "where",
                  data: {
                    description: "concept is : Diabetes",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Diabetes" }]
                  },
                  children: []
                }
              ]
            },
            {
              key: "10013",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest HbA1C",
                  id: "concept",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#999791000000106",
                      name: "Haemoglobin A1c level - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#1049301000000100",
                      name: "Haemoglobin A1c level (diagnostic reference range) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                    },
                    {
                      "@id": "http://snomed.info/sct#1049321000000109",
                      name: "Haemoglobin A1c level (monitoring ranges) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [{ description: "numericValue >= 59", id: "numericValue", operator: ">=", value: "59" }]
              },
              children: [
                {
                  key: "100130",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest HbA1C",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#999791000000106",
                        name: "Haemoglobin A1c level - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#1049301000000100",
                        name: "Haemoglobin A1c level (diagnostic reference range) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                      },
                      {
                        "@id": "http://snomed.info/sct#1049321000000109",
                        name: "Haemoglobin A1c level (monitoring ranges) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                      }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "1001300",
                      label: "Haemoglobin A1c level - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest HbA1C",
                        id: "concept",
                        in: [
                          {
                            "@id": "http://snomed.info/sct#999791000000106",
                            name: "Haemoglobin A1c level - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                          },
                          {
                            "@id": "http://snomed.info/sct#1049301000000100",
                            name: "Haemoglobin A1c level (diagnostic reference range) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                          },
                          {
                            "@id": "http://snomed.info/sct#1049321000000109",
                            name: "Haemoglobin A1c level (monitoring ranges) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                          }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1001301",
                      label:
                        "Haemoglobin A1c level (diagnostic reference range) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest HbA1C",
                        id: "concept",
                        in: [
                          {
                            "@id": "http://snomed.info/sct#999791000000106",
                            name: "Haemoglobin A1c level - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                          },
                          {
                            "@id": "http://snomed.info/sct#1049301000000100",
                            name: "Haemoglobin A1c level (diagnostic reference range) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                          },
                          {
                            "@id": "http://snomed.info/sct#1049321000000109",
                            name: "Haemoglobin A1c level (monitoring ranges) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                          }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1001302",
                      label:
                        "Haemoglobin A1c level (monitoring ranges) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest HbA1C",
                        id: "concept",
                        in: [
                          {
                            "@id": "http://snomed.info/sct#999791000000106",
                            name: "Haemoglobin A1c level - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                          },
                          {
                            "@id": "http://snomed.info/sct#1049301000000100",
                            name: "Haemoglobin A1c level (diagnostic reference range) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                          },
                          {
                            "@id": "http://snomed.info/sct#1049321000000109",
                            name: "Haemoglobin A1c level (monitoring ranges) - International Federation of Clinical Chemistry and Laboratory Medicine standardised (observable entity)"
                          }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100131",
                  label: "numericValue >= 59",
                  type: "where",
                  data: { description: "numericValue >= 59", id: "numericValue", operator: ">=", value: "59" },
                  children: []
                }
              ]
            },
            {
              key: "10014",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Qrisk2OrQRisk3",
                  id: "concept",
                  in: [
                    { "@id": "http://snomed.info/sct#718087004", name: "QRISK2 cardiovascular disease 10 year risk score (observable entity)" },
                    {
                      "@id": "http://snomed.info/sct#1085871000000105",
                      name: "QRISK3 cardiovascular disease 10 year risk calculator score (observable entity)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [{ description: "numericValue >= 10", id: "numericValue", operator: ">=", value: "10" }]
              },
              children: [
                {
                  key: "100140",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest Qrisk2OrQRisk3",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#718087004", name: "QRISK2 cardiovascular disease 10 year risk score (observable entity)" },
                      {
                        "@id": "http://snomed.info/sct#1085871000000105",
                        name: "QRISK3 cardiovascular disease 10 year risk calculator score (observable entity)"
                      }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "1001400",
                      label: "QRISK2 cardiovascular disease 10 year risk score (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Qrisk2OrQRisk3",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#718087004", name: "QRISK2 cardiovascular disease 10 year risk score (observable entity)" },
                          {
                            "@id": "http://snomed.info/sct#1085871000000105",
                            name: "QRISK3 cardiovascular disease 10 year risk calculator score (observable entity)"
                          }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1001401",
                      label: "QRISK3 cardiovascular disease 10 year risk calculator score (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Qrisk2OrQRisk3",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#718087004", name: "QRISK2 cardiovascular disease 10 year risk score (observable entity)" },
                          {
                            "@id": "http://snomed.info/sct#1085871000000105",
                            name: "QRISK3 cardiovascular disease 10 year risk calculator score (observable entity)"
                          }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100141",
                  label: "numericValue >= 10",
                  type: "where",
                  data: { description: "numericValue >= 10", id: "numericValue", operator: ">=", value: "10" },
                  children: []
                }
              ]
            },
            {
              key: "10015",
              label: "not",
              type: "where",
              data: {
                description: "not = ",
                bool: "not",
                where: [
                  {
                    description: "prescription",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "SelectedStatinsLast6M",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#19722511000001105", name: "Atorvastatin 20mg chewable tablets sugar free (product)" },
                          { "@id": "http://snomed.info/sct#39733011000001106", name: "Atorvastatin 20mg tablets (product)" }
                        ]
                      },
                      { description: "effectiveDate <= 6 MONTH", id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                    ]
                  }
                ]
              },
              children: [
                {
                  key: "100150",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "SelectedStatinsLast6M",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#19722511000001105", name: "Atorvastatin 20mg chewable tablets sugar free (product)" },
                      { "@id": "http://snomed.info/sct#39733011000001106", name: "Atorvastatin 20mg tablets (product)" }
                    ]
                  },
                  children: [
                    {
                      key: "1001500",
                      label: "Atorvastatin 20mg chewable tablets sugar free (product)",
                      type: "where",
                      data: {
                        description: "SelectedStatinsLast6M",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#19722511000001105", name: "Atorvastatin 20mg chewable tablets sugar free (product)" },
                          { "@id": "http://snomed.info/sct#39733011000001106", name: "Atorvastatin 20mg tablets (product)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1001501",
                      label: "Atorvastatin 20mg tablets (product)",
                      type: "where",
                      data: {
                        description: "SelectedStatinsLast6M",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#19722511000001105", name: "Atorvastatin 20mg chewable tablets sugar free (product)" },
                          { "@id": "http://snomed.info/sct#39733011000001106", name: "Atorvastatin 20mg tablets (product)" }
                        ]
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100151",
                  label: "effectiveDate <= $referenceDate 6 (MONTH)",
                  type: "where",
                  data: {
                    description: "effectiveDate <= 6 MONTH",
                    id: "effectiveDate",
                    operator: "<=",
                    value: "6",
                    unit: "MONTH",
                    relativeTo: "$referenceDate"
                  },
                  children: []
                }
              ]
            },
            {
              key: "10016",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                where: [
                  {
                    description: "concept is : Unknown code set, , , .. ",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                      { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                      { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                      { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                    ]
                  }
                ]
              },
              children: [
                {
                  key: "100160",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "concept is : Unknown code set, , , .. ",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                      { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                      { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                      { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                    ]
                  },
                  children: [
                    {
                      key: "1001600",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                          { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                          { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                          { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1001601",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                          { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                          { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                          { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1001602",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                          { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                          { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                          { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1001603",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , , .. ",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:22575230-a13e-431d-983c-3fee668bf452", name: "Unknown code set" },
                          { "@id": "urn:uuid:8aa2198a-efca-4d1a-9bcf-1fd6117ef87d", name: "Unknown code set" },
                          { "@id": "urn:uuid:1ee3788a-0e92-4a69-890a-0b5daff494b4", name: "Unknown code set" },
                          { "@id": "urn:uuid:8a030be6-be7a-49eb-b187-6575dfdd32c0", name: "Unknown code set" }
                        ]
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              key: "10017",
              label: "not",
              type: "where",
              data: {
                description: "not = ",
                bool: "not",
                where: [
                  {
                    description: "prescription",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "HighIntensityStatinLast6M",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#39733111000001107", name: "Atorvastatin 40mg tablets (product)" },
                          { "@id": "http://snomed.info/sct#20528611000001105", name: "Atorvastatin 60mg tablets (product)" }
                        ]
                      },
                      { description: "effectiveDate <= 6 MONTH", id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                    ]
                  }
                ]
              },
              children: [
                {
                  key: "100170",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "HighIntensityStatinLast6M",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#39733111000001107", name: "Atorvastatin 40mg tablets (product)" },
                      { "@id": "http://snomed.info/sct#20528611000001105", name: "Atorvastatin 60mg tablets (product)" }
                    ]
                  },
                  children: [
                    {
                      key: "1001700",
                      label: "Atorvastatin 40mg tablets (product)",
                      type: "where",
                      data: {
                        description: "HighIntensityStatinLast6M",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#39733111000001107", name: "Atorvastatin 40mg tablets (product)" },
                          { "@id": "http://snomed.info/sct#20528611000001105", name: "Atorvastatin 60mg tablets (product)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1001701",
                      label: "Atorvastatin 60mg tablets (product)",
                      type: "where",
                      data: {
                        description: "HighIntensityStatinLast6M",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#39733111000001107", name: "Atorvastatin 40mg tablets (product)" },
                          { "@id": "http://snomed.info/sct#20528611000001105", name: "Atorvastatin 60mg tablets (product)" }
                        ]
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100171",
                  label: "effectiveDate <= $referenceDate 6 (MONTH)",
                  type: "where",
                  data: {
                    description: "effectiveDate <= 6 MONTH",
                    id: "effectiveDate",
                    operator: "<=",
                    value: "6",
                    unit: "MONTH",
                    relativeTo: "$referenceDate"
                  },
                  children: []
                }
              ]
            },
            {
              key: "10018",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:b8e618ac-9a75-40d7-a3f9-698c94c6591c", name: "Unknown code set" },
                    { "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [{ description: "concept is : AF", id: "concept", in: [{ "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }] }]
              },
              children: [
                {
                  key: "100180",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:b8e618ac-9a75-40d7-a3f9-698c94c6591c", name: "Unknown code set" },
                      { "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "1001800",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:b8e618ac-9a75-40d7-a3f9-698c94c6591c", name: "Unknown code set" },
                          { "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1001801",
                      label: "AF",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:b8e618ac-9a75-40d7-a3f9-698c94c6591c", name: "Unknown code set" },
                          { "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100181",
                  label: "concept: AF",
                  type: "where",
                  data: { description: "concept is : AF", id: "concept", in: [{ "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }] },
                  children: []
                }
              ]
            },
            {
              key: "10019",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest CHA2DS2",
                  id: "concept",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#735259005",
                      name: "Congestive heart failure, hypertension, age 2, diabetes mellitus, stroke 2, vascular disease, age, sex category stroke risk score (observable entity)"
                    }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [{ description: "numericValue >= 2", id: "numericValue", operator: ">=", value: "2" }]
              },
              children: [
                {
                  key: "100190",
                  label:
                    "Latest concept: Congestive heart failure, hypertension, age 2, diabetes mellitus, stroke 2, vascular disease, age, sex category stroke risk score (observable entity)",
                  type: "with",
                  data: {
                    description: "Latest CHA2DS2",
                    id: "concept",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#735259005",
                        name: "Congestive heart failure, hypertension, age 2, diabetes mellitus, stroke 2, vascular disease, age, sex category stroke risk score (observable entity)"
                      }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: []
                },
                {
                  key: "100191",
                  label: "numericValue >= 2",
                  type: "where",
                  data: { description: "numericValue >= 2", id: "numericValue", operator: ">=", value: "2" },
                  children: []
                }
              ]
            },
            {
              key: "10020",
              label: "not",
              type: "where",
              data: {
                description: "not = ",
                bool: "not",
                where: [
                  {
                    description: "prescription",
                    id: "prescription",
                    bool: "and",
                    where: [
                      {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                          { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                          { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                          { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                          { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                          { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                          { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                          { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                        ]
                      },
                      { description: "effectiveDate <= 6 MONTH", id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" }
                    ]
                  }
                ]
              },
              children: [
                {
                  key: "100200",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "AntiCoagulants",
                    id: "concept",
                    in: [
                      { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                      { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                      { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                      { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                      { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                      { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                      { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                      { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                    ]
                  },
                  children: [
                    {
                      key: "1002000",
                      label: "Warfarin",
                      type: "where",
                      data: {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                          { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                          { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                          { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                          { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                          { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                          { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                          { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1002001",
                      label: "Warfarin sodium (substance)",
                      type: "where",
                      data: {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                          { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                          { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                          { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                          { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                          { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                          { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                          { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1002002",
                      label: "Edoxaban tosilate",
                      type: "where",
                      data: {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                          { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                          { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                          { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                          { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                          { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                          { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                          { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1002003",
                      label: "Dabigatran etexilate (substance)",
                      type: "where",
                      data: {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                          { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                          { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                          { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                          { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                          { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                          { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                          { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1002004",
                      label: "Apixaban (substance)",
                      type: "where",
                      data: {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                          { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                          { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                          { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                          { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                          { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                          { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                          { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1002005",
                      label: "Rivaroxaban (substance)",
                      type: "where",
                      data: {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                          { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                          { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                          { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                          { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                          { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                          { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                          { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1002006",
                      label: "Phenindione (substance)",
                      type: "where",
                      data: {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                          { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                          { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                          { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                          { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                          { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                          { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                          { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1002007",
                      label: "Acenocoumarol (substance)",
                      type: "where",
                      data: {
                        description: "AntiCoagulants",
                        id: "concept",
                        in: [
                          { "@id": "http://endhealth.info/emis#157321000033103", name: "Warfarin" },
                          { "@id": "http://snomed.info/sct#63167009", name: "Warfarin sodium (substance)" },
                          { "@id": "http://endhealth.info/emis#1230221000033107", name: "Edoxaban tosilate" },
                          { "@id": "http://snomed.info/sct#700029008", name: "Dabigatran etexilate (substance)" },
                          { "@id": "http://snomed.info/sct#698090000", name: "Apixaban (substance)" },
                          { "@id": "http://snomed.info/sct#442031002", name: "Rivaroxaban (substance)" },
                          { "@id": "http://snomed.info/sct#387260007", name: "Phenindione (substance)" },
                          { "@id": "http://snomed.info/sct#387457003", name: "Acenocoumarol (substance)" }
                        ]
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100201",
                  label: "effectiveDate <= $referenceDate 6 (MONTH)",
                  type: "where",
                  data: {
                    description: "effectiveDate <= 6 MONTH",
                    id: "effectiveDate",
                    operator: "<=",
                    value: "6",
                    unit: "MONTH",
                    relativeTo: "$referenceDate"
                  },
                  children: []
                }
              ]
            },
            {
              key: "10021",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Body mass index ....",
                  id: "concept",
                  in: [
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [{ description: "numericValue >= 30", id: "numericValue", operator: ">=", value: "30" }]
              },
              children: [
                {
                  key: "100210",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest Body mass index ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "1002100",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1002101",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1002102",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1002103",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1002104",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100211",
                  label: "numericValue >= 30",
                  type: "where",
                  data: { description: "numericValue >= 30", id: "numericValue", operator: ">=", value: "30" },
                  children: []
                }
              ]
            },
            {
              key: "10022",
              label: "concept from",
              type: "where",
              data: {
                description: "Olanzapine ....",
                id: "concept",
                in: [
                  { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                  { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                  { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                ]
              },
              children: [
                {
                  key: "100220",
                  label: "Olanzapine (substance)",
                  type: "where",
                  data: {
                    description: "Olanzapine ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                      { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                      { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100221",
                  label: "Olanzapine embonate monohydrate (substance)",
                  type: "where",
                  data: {
                    description: "Olanzapine ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                      { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                      { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100222",
                  label: "Clozapine (substance)",
                  type: "where",
                  data: {
                    description: "Olanzapine ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                      { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                      { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                    ]
                  },
                  children: []
                }
              ]
            },
            {
              key: "10023",
              label: "effectiveDate <= $referenceDate 6 (MONTH)",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "10024",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Body mass index ....",
                  id: "concept",
                  in: [
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                    { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [{ description: "numericValue >= 27.5", id: "numericValue", operator: ">=", value: "27.5" }]
              },
              children: [
                {
                  key: "100240",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest Body mass index ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                      { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "1002400",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1002401",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1002402",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1002403",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1002404",
                      label: "Body mass index (observable entity)",
                      type: "with",
                      data: {
                        description: "Latest Body mass index ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" },
                          { "@id": "http://snomed.info/sct#60621009", name: "Body mass index (observable entity)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100241",
                  label: "numericValue >= 27.5",
                  type: "where",
                  data: { description: "numericValue >= 27.5", id: "numericValue", operator: ">=", value: "27.5" },
                  children: []
                }
              ]
            },
            {
              key: "10025",
              label: "concept from",
              type: "where",
              data: {
                description: "Olanzapine ....",
                id: "concept",
                in: [
                  { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                  { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                  { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                ]
              },
              children: [
                {
                  key: "100250",
                  label: "Olanzapine (substance)",
                  type: "where",
                  data: {
                    description: "Olanzapine ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                      { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                      { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100251",
                  label: "Olanzapine embonate monohydrate (substance)",
                  type: "where",
                  data: {
                    description: "Olanzapine ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                      { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                      { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100252",
                  label: "Clozapine (substance)",
                  type: "where",
                  data: {
                    description: "Olanzapine ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#386849001", name: "Olanzapine (substance)" },
                      { "@id": "http://snomed.info/sct#725801000", name: "Olanzapine embonate monohydrate (substance)" },
                      { "@id": "http://snomed.info/sct#387568001", name: "Clozapine (substance)" }
                    ]
                  },
                  children: []
                }
              ]
            },
            {
              key: "10026",
              label: "effectiveDate <= $referenceDate 6 (MONTH)",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "10027",
              label: "observation",
              type: "where",
              data: {
                description: "Asian or chinese",
                id: "observation",
                where: [
                  {
                    description: "Indians (Hindi-speaking) ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#64483007", name: "Indians (Hindi-speaking) (ethnic group)" },
                      { "@id": "http://snomed.info/sct#81035008", name: "Pakistani (Urduspeakers) (ethnic group)" }
                    ]
                  }
                ]
              },
              children: [
                {
                  key: "100270",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "Indians (Hindi-speaking) ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#64483007", name: "Indians (Hindi-speaking) (ethnic group)" },
                      { "@id": "http://snomed.info/sct#81035008", name: "Pakistani (Urduspeakers) (ethnic group)" }
                    ]
                  },
                  children: [
                    {
                      key: "1002700",
                      label: "Indians (Hindi-speaking) (ethnic group)",
                      type: "where",
                      data: {
                        description: "Indians (Hindi-speaking) ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#64483007", name: "Indians (Hindi-speaking) (ethnic group)" },
                          { "@id": "http://snomed.info/sct#81035008", name: "Pakistani (Urduspeakers) (ethnic group)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1002701",
                      label: "Pakistani (Urduspeakers) (ethnic group)",
                      type: "where",
                      data: {
                        description: "Indians (Hindi-speaking) ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#64483007", name: "Indians (Hindi-speaking) (ethnic group)" },
                          { "@id": "http://snomed.info/sct#81035008", name: "Pakistani (Urduspeakers) (ethnic group)" }
                        ]
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              key: "10028",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                where: [
                  {
                    description: "concept is : Type 1 Diabetes",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:5a0192fd-27ea-4b30-8f8d-db17ab89284a", name: "Type 1 Diabetes" }]
                  }
                ]
              },
              children: [
                {
                  key: "100280",
                  label: "concept: Type 1 Diabetes",
                  type: "where",
                  data: {
                    description: "concept is : Type 1 Diabetes",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:5a0192fd-27ea-4b30-8f8d-db17ab89284a", name: "Type 1 Diabetes" }]
                  },
                  children: []
                }
              ]
            },
            {
              key: "10029",
              label: "age >= 18 (YEAR)",
              type: "where",
              data: { description: "Age years >18", id: "age", operator: ">=", value: "18", unit: "YEAR" },
              children: []
            },
            {
              key: "10030",
              label: "concept from",
              type: "where",
              data: {
                description: "Atorvastatin ....",
                id: "concept",
                in: [
                  { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                  { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                  { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                  { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                  { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                ]
              },
              children: [
                {
                  key: "100300",
                  label: "Atorvastatin (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100301",
                  label: "Rosuvastatin (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100302",
                  label: "Pravastatin sodium (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100303",
                  label: "Fluvastatin (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100304",
                  label: "Simvastatin (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                }
              ]
            },
            {
              key: "10031",
              label: "effectiveDate <= $referenceDate 6 (MONTH)",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "10032",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest Diabetes mellitus without complication ....",
                  id: "concept",
                  in: [
                    { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                    { "@id": "http://snomed.info/sct#112991000000101", name: "Lipoatrophic diabetes mellitus without complication (disorder)" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "Diabetes mellitus without complication ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                      { "@id": "http://snomed.info/sct#11530004", name: "Brittle diabetes mellitus (finding)" }
                    ]
                  }
                ]
              },
              children: [
                {
                  key: "100320",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest Diabetes mellitus without complication ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                      { "@id": "http://snomed.info/sct#112991000000101", name: "Lipoatrophic diabetes mellitus without complication (disorder)" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "1003200",
                      label: "Diabetes mellitus without complication (disorder)",
                      type: "with",
                      data: {
                        description: "Latest Diabetes mellitus without complication ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                          { "@id": "http://snomed.info/sct#112991000000101", name: "Lipoatrophic diabetes mellitus without complication (disorder)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1003201",
                      label: "Lipoatrophic diabetes mellitus without complication (disorder)",
                      type: "with",
                      data: {
                        description: "Latest Diabetes mellitus without complication ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                          { "@id": "http://snomed.info/sct#112991000000101", name: "Lipoatrophic diabetes mellitus without complication (disorder)" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100321",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "Diabetes mellitus without complication ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                      { "@id": "http://snomed.info/sct#11530004", name: "Brittle diabetes mellitus (finding)" }
                    ]
                  },
                  children: [
                    {
                      key: "1003210",
                      label: "Diabetes mellitus without complication (disorder)",
                      type: "where",
                      data: {
                        description: "Diabetes mellitus without complication ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                          { "@id": "http://snomed.info/sct#11530004", name: "Brittle diabetes mellitus (finding)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1003211",
                      label: "Brittle diabetes mellitus (finding)",
                      type: "where",
                      data: {
                        description: "Diabetes mellitus without complication ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#111552007", name: "Diabetes mellitus without complication (disorder)" },
                          { "@id": "http://snomed.info/sct#11530004", name: "Brittle diabetes mellitus (finding)" }
                        ]
                      },
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              key: "10033",
              label: "age >= 40 (YEAR)",
              type: "where",
              data: { description: "Age years >40", id: "age", operator: ">=", value: "40", unit: "YEAR" },
              children: []
            },
            {
              key: "10034",
              label: "concept from",
              type: "where",
              data: {
                description: "Atorvastatin ....",
                id: "concept",
                in: [
                  { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                  { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                  { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                  { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                  { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                ]
              },
              children: [
                {
                  key: "100340",
                  label: "Atorvastatin (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100341",
                  label: "Rosuvastatin (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100342",
                  label: "Pravastatin sodium (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100343",
                  label: "Fluvastatin (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                },
                {
                  key: "100344",
                  label: "Simvastatin (substance)",
                  type: "where",
                  data: {
                    description: "Atorvastatin ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#373444002", name: "Atorvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#700067006", name: "Rosuvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#96306007", name: "Pravastatin sodium (substance)" },
                      { "@id": "http://snomed.info/sct#387585004", name: "Fluvastatin (substance)" },
                      { "@id": "http://snomed.info/sct#387584000", name: "Simvastatin (substance)" }
                    ]
                  },
                  children: []
                }
              ]
            },
            {
              key: "10035",
              label: "effectiveDate <= $referenceDate 6 (MONTH)",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "10036",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                with: {
                  description: "Latest null",
                  id: "concept",
                  in: [
                    { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                    { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                  ],
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  }
                ]
              },
              children: [
                {
                  key: "100360",
                  label: "Latest concept from",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "1003600",
                      label: "Hypertension",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "1003601",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100361",
                  label: "concept: Hypertension",
                  type: "where",
                  data: {
                    description: "concept is : Hypertension",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Hypertension" }]
                  },
                  children: []
                }
              ]
            },
            {
              key: "10037",
              label: "not",
              type: "where",
              data: {
                description: "not = ",
                bool: "not",
                where: [
                  {
                    description: "No blood pressure in the last 18 months",
                    id: "observation",
                    bool: "and",
                    where: [
                      {
                        description: "SAP - Systolic arterial pressure ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                        ]
                      },
                      { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" }
                    ]
                  }
                ]
              },
              children: [
                {
                  key: "100370",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "SAP - Systolic arterial pressure ....",
                    id: "concept",
                    in: [
                      { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                      { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                    ]
                  },
                  children: [
                    {
                      key: "1003700",
                      label: "Systolic blood pressure (observable entity)",
                      type: "where",
                      data: {
                        description: "SAP - Systolic arterial pressure ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                        ]
                      },
                      children: []
                    },
                    {
                      key: "1003701",
                      label: "Systolic blood pressure (observable entity)",
                      type: "where",
                      data: {
                        description: "SAP - Systolic arterial pressure ....",
                        id: "concept",
                        in: [
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" },
                          { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure (observable entity)" }
                        ]
                      },
                      children: []
                    }
                  ]
                },
                {
                  key: "100371",
                  label: "effectiveDate <= $referenceDate 18 (MONTH)",
                  type: "where",
                  data: { id: "effectiveDate", operator: "<=", value: "18", unit: "MONTH", relativeTo: "$referenceDate" },
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const Aged1664 = {
  definition: {
    from: {
      "@id": "urn:uuid:a39c5aba-eed4-477b-bce2-3eeeb720a3ad",
      name: "Currently Registered Patients Aged 16+",
      sourceType: "set",
      description: "Currently Registered Patients Aged 16+",
      where: {
        where: [
          {
            description: "age from >= 16 YEARto > 65 YEAR",
            id: "age",
            range: {
              from: {
                operator: ">=",
                value: "16",
                unit: "YEAR",
                relativeTo: null
              },
              to: {
                operator: ">",
                value: "65",
                unit: "YEAR",
                relativeTo: null
              }
            }
          }
        ]
      }
    }
  },
  nodes: [
    {
      key: "10",
      label: "Currently Registered Patients Aged 16+",
      type: "query",
      data: {
        "@id": "urn:uuid:a39c5aba-eed4-477b-bce2-3eeeb720a3ad",
        name: "Currently Registered Patients Aged 16+",
        sourceType: "set",
        description: "Currently Registered Patients Aged 16+",
        where: {
          where: [
            {
              description: "age from >= 16 YEARto > 65 YEAR",
              id: "age",
              range: {
                from: { operator: ">=", value: "16", unit: "YEAR", relativeTo: null },
                to: { operator: ">", value: "65", unit: "YEAR", relativeTo: null }
              }
            }
          ]
        }
      },
      children: [
        {
          key: "100",
          label: "age  from >= 16 (YEAR) to >= 16 (YEAR)",
          type: "where",
          data: {
            description: "age from >= 16 YEARto > 65 YEAR",
            id: "age",
            range: { from: { operator: ">=", value: "16", unit: "YEAR", relativeTo: null }, to: { operator: ">", value: "65", unit: "YEAR", relativeTo: null } }
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
    from: {
      where: {
        bool: "and",
        where: [
          {
            "@id": "http://www.w3.org/2000/01/rdf-schema#domain",
            in: [
              {
                includeSupertypes: true,
                variable: "$this"
              }
            ]
          },
          {
            "@id": "http://endhealth.info/im#scheme",
            in: [
              {
                "@id": "http://endhealth.info/im#"
              },
              {
                "@id": "http://snomed.info/sct#"
              }
            ]
          }
        ]
      }
    },
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
      label: "Allowable Properties for a concept",
      type: "query",
      data: {
        name: "Allowable Properties for a concept",
        description: "'using property domains get the allowable properties from the supertypes of this concept",
        from: {
          where: {
            bool: "and",
            where: [
              { "@id": "http://www.w3.org/2000/01/rdf-schema#domain", in: [{ includeSupertypes: true, variable: "$this" }] },
              { "@id": "http://endhealth.info/im#scheme", in: [{ "@id": "http://endhealth.info/im#" }, { "@id": "http://snomed.info/sct#" }] }
            ]
          }
        },
        select: [{ "@id": "http://endhealth.info/im#code" }, { "@id": "http://www.w3.org/2000/01/rdf-schema#label" }],
        activeOnly: true
      },
      children: [
        {
          key: "100",
          label: "domain",
          type: "from",
          data: { "@id": "http://www.w3.org/2000/01/rdf-schema#domain", in: [{ includeSupertypes: true, variable: "$this" }] },
          children: [{ key: "1000", label: "$this", type: "in", data: { includeSupertypes: true, variable: "$this" }, children: [] }]
        },
        {
          key: "101",
          label: "scheme",
          type: "from",
          data: { "@id": "http://endhealth.info/im#scheme", in: [{ "@id": "http://endhealth.info/im#" }, { "@id": "http://snomed.info/sct#" }] },
          children: [
            { key: "1010", label: "http://endhealth.info/im", type: "in", data: { "@id": "http://endhealth.info/im#" }, children: [] },
            { key: "1011", label: "http://snomed.info/sct", type: "in", data: { "@id": "http://snomed.info/sct#" }, children: [] }
          ]
        },
        {
          key: "102",
          label: "select",
          type: "select",
          data: [{ "@id": "http://endhealth.info/im#code" }, { "@id": "http://www.w3.org/2000/01/rdf-schema#label" }],
          children: [
            { key: "1020", label: "code", type: "select", data: { "@id": "http://endhealth.info/im#code" }, children: [] },
            { key: "1021", label: "label", type: "select", data: { "@id": "http://www.w3.org/2000/01/rdf-schema#label" }, children: [] }
          ]
        }
      ]
    }
  ]
};
