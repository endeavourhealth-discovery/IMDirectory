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
      key: "2076391969573781",
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
        { key: "791019949762461", label: "Patient", type: "from", data: { "@id": "http://endhealth.info/im#Patient", name: "Patient" }, children: [] },
        {
          key: "5153442186026005",
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
              key: "4301009148889676",
              label: "patientType: Regular GMS patient",
              type: "where",
              data: { id: "patientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] },
              children: []
            },
            {
              key: "8910305546240540",
              label: "effectiveDate <= $referenceDate",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "6860816653985080",
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
                { key: "7737475101274405", label: "endDate does not exist", type: "where", data: { notExist: true, id: "endDate" }, children: [] },
                {
                  key: "9515292170108476",
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
      key: "2518717794724281",
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
            { description: "age >= 18 YEAR", id: "age", operator: ">=", value: "18", unit: "YEAR" },
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
          key: "4208238048958221",
          label: "gpCurrentRegistration",
          type: "where",
          data: {
            description: "gpCurrentRegistration",
            id: "gpCurrentRegistration",
            where: [{ description: "GMSpatient", id: "gpPatientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] }]
          },
          children: [
            {
              key: "2503353859435704",
              label: "gpPatientType: Regular GMS patient",
              type: "where",
              data: { description: "GMSpatient", id: "gpPatientType", in: [{ "@id": "http://endhealth.info/im#2751000252106", name: "Regular GMS patient" }] },
              children: []
            }
          ]
        },
        {
          key: "7463124490470951",
          label: "age >= 18 YEAR",
          type: "where",
          data: { description: "age >= 18 YEAR", id: "age", operator: ">=", value: "18", unit: "YEAR" },
          children: []
        },
        {
          key: "562813214267217",
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
              key: "9952266587084954",
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
                  key: "6707836196399335",
                  label: "SMIResolved",
                  type: "in",
                  data: { "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11", name: "SMIResolved" },
                  children: []
                },
                {
                  key: "4145910663853487",
                  label: "SMI",
                  type: "in",
                  data: { "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c", name: "SMI" },
                  children: []
                }
              ]
            },
            {
              key: "4365269757590935",
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
      key: "70863014801529",
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
          key: "5349441288444812",
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
          key: "9212627871708404",
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
          key: "6085963216196408",
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
      key: "6025289583147129",
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
                          description: "concept is : Unknown code set, , ,  .. ",
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
          key: "1893764191154638",
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
          key: "383656786719868",
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
          key: "4490652435292763",
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
                    description: "concept is : Unknown code set, , ,  .. ",
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
              key: "467585850852196",
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
                  key: "8746969284869814",
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
                      key: "5991020562557241",
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
                      key: "3046009593100842",
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
                  key: "5354769666191319",
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
              key: "5736238165812915",
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
                  key: "4892743111361078",
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
                      key: "6207352212820845",
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
                      key: "6936147595867614",
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
                  key: "7734938755085778",
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
              key: "2514171860236080",
              label: "observation",
              type: "where",
              data: {
                description: "observation",
                id: "observation",
                where: [
                  {
                    description: "concept is : Unknown code set, , ,  .. ",
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
                  key: "9279119278447774",
                  label: "concept from",
                  type: "where",
                  data: {
                    description: "concept is : Unknown code set, , ,  .. ",
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
                      key: "9577577528407974",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , ,  .. ",
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
                      key: "6887890887160875",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , ,  .. ",
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
                      key: "7058234148627389",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , ,  .. ",
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
                      key: "2838223335788430",
                      label: "Unknown code set",
                      type: "where",
                      data: {
                        description: "concept is : Unknown code set, , ,  .. ",
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
              key: "8267649634488181",
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
                  key: "8862395854350744",
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
                      key: "1164891927408178",
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
                      key: "7877986685488689",
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
              key: "6778185935599963",
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
                  key: "5579116246586966",
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
                      key: "8019516384709777",
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
                      key: "1563920283635349",
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
                      key: "5392144244624111",
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
                      key: "2403099087607079",
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
                      key: "1842143054345164",
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
                  key: "9801788219495968",
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
      key: "5094566248259162",
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
          key: "4115916485722131",
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
              key: "2604970529686523",
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
                  key: "8668500138884003",
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
                      key: "3388639436917111",
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
                      key: "8146232794338988",
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
                  key: "2846418390597986",
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
              key: "6298828390811435",
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
                  key: "283352056845047",
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
                  key: "4548526790196308",
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
              key: "4340471160472798",
              label: "numericValue >= 140",
              type: "where",
              data: { description: "numericValue >= 140", id: "numericValue", operator: ">=", value: "140" },
              children: []
            },
            {
              key: "1280195990864729",
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
                  key: "4856955053091936",
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
                      key: "7653823641073350",
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
                      key: "3880734280647502",
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
                  key: "9623445677365820",
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
              key: "8876631810442124",
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
                  key: "5960570042787610",
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
                  key: "7318607275116271",
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
              key: "3887759746481536",
              label: "numericValue >= 90",
              type: "where",
              data: { description: "numericValue >= 90", id: "numericValue", operator: ">=", value: "90" },
              children: []
            },
            {
              key: "5402809765989631",
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
                  key: "2572122402813597",
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
                      key: "6495705162475853",
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
                      key: "786406936591783",
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
                  key: "1918362991272959",
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
              key: "7856066134417408",
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
                  key: "3880397804737459",
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
                  key: "2310269556179558",
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
              key: "9838735627364014",
              label: "numericValue >= 135",
              type: "where",
              data: { description: "numericValue >= 135", id: "numericValue", operator: ">=", value: "135" },
              children: []
            },
            {
              key: "9930287892001696",
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
                  key: "4241470589711662",
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
                      key: "55499765007080",
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
                      key: "8551987069970748",
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
                  key: "2205152381033490",
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
              key: "7746552400392206",
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
                  key: "6153815256943345",
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
                  key: "8510779325801",
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
                  key: "6195490374901216",
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
                  key: "5062148716424557",
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
                  key: "4193821495012417",
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
                  key: "3022881334933975",
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
                  key: "8650512673440101",
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
              key: "2047079375311951",
              label: "numericValue >= 85",
              type: "where",
              data: { description: "numericValue >= 85", id: "numericValue", operator: ">=", value: "85" },
              children: []
            },
            {
              key: "2745939117739864",
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
                  key: "290949891178369",
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
                      key: "9859586643849832",
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
                      key: "1176518076301669",
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
                  key: "3664438425159271",
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
              key: "508193144695625",
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
                  key: "445077846121164",
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
                      key: "3614695495632933",
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
                      key: "7990121372890600",
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
                      key: "3142237367391387",
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
                  key: "4562544711836909",
                  label: "numericValue >= 59",
                  type: "where",
                  data: { description: "numericValue >= 59", id: "numericValue", operator: ">=", value: "59" },
                  children: []
                }
              ]
            },
            {
              key: "6539726871254961",
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
                  key: "8761176112721023",
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
                      key: "3279509045764051",
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
                      key: "2744480276676857",
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
                  key: "2541997826876396",
                  label: "numericValue >= 10",
                  type: "where",
                  data: { description: "numericValue >= 10", id: "numericValue", operator: ">=", value: "10" },
                  children: []
                }
              ]
            },
            {
              key: "9336233028751128",
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
                  key: "8672730252567267",
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
                      key: "1406598189026173",
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
                      key: "166653386613846",
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
                  key: "3453776203912113",
                  label: "effectiveDate <= $referenceDate by 6 MONTH",
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
              key: "3582173621299134",
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
                  key: "4834800325840116",
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
                      key: "5670650831203241",
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
                      key: "2639314725511465",
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
                      key: "9868047452282208",
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
                      key: "6740695328948232",
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
              key: "5292799283891294",
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
                  key: "5965726018364363",
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
                      key: "8836928596713771",
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
                      key: "8631211102273728",
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
                  key: "1915315463049436",
                  label: "effectiveDate <= $referenceDate by 6 MONTH",
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
              key: "7989311374167434",
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
                  key: "5120565288683161",
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
                      key: "9861259106009626",
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
                      key: "2793483999116857",
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
                  key: "519319431531042",
                  label: "concept: AF",
                  type: "where",
                  data: { description: "concept is : AF", id: "concept", in: [{ "@id": "urn:uuid:8717d642-5703-444d-8985-de8e5d1a3a06", name: "AF" }] },
                  children: []
                }
              ]
            },
            {
              key: "3911584834183523",
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
                  key: "7170774782931071",
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
                  key: "3396896744472648",
                  label: "numericValue >= 2",
                  type: "where",
                  data: { description: "numericValue >= 2", id: "numericValue", operator: ">=", value: "2" },
                  children: []
                }
              ]
            },
            {
              key: "1321544352452659",
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
                  key: "1331775585257426",
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
                      key: "9925687303107880",
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
                      key: "6687981445450326",
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
                      key: "4737014977327756",
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
                      key: "682706548988965",
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
                      key: "2341227921749818",
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
                      key: "5858771500230169",
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
                      key: "9221526691709872",
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
                      key: "6455393865109367",
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
                  key: "4487710277074923",
                  label: "effectiveDate <= $referenceDate by 6 MONTH",
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
              key: "6808202834416686",
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
                  key: "5976335128479522",
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
                      key: "2434216779152440",
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
                      key: "9097462065020874",
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
                      key: "7269002705062007",
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
                      key: "6050445773127571",
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
                      key: "5761881710260499",
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
                  key: "2552273609684543",
                  label: "numericValue >= 30",
                  type: "where",
                  data: { description: "numericValue >= 30", id: "numericValue", operator: ">=", value: "30" },
                  children: []
                }
              ]
            },
            {
              key: "2241439724868097",
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
                  key: "6811913057851695",
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
                  key: "2787717358990877",
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
                  key: "9819340791425804",
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
              key: "37977382401155",
              label: "effectiveDate <= $referenceDate by 6 MONTH",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "5669543048051953",
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
                  key: "3763958148196629",
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
                      key: "5229514188118818",
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
                      key: "4574719148946458",
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
                      key: "5546347484927829",
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
                      key: "3408830983754201",
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
                      key: "1512069683767909",
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
                  key: "5583829875167059",
                  label: "numericValue >= 27.5",
                  type: "where",
                  data: { description: "numericValue >= 27.5", id: "numericValue", operator: ">=", value: "27.5" },
                  children: []
                }
              ]
            },
            {
              key: "8068647863287082",
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
                  key: "6849007528091482",
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
                  key: "3271986479384003",
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
                  key: "7325357529660252",
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
              key: "2665609924463277",
              label: "effectiveDate <= $referenceDate by 6 MONTH",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "15777124800415",
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
                  key: "2396121622229636",
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
                      key: "9028161588043398",
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
                      key: "232236235030574",
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
              key: "5601379189362037",
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
                  key: "7769888995611791",
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
              key: "9528644952866170",
              label: "age >= 18 YEAR",
              type: "where",
              data: { description: "Age years >18", id: "age", operator: ">=", value: "18", unit: "YEAR" },
              children: []
            },
            {
              key: "6138758250176437",
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
                  key: "6984416078871394",
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
                  key: "8858812810557073",
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
                  key: "6342936690875118",
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
                  key: "7047553010106349",
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
                  key: "2809725189110672",
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
              key: "5116885236811475",
              label: "effectiveDate <= $referenceDate by 6 MONTH",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "394084225501774",
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
                  key: "4503114203388418",
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
                      key: "8019431476080405",
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
                      key: "6277097606697990",
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
                  key: "6688924761275248",
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
                      key: "9017472180239388",
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
                      key: "1777192804061822",
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
              key: "454926192813278",
              label: "age >= 40 YEAR",
              type: "where",
              data: { description: "Age years >40", id: "age", operator: ">=", value: "40", unit: "YEAR" },
              children: []
            },
            {
              key: "1046941560185410",
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
                  key: "6850592782872709",
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
                  key: "8941650769073515",
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
                  key: "5631382296014462",
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
                  key: "6495184686632380",
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
                  key: "9375918835450712",
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
              key: "1022196171905538",
              label: "effectiveDate <= $referenceDate by 6 MONTH",
              type: "where",
              data: { id: "effectiveDate", operator: "<=", value: "6", unit: "MONTH", relativeTo: "$referenceDate" },
              children: []
            },
            {
              key: "9399442796371900",
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
                  key: "2662067034639970",
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
                      key: "8050519798736657",
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
                      key: "1399150685770238",
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
                  key: "4906086401868663",
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
              key: "2846560583400999",
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
                  key: "3874043628662424",
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
                      key: "3196089836458751",
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
                      key: "9197130024246896",
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
                  key: "3239869961166304",
                  label: "effectiveDate <= $referenceDate by 18 MONTH",
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
