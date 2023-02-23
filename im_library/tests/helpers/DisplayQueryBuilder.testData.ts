export const Q_RegisteredGMS = {
  definition: {
    "@id": "http://endhealth.info/im#Q_RegisteredGMS",
    name: "Patients registered for GMS services on the reference date",
    description: "For any registration period,a registration start date before the reference date and no end date,or an end date after the reference date.",
    from: {
      name: "Patient",
      "@type": "http://endhealth.info/im#Patient",
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
          name: "Patient",
          "@type": "http://endhealth.info/im#Patient",
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
        {
          key: "100",
          label: "Patient",
          type: "from",
          data: {
            name: "Patient",
            "@type": "http://endhealth.info/im#Patient",
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
          },
          children: [
            {
              key: "1000",
              label: "gpRegistration",
              type: "where",
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
                  key: "10000",
                  label: "patientType: Regular GMS patient",
                  type: "where",
                  data: { id: "patientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] },
                  children: []
                },
                {
                  key: "10001",
                  label: "effectiveDate <= $referenceDate",
                  type: "where",
                  data: { id: "effectiveDate", operator: "<=", relativeTo: "$referenceDate" },
                  children: []
                },
                {
                  key: "10002",
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
                    { key: "100020", label: "endDate does not exist", type: "where", data: { notExist: true, id: "endDate" }, children: [] },
                    {
                      key: "100021",
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
    }
  ]
};

export const SMIPopulation = {
  definition: {
    from: {
      name: "Registered with GP for GMS services on the reference date",
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
                ],
                valueLabel: "GMSpatient"
              }
            ]
          },
          {
            description: "age >= 18 YEAR",
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
                  name: "Unknown code set"
                },
                {
                  "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
                  name: "Unknown code set"
                }
              ],
              valueLabel: "SMI",
              latest: "effectiveDate",
              count: 1
            },
            where: [
              {
                description: "concept is : Unknown code set",
                id: "concept",
                in: [
                  {
                    "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
                    name: "Unknown code set"
                  }
                ],
                valueLabel: "SMI"
              }
            ]
          }
        ]
      },
      "@set": "http://endhealth.info/im#Q_RegisteredGMS"
    }
  },
  nodes: [
    {
      key: "10",
      label: "Registered with GP for GMS services on the reference date",
      type: "query",
      data: {
        name: "Registered with GP for GMS services on the reference date",
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
                  in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }],
                  valueLabel: "GMSpatient"
                }
              ]
            },
            { description: "age >= 18 YEAR", id: "age", operator: ">=", value: "18", unit: "YEAR" },
            {
              description: "observation",
              id: "observation",
              with: {
                description: "Latest null",
                id: "concept",
                in: [
                  { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "Unknown code set" },
                  { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "Unknown code set" }
                ],
                valueLabel: "SMI",
                latest: "effectiveDate",
                count: 1
              },
              where: [
                {
                  description: "concept is : Unknown code set",
                  id: "concept",
                  in: [{ "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "Unknown code set" }],
                  valueLabel: "SMI"
                }
              ]
            }
          ]
        },
        "@set": "http://endhealth.info/im#Q_RegisteredGMS"
      },
      children: [
        {
          key: "100",
          label: "gpCurrentRegistration",
          type: "where",
          data: {
            description: "gpCurrentRegistration",
            id: "gpCurrentRegistration",
            where: [
              {
                description: "GMSpatient",
                id: "gpPatientType",
                in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }],
                valueLabel: "GMSpatient"
              }
            ]
          },
          children: [
            {
              key: "1000",
              label: "gpPatientType: GMSpatient",
              type: "where",
              data: {
                description: "GMSpatient",
                id: "gpPatientType",
                in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }],
                valueLabel: "GMSpatient"
              },
              children: []
            }
          ]
        },
        {
          key: "101",
          label: "age >= 18 (YEAR)",
          type: "where",
          data: { description: "age >= 18 YEAR", id: "age", operator: ">=", value: "18", unit: "YEAR" },
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
                { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "Unknown code set" },
                { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "Unknown code set" }
              ],
              valueLabel: "SMI",
              latest: "effectiveDate",
              count: 1
            },
            where: [
              {
                description: "concept is : Unknown code set",
                id: "concept",
                in: [{ "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "Unknown code set" }],
                valueLabel: "SMI"
              }
            ]
          },
          children: [
            {
              key: "1020",
              label: "Latest concept: SMI (expand to see more...)",
              type: "with",
              data: {
                description: "Latest null",
                id: "concept",
                in: [
                  { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "Unknown code set" },
                  { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "Unknown code set" }
                ],
                valueLabel: "SMI",
                latest: "effectiveDate",
                count: 1
              },
              children: [
                {
                  key: "10200",
                  label: "Unknown code set",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "Unknown code set" },
                      { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "Unknown code set" }
                    ],
                    valueLabel: "SMI",
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: []
                },
                {
                  key: "10201",
                  label: "Unknown code set",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "Unknown code set" },
                      { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "Unknown code set" }
                    ],
                    valueLabel: "SMI",
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
              data: {
                description: "concept is : Unknown code set",
                id: "concept",
                in: [{ "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "Unknown code set" }],
                valueLabel: "SMI"
              },
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
      name: "SMI Population",
      where: {
        bool: "and",
        where: [
          {
            description: " is : Priority 1not = ",
            bool: "not",
            in: [
              {
                name: "Priority 1",
                "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97"
              }
            ]
          },
          {
            description: " is : Priority 2not = ",
            bool: "not",
            in: [
              {
                name: "Priority 2",
                "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd"
              }
            ]
          },
          {
            description: " is : Priority 3anot = ",
            bool: "not",
            in: [
              {
                name: "Priority 3a",
                "@set": "urn:uuid:6d4abdbb-d278-4675-a98d-c340967daee6"
              }
            ]
          }
        ]
      },
      "@set": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf"
    }
  },
  nodes: [
    {
      key: "10",
      label: "SMI Population",
      type: "query",
      data: {
        name: "SMI Population",
        where: {
          bool: "and",
          where: [
            { description: " is : Priority 1not = ", bool: "not", in: [{ name: "Priority 1", "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97" }] },
            { description: " is : Priority 2not = ", bool: "not", in: [{ name: "Priority 2", "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd" }] },
            { description: " is : Priority 3anot = ", bool: "not", in: [{ name: "Priority 3a", "@set": "urn:uuid:6d4abdbb-d278-4675-a98d-c340967daee6" }] }
          ]
        },
        "@set": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf"
      },
      children: [
        {
          key: "100",
          label: "Not from: Priority 1",
          type: "where",
          data: { description: " is : Priority 1not = ", bool: "not", in: [{ name: "Priority 1", "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97" }] },
          children: []
        },
        {
          key: "101",
          label: "Not from: Priority 2",
          type: "where",
          data: { description: " is : Priority 2not = ", bool: "not", in: [{ name: "Priority 2", "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd" }] },
          children: []
        },
        {
          key: "102",
          label: "Not from: Priority 3a",
          type: "where",
          data: { description: " is : Priority 3anot = ", bool: "not", in: [{ name: "Priority 3a", "@set": "urn:uuid:6d4abdbb-d278-4675-a98d-c340967daee6" }] },
          children: []
        }
      ]
    }
  ]
};

export const Priority3a = {
  definition: {
    from: {
      name: "SMI Population",
      where: {
        bool: "and",
        where: [
          {
            description: " is : Priority 1not = ",
            bool: "not",
            in: [
              {
                name: "Priority 1",
                "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97"
              }
            ]
          },
          {
            description: " is : Priority 2not = ",
            bool: "not",
            in: [
              {
                name: "Priority 2",
                "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd"
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
                          name: "Unknown code set"
                        },
                        {
                          "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d",
                          name: "Unknown code set"
                        }
                      ],
                      valueLabel: "Hypertension",
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Unknown code set",
                        id: "concept",
                        in: [
                          {
                            "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f",
                            name: "Unknown code set"
                          }
                        ],
                        valueLabel: "Hypertension"
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
                          name: "Unknown code set"
                        },
                        {
                          "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d",
                          name: "Unknown code set"
                        }
                      ],
                      valueLabel: "Diabetes (resovled)",
                      latest: "effectiveDate",
                      count: 1
                    },
                    where: [
                      {
                        description: "concept is : Unknown code set",
                        id: "concept",
                        in: [
                          {
                            "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95",
                            name: "Unknown code set"
                          }
                        ],
                        valueLabel: "Diabetes"
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
      },
      "@set": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf"
    }
  },
  nodes: [
    {
      key: "10",
      label: "SMI Population",
      type: "query",
      data: {
        name: "SMI Population",
        where: {
          bool: "and",
          where: [
            { description: " is : Priority 1not = ", bool: "not", in: [{ name: "Priority 1", "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97" }] },
            { description: " is : Priority 2not = ", bool: "not", in: [{ name: "Priority 2", "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd" }] },
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
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        valueLabel: "Hypertension",
                        latest: "effectiveDate",
                        count: 1
                      },
                      where: [
                        {
                          description: "concept is : Unknown code set",
                          id: "concept",
                          in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" }],
                          valueLabel: "Hypertension"
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
                          { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" },
                          { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Unknown code set" }
                        ],
                        valueLabel: "Diabetes (resovled)",
                        latest: "effectiveDate",
                        count: 1
                      },
                      where: [
                        {
                          description: "concept is : Unknown code set",
                          id: "concept",
                          in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" }],
                          valueLabel: "Diabetes"
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
        },
        "@set": "urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf"
      },
      children: [
        {
          key: "100",
          label: "Not from: Priority 1",
          type: "where",
          data: { description: " is : Priority 1not = ", bool: "not", in: [{ name: "Priority 1", "@set": "urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97" }] },
          children: []
        },
        {
          key: "101",
          label: "Not from: Priority 2",
          type: "where",
          data: { description: " is : Priority 2not = ", bool: "not", in: [{ name: "Priority 2", "@set": "urn:uuid:fe469cf2-84f3-4b03-a2f5-96223ae78dfd" }] },
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
                    { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" },
                    { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                  ],
                  valueLabel: "Hypertension",
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Unknown code set",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" }],
                    valueLabel: "Hypertension"
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
                    { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" },
                    { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Unknown code set" }
                  ],
                  valueLabel: "Diabetes (resovled)",
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Unknown code set",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" }],
                    valueLabel: "Diabetes"
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
                    { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" },
                    { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                  ],
                  valueLabel: "Hypertension",
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Unknown code set",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" }],
                    valueLabel: "Hypertension"
                  }
                ]
              },
              children: [
                {
                  key: "10200",
                  label: "Latest concept: Hypertension (expand to see more...)",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" },
                      { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                    ],
                    valueLabel: "Hypertension",
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "102000",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        valueLabel: "Hypertension",
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
                          { "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" },
                          { "@id": "urn:uuid:aafda1f0-02fc-45bc-bd6f-b899efe9547d", name: "Unknown code set" }
                        ],
                        valueLabel: "Hypertension",
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
                    description: "concept is : Unknown code set",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:be880ad6-5dab-48c2-8e94-d5c5219afb4f", name: "Unknown code set" }],
                    valueLabel: "Hypertension"
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
                    { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" },
                    { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Unknown code set" }
                  ],
                  valueLabel: "Diabetes (resovled)",
                  latest: "effectiveDate",
                  count: 1
                },
                where: [
                  {
                    description: "concept is : Unknown code set",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" }],
                    valueLabel: "Diabetes"
                  }
                ]
              },
              children: [
                {
                  key: "10210",
                  label: "Latest concept: Diabetes (resovled) (expand to see more...)",
                  type: "with",
                  data: {
                    description: "Latest null",
                    id: "concept",
                    in: [
                      { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" },
                      { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Unknown code set" }
                    ],
                    valueLabel: "Diabetes (resovled)",
                    latest: "effectiveDate",
                    count: 1
                  },
                  children: [
                    {
                      key: "102100",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" },
                          { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Unknown code set" }
                        ],
                        valueLabel: "Diabetes (resovled)",
                        latest: "effectiveDate",
                        count: 1
                      },
                      children: []
                    },
                    {
                      key: "102101",
                      label: "Unknown code set",
                      type: "with",
                      data: {
                        description: "Latest null",
                        id: "concept",
                        in: [
                          { "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" },
                          { "@id": "urn:uuid:bd8458fb-abb7-469b-91e5-ce888b5b0f3d", name: "Unknown code set" }
                        ],
                        valueLabel: "Diabetes (resovled)",
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
                    description: "concept is : Unknown code set",
                    id: "concept",
                    in: [{ "@id": "urn:uuid:4ecec7ee-f42f-4418-acc3-ba4f16264c95", name: "Unknown code set" }],
                    valueLabel: "Diabetes"
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

export const Aged1664 = {
  definition: {
    from: {
      name: "Currently Registered Patients Aged 16+",
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
      },
      "@set": "urn:uuid:a39c5aba-eed4-477b-bce2-3eeeb720a3ad"
    }
  },
  nodes: [
    {
      key: "10",
      label: "Currently Registered Patients Aged 16+",
      type: "query",
      data: {
        "@set": "urn:uuid:a39c5aba-eed4-477b-bce2-3eeeb720a3ad",
        name: "Currently Registered Patients Aged 16+",

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
                ancestorsOf: true,
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
              { "@id": "http://www.w3.org/2000/01/rdf-schema#domain", in: [{ ancestorsOf: true, variable: "$this" }] },
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
          data: { "@id": "http://www.w3.org/2000/01/rdf-schema#domain", in: [{ ancestorsOf: true, variable: "$this" }] },
          children: [{ key: "1000", label: "$this", type: "in", data: { ancestorsOf: true, variable: "$this" }, children: [] }]
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
