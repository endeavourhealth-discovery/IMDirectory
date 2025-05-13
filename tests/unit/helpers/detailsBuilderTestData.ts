export const hasDefinition = {
  entityBundle: {
    entity: {
      iri: "http://endhealth.info/im#CSET_Covid5",
      "http://endhealth.info/im#isContainedIn": [
        {
          iri: "http://endhealth.info/im#CSET_Covid0",
          name: "Covid related value sets (Query Value Set)"
        }
      ],
      "http://endhealth.info/im#scheme": [
        {
          iri: "http://endhealth.info/im#",
          name: "Endeavour code scheme and graph"
        }
      ],
      "http://endhealth.info/im#definition":
        '{"match":[{"match":[{"name":"Telephone consultation for suspected severe acute respiratory syndrome coronavirus 2 (procedure)","instanceOf":{iri:"http://snomed.info/sct#1240451000000106","descendantsOrSelfOf":true}},{"name":"Educated about severe acute respiratory syndrome coronavirus 2 infection (situation)","instanceOf":{iri:"http://snomed.info/sct#1240711000000104","descendantsOrSelfOf":true}},{"name":"Advice given about severe acute respiratory syndrome coronavirus 2 infection (situation)","instanceOf":{iri:"http://snomed.info/sct#1240721000000105","descendantsOrSelfOf":true}},{"name":"Advice given about severe acute respiratory syndrome coronavirus 2 by telephone (situation)","instanceOf":{iri:"http://snomed.info/sct#1240731000000107","descendantsOrSelfOf":true}},{"name":"Provision of advice, assessment or treatment limited due to coronavirus disease 19 caused by severe acute respiratory syndrome coronavirus 2 pandemic (situation)","instanceOf":{iri:"http://snomed.info/sct#1321171000000106","descendantsOrSelfOf":true}}],"bool":"or"}]}'
    },
    predicates: {
      "http://endhealth.info/im#": "Endeavour code scheme and graph",
      "http://endhealth.info/im#CSET_Covid0": "Covid related value sets (Query Value Set)",
      "http://endhealth.info/im#isContainedIn": "is contained in",
      "http://endhealth.info/im#ConceptSet": "Value Set (for query)",
      "http://endhealth.info/im#scheme": "scheme",
      "http://endhealth.info/im#definition": "definition",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type"
    }
  },
  details: [
    {
      key: "http://endhealth.info/im#isContainedIn",
      label: "is contained in",
      children: [
        {
          key: "http://endhealth.info/im#CSET_Covid0",
          label: "Covid related value sets (Query Value Set)",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#scheme",
      label: "scheme",
      children: [
        {
          key: "http://endhealth.info/im#",
          label: "Endeavour code scheme and graph",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#definition",
      label: "definition"
    }
  ]
};

export const hasMultiplePredicates = {
  entityBundle: {
    entity: {
      iri: "http://snomed.info/sct#405746006",
      "http://endhealth.info/im#isA": [
        { iri: "http://snomed.info/sct#416578004", name: "Mental and psychological observations (finding)" },
        { iri: "http://snomed.info/sct#186411000000102", name: "Mental and psychological observations" },
        { iri: "http://snomed.info/sct#189851000000107", name: "Mental and psychological observations" },
        { iri: "http://snomed.info/sct#404684003", name: "Clinical finding (finding)" },
        { iri: "http://snomed.info/sct#282278008", name: "Additional behavior finding (finding)" },
        { iri: "http://snomed.info/sct#844005", name: "Behavior finding (finding)" },
        {
          iri: "http://snomed.info/sct#384821006",
          name: "Mental state, behavior and/or psychosocial function finding (finding)"
        },
        { iri: "http://snomed.info/sct#365949003", name: "Health-related behavior finding (finding)" },
        { iri: "http://snomed.info/sct#8392000", name: "Non-smoker (finding)" },
        { iri: "http://snomed.info/sct#316231000", name: "[V]Tobacco use (situation)" },
        { iri: "http://snomed.info/sct#399791000000101", name: "[V]Tobacco use (context-dependent category)" },
        { iri: "http://snomed.info/sct#365981007", name: "Finding of tobacco smoking behavior (finding)" },
        { iri: "http://snomed.info/sct#160618006", name: "Current non-smoker (finding)" },
        { iri: "http://snomed.info/sct#365980008", name: "Finding of tobacco use and exposure (finding)" },
        {
          iri: "http://snomed.info/sct#405746006",
          name: "Current non smoker but past smoking history unknown (finding)"
        }
      ],
      "http://endhealth.info/im#im1Id": "SN_405746006",
      "http://endhealth.info/im#usuallySubsumedBy": [
        { iri: "http://snomed.info/sct#282278008", name: "Additional behavior finding (finding)" },
        { iri: "http://snomed.info/sct#316231000", name: "[V]Tobacco use (situation)" },
        { iri: "http://snomed.info/sct#399791000000101", name: "[V]Tobacco use (context-dependent category)" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
        {
          iri: "http://snomed.info/sct#8392000",
          name: "Non-smoker (finding)"
        }
      ],
      "http://endhealth.info/im#roleGroup": [
        {
          "http://endhealth.info/im#groupNumber": 1,
          "http://snomed.info/sct#363714003": [
            {
              iri: "http://snomed.info/sct#229819007",
              name: "Tobacco use and exposure (observable entity)"
            }
          ]
        }
      ],
      "http://endhealth.info/im#multipleSubsumedBy": [
        { iri: "http://snomed.info/sct#416578004", name: "Mental and psychological observations (finding)" },
        { iri: "http://snomed.info/sct#186411000000102", name: "Mental and psychological observations" },
        { iri: "http://snomed.info/sct#189851000000107", name: "Mental and psychological observations" }
      ],
      "http://endhealth.info/im#scheme": [
        {
          iri: "http://snomed.info/sct#",
          name: "Snomed-CT code scheme and graph"
        }
      ],
      "http://endhealth.info/im#hasTermCode": [
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "Current non smoker but past smoking history unknown (finding)",
          "http://endhealth.info/im#status": [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
          "http://endhealth.info/im#code": "2149576018"
        },
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "Current non smoker but past smoking history unknown",
          "http://endhealth.info/im#status": [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
          "http://endhealth.info/im#code": "2157522017"
        }
      ],
      "http://endhealth.info/im#subsumedBy": [
        {
          iri: "http://snomed.info/sct#160618006",
          name: "Current non-smoker (finding)"
        }
      ]
    },
    predicates: {
      "http://endhealth.info/im#subsumedBy": "subsumed by",
      "http://endhealth.info/im#code": "code",
      "http://endhealth.info/im#im1Id": "im1 id",
      "http://snomed.info/sct#399791000000101": "[V]Tobacco use (context-dependent category)",
      "http://snomed.info/sct#844005": "Behavior finding (finding)",
      "http://endhealth.info/im#Concept": "Terminology concept",
      "http://snomed.info/sct#160618006": "Current non-smoker (finding)",
      "http://endhealth.info/im#isA": "is a",
      "http://snomed.info/sct#316231000": "[V]Tobacco use (situation)",
      "http://snomed.info/sct#282278008": "Additional behavior finding (finding)",
      "http://endhealth.info/im#groupNumber": "group Number",
      "http://snomed.info/sct#365981007": "Finding of tobacco smoking behavior (finding)",
      "http://snomed.info/sct#405746006": "Current non smoker but past smoking history unknown (finding)",
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": "subClassOf",
      "http://endhealth.info/im#status": "status",
      "http://snomed.info/sct#186411000000102": "Mental and psychological observations",
      "http://snomed.info/sct#404684003": "Clinical finding (finding)",
      "http://snomed.info/sct#363714003": "Interprets (attribute)",
      "http://snomed.info/sct#365949003": "Health-related behavior finding (finding)",
      "http://endhealth.info/im#Active": "Active",
      "http://endhealth.info/im#usuallySubsumedBy": "usually subsumed by",
      "http://endhealth.info/im#roleGroup": "role group",
      "http://endhealth.info/im#multipleSubsumedBy": "multiple subsumed by",
      "http://snomed.info/sct#416578004": "Mental and psychological observations (finding)",
      "http://endhealth.info/im#hasTermCode": "has term code",
      "http://endhealth.info/im#scheme": "scheme",
      "http://snomed.info/sct#384821006": "Mental state, behavior and/or psychosocial function finding (finding)",
      "http://snomed.info/sct#": "Snomed-CT code scheme and graph",
      "http://snomed.info/sct#229819007": "Tobacco use and exposure (observable entity)",
      "http://snomed.info/sct#8392000": "Non-smoker (finding)",
      "http://snomed.info/sct#365980008": "Finding of tobacco use and exposure (finding)",
      "http://snomed.info/sct#189851000000107": "Mental and psychological observations",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type"
    }
  },
  details: [
    {
      key: "http://endhealth.info/im#isA",
      label: "is a",
      children: [
        {
          key: "http://snomed.info/sct#416578004",
          label: "Mental and psychological observations (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#186411000000102",
          label: "Mental and psychological observations",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#189851000000107",
          label: "Mental and psychological observations",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#404684003",
          label: "Clinical finding (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#282278008",
          label: "Additional behavior finding (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#844005",
          label: "Behavior finding (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#384821006",
          label: "Mental state, behavior and/or psychosocial function finding (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#365949003",
          label: "Health-related behavior finding (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#8392000",
          label: "Non-smoker (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#316231000",
          label: "[V]Tobacco use (situation)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#399791000000101",
          label: "[V]Tobacco use (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#365981007",
          label: "Finding of tobacco smoking behavior (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#160618006",
          label: "Current non-smoker (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#365980008",
          label: "Finding of tobacco use and exposure (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#405746006",
          label: "Current non smoker but past smoking history unknown (finding)",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#im1Id",
      label: "im1 id: SN_405746006",
      children: []
    },
    {
      key: "http://endhealth.info/im#usuallySubsumedBy",
      label: "usually subsumed by",
      children: [
        {
          key: "http://snomed.info/sct#282278008",
          label: "Additional behavior finding (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#316231000",
          label: "[V]Tobacco use (situation)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#399791000000101",
          label: "[V]Tobacco use (context-dependent category)",
          type: "link"
        }
      ]
    },
    {
      key: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
      label: "subClassOf",
      children: [
        {
          key: "http://snomed.info/sct#8392000",
          label: "Non-smoker (finding)",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#roleGroup",
      label: "role group",
      children: [
        {
          key: "http://endhealth.info/im#groupNumber1",
          label: "role group 1",
          children: [
            {
              key: "http://endhealth.info/im#roleGroup.http://snomed.info/sct#363714003",
              iri: "http://snomed.info/sct#363714003",
              label: "Interprets (attribute)",
              data: {
                iri: "http://snomed.info/sct#229819007",
                name: "Tobacco use and exposure (observable entity)"
              },
              type: "property",
              children: []
            }
          ]
        }
      ]
    },
    {
      key: "http://endhealth.info/im#multipleSubsumedBy",
      label: "multiple subsumed by",
      children: [
        {
          key: "http://snomed.info/sct#416578004",
          label: "Mental and psychological observations (finding)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#186411000000102",
          label: "Mental and psychological observations",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#189851000000107",
          label: "Mental and psychological observations",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#scheme",
      label: "scheme",
      children: [
        {
          key: "http://snomed.info/sct#",
          label: "Snomed-CT code scheme and graph",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#hasTermCode",
      label: "has term code",
      children: [
        {
          key: "2149576018",
          label: "Current non smoker but past smoking history unknown (finding) - 2149576018",
          children: []
        },
        {
          key: "2157522017",
          label: "Current non smoker but past smoking history unknown - 2157522017",
          children: []
        }
      ]
    },
    {
      key: "http://endhealth.info/im#subsumedBy",
      label: "subsumed by",
      children: [
        {
          key: "http://snomed.info/sct#160618006",
          label: "Current non-smoker (finding)",
          type: "link"
        }
      ]
    }
  ]
};

export const hasMap = {
  entityBundle: {
    entity: {
      iri: "http://snomed.info/sct#32485007",
      "http://endhealth.info/im#im1Id": "SN_32485007",
      "http://endhealth.info/im#usuallySubsumedBy": [
        {
          iri: "http://snomed.info/sct#2876009",
          name: "Hospital admission, type unclassified, explain by report (procedure)"
        },
        {
          iri: "http://snomed.info/sct#55402005",
          name: "Hospital admission, for laboratory work-up, radiography, etc. (procedure)"
        },
        { iri: "http://snomed.info/sct#342831000000109", name: "Labelling procedure (procedure)" },
        { iri: "http://snomed.info/sct#345241000000105", name: "Court order procedure (procedure)" },
        { iri: "http://snomed.info/sct#351871000000104", name: "Application for court order (procedure)" },
        { iri: "http://snomed.info/sct#351881000000102", name: "Granting of court order (procedure)" },
        { iri: "http://snomed.info/sct#351891000000100", name: "Refusal of court order (procedure)" },
        { iri: "http://snomed.info/sct#351901000000104", name: "Discharge of court order (procedure)" },
        { iri: "http://snomed.info/sct#351911000000102", name: "Subject to court order (procedure)" },
        { iri: "http://snomed.info/sct#351921000000108", name: "Review of court order (procedure)" },
        { iri: "http://snomed.info/sct#351931000000105", name: "Amendment of court order (procedure)" },
        { iri: "http://snomed.info/sct#351941000000101", name: "Expiration of court order (procedure)" },
        {
          iri: "http://snomed.info/sct#397941000000102",
          name: "[V]Other reasons for encounter (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#409891000000104",
          name: "[V]Other reasons for encounter OS (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#411851000000109",
          name: "[X]Other boarder in health care facility (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#416681000000109",
          name: "[V]Other specified reasons for encounter (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#427611000000105",
          name: "[V]Encounter with person who has no complaint or sickness (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#428231000000104",
          name: "[V]Other boarder in health-care facility (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#430251000000105",
          name: "[V]Unspecified reasons for encounter (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#440431000000103",
          name: "[V]Person with other specified health problems (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#440741000000102",
          name: "[V]Healthy person accompanying sick person (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#451961000000105",
          name: "[V]Other reasons for encounter NOS (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#464391000000106",
          name: "[V]Unspecified health problems (context-dependent category)"
        }
      ],
      "http://endhealth.info/im#multipleSubsumedBy": [
        { iri: "http://snomed.info/sct#243797000", name: "Referral and admission procedures (procedure)" },
        {
          iri: "http://snomed.info/sct#11781000000101",
          name: "Care Programme Approach administrative procedures (procedure)"
        },
        {
          iri: "http://snomed.info/sct#24221000000103",
          name: "SNOMED CT UK administrative concepts (administrative concept)"
        },
        {
          iri: "http://snomed.info/sct#479091000000102",
          name: "[X]Persons encountering health services in other specified circumstances (context-dependent category)"
        },
        { iri: "http://snomed.info/sct#714351000000107", name: "Administration NOS (record artifact)" }
      ],
      "http://endhealth.info/im#scheme": [
        {
          iri: "http://snomed.info/sct#",
          name: "Snomed-CT code scheme and graph"
        }
      ],
      "http://endhealth.info/im#hasMap": [
        {
          "http://endhealth.info/im#someOf": [
            {
              "http://endhealth.info/im#mapAdvice": "ALWAYS Z76.9",
              "http://endhealth.info/im#mapPriority": 4,
              "http://endhealth.info/im#assuranceLevel": [
                {
                  iri: "http://endhealth.info/im#NationallyAssuredUK",
                  name: "Nationally assured UK level"
                }
              ],
              "http://endhealth.info/im#mappedTo": [
                {
                  iri: "http://endhealth.info/icd10#Z769",
                  name: "Person encountering health services in unspecified circumstances"
                }
              ]
            },
            {
              "http://endhealth.info/im#mapAdvice": "ALWAYS Z76.4 | ADDITIONAL CODE MANDATORY | CODE MUST NEVER BE USED IN A PRIMARY POSITION",
              "http://endhealth.info/im#mapPriority": 2,
              "http://endhealth.info/im#assuranceLevel": [
                {
                  iri: "http://endhealth.info/im#NationallyAssuredUK",
                  name: "Nationally assured UK level"
                }
              ],
              "http://endhealth.info/im#mappedTo": [
                {
                  iri: "http://endhealth.info/icd10#Z764",
                  name: "Other boarder in health-care facility"
                }
              ]
            },
            {
              "http://endhealth.info/im#mapAdvice": "ALWAYS Z76.3 | ADDITIONAL CODE MANDATORY | CODE MUST BE USED IN A PRIMARY POSITION",
              "http://endhealth.info/im#mapPriority": 1,
              "http://endhealth.info/im#assuranceLevel": [
                {
                  iri: "http://endhealth.info/im#NationallyAssuredUK",
                  name: "Nationally assured UK level"
                }
              ],
              "http://endhealth.info/im#mappedTo": [
                {
                  iri: "http://endhealth.info/icd10#Z763",
                  name: "Healthy person accompanying sick person"
                }
              ]
            },
            {
              "http://endhealth.info/im#mapAdvice": "ALWAYS Z76.8",
              "http://endhealth.info/im#mapPriority": 3,
              "http://endhealth.info/im#assuranceLevel": [
                {
                  iri: "http://endhealth.info/im#NationallyAssuredUK",
                  name: "Nationally assured UK level"
                }
              ],
              "http://endhealth.info/im#mappedTo": [
                {
                  iri: "http://endhealth.info/icd10#Z768",
                  name: "Persons encountering health services in other specified circumstances"
                }
              ]
            }
          ]
        }
      ],
      "http://endhealth.info/im#hasTermCode": [
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "Hospital admission",
          "http://endhealth.info/im#status": [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
          "http://endhealth.info/im#code": "54238014"
        },
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "Hospital admission (procedure)",
          "http://endhealth.info/im#status": [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
          "http://endhealth.info/im#code": "763773011"
        },
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "Admission to hospital",
          "http://endhealth.info/im#status": [{ iri: "http://endhealth.info/im#Active", name: "Active" }],
          "http://endhealth.info/im#code": "1227951014"
        }
      ],
      "http://endhealth.info/im#subsumedBy": [
        { iri: "http://snomed.info/sct#20641000000101", name: "Administration NOS (administrative concept)" },
        { iri: "http://snomed.info/sct#401171000000108", name: "[V] Admission for bladder training" },
        { iri: "http://snomed.info/sct#418621000000107", name: "[V]Admitted for commencement of insulin" },
        {
          iri: "http://snomed.info/sct#431101000000109",
          name: "[V]Admission for instruction in the use of a nebuliser"
        },
        { iri: "http://snomed.info/sct#455051000000105", name: "[V]Admitted for conversion to insulin" },
        {
          iri: "http://snomed.info/sct#469761000000100",
          name: "[V]Admission for instruction of self-catheterisation"
        },
        { iri: "http://snomed.info/sct#857441000000103", name: "Admission procedure" },
        { iri: "http://snomed.info/sct#891081000000104", name: "Admission to establishment" }
      ],
      "http://endhealth.info/im#isA": [
        { iri: "http://snomed.info/sct#32485007", name: "Hospital admission (procedure)" },
        { iri: "http://snomed.info/sct#71388002", name: "Procedure (procedure)" },
        {
          iri: "http://snomed.info/sct#2876009",
          name: "Hospital admission, type unclassified, explain by report (procedure)"
        },
        {
          iri: "http://snomed.info/sct#55402005",
          name: "Hospital admission, for laboratory work-up, radiography, etc. (procedure)"
        },
        { iri: "http://snomed.info/sct#342831000000109", name: "Labelling procedure (procedure)" },
        { iri: "http://snomed.info/sct#345241000000105", name: "Court order procedure (procedure)" },
        { iri: "http://snomed.info/sct#351871000000104", name: "Application for court order (procedure)" },
        { iri: "http://snomed.info/sct#351881000000102", name: "Granting of court order (procedure)" },
        { iri: "http://snomed.info/sct#351891000000100", name: "Refusal of court order (procedure)" },
        { iri: "http://snomed.info/sct#351901000000104", name: "Discharge of court order (procedure)" },
        { iri: "http://snomed.info/sct#351911000000102", name: "Subject to court order (procedure)" },
        { iri: "http://snomed.info/sct#351921000000108", name: "Review of court order (procedure)" },
        { iri: "http://snomed.info/sct#351931000000105", name: "Amendment of court order (procedure)" },
        { iri: "http://snomed.info/sct#351941000000101", name: "Expiration of court order (procedure)" },
        {
          iri: "http://snomed.info/sct#397941000000102",
          name: "[V]Other reasons for encounter (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#409891000000104",
          name: "[V]Other reasons for encounter OS (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#411851000000109",
          name: "[X]Other boarder in health care facility (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#416681000000109",
          name: "[V]Other specified reasons for encounter (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#427611000000105",
          name: "[V]Encounter with person who has no complaint or sickness (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#428231000000104",
          name: "[V]Other boarder in health-care facility (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#430251000000105",
          name: "[V]Unspecified reasons for encounter (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#440431000000103",
          name: "[V]Person with other specified health problems (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#440741000000102",
          name: "[V]Healthy person accompanying sick person (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#451961000000105",
          name: "[V]Other reasons for encounter NOS (context-dependent category)"
        },
        {
          iri: "http://snomed.info/sct#464391000000106",
          name: "[V]Unspecified health problems (context-dependent category)"
        },
        { iri: "http://snomed.info/sct#243797000", name: "Referral and admission procedures (procedure)" },
        {
          iri: "http://snomed.info/sct#11781000000101",
          name: "Care Programme Approach administrative procedures (procedure)"
        },
        {
          iri: "http://snomed.info/sct#24221000000103",
          name: "SNOMED CT UK administrative concepts (administrative concept)"
        },
        {
          iri: "http://snomed.info/sct#479091000000102",
          name: "[X]Persons encountering health services in other specified circumstances (context-dependent category)"
        },
        { iri: "http://snomed.info/sct#714351000000107", name: "Administration NOS (record artifact)" },
        { iri: "http://snomed.info/sct#20641000000101", name: "Administration NOS (administrative concept)" },
        { iri: "http://snomed.info/sct#401171000000108", name: "[V] Admission for bladder training" },
        { iri: "http://snomed.info/sct#418621000000107", name: "[V]Admitted for commencement of insulin" },
        {
          iri: "http://snomed.info/sct#431101000000109",
          name: "[V]Admission for instruction in the use of a nebuliser"
        },
        { iri: "http://snomed.info/sct#455051000000105", name: "[V]Admitted for conversion to insulin" },
        {
          iri: "http://snomed.info/sct#469761000000100",
          name: "[V]Admission for instruction of self-catheterisation"
        },
        { iri: "http://snomed.info/sct#857441000000103", name: "Admission procedure" },
        { iri: "http://snomed.info/sct#891081000000104", name: "Admission to establishment" },
        { iri: "http://snomed.info/sct#14734007", name: "Administrative procedure (procedure)" },
        { iri: "http://snomed.info/sct#305056002", name: "Admission procedure (procedure)" },
        { iri: "http://snomed.info/sct#305335007", name: "Admission to establishment (procedure)" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
        {
          iri: "http://snomed.info/sct#305335007",
          name: "Admission to establishment (procedure)"
        }
      ],
      "http://endhealth.info/im#usageTotal": 2,
      "http://endhealth.info/im#weighting": 9068
    },
    predicates: {
      "http://endhealth.info/im#subsumedBy": "subsumed by",
      "http://snomed.info/sct#440431000000103": "[V]Person with other specified health problems (context-dependent category)",
      "http://snomed.info/sct#20641000000101": "Administration NOS (administrative concept)",
      "http://endhealth.info/im#code": "code",
      "http://snomed.info/sct#351871000000104": "Application for court order (procedure)",
      "http://snomed.info/sct#351911000000102": "Subject to court order (procedure)",
      "http://endhealth.info/im#mapAdvice": "mapping advice",
      "http://snomed.info/sct#469761000000100": "[V]Admission for instruction of self-catheterisation",
      "http://snomed.info/sct#464391000000106": "[V]Unspecified health problems (context-dependent category)",
      "http://endhealth.info/im#Concept": "Terminology concept",
      "http://snomed.info/sct#891081000000104": "Admission to establishment",
      "http://endhealth.info/im#isA": "is a",
      "http://snomed.info/sct#397941000000102": "[V]Other reasons for encounter (context-dependent category)",
      "http://snomed.info/sct#345241000000105": "Court order procedure (procedure)",
      "http://endhealth.info/im#NationallyAssuredUK": "Nationally assured UK level",
      "http://snomed.info/sct#714351000000107": "Administration NOS (record artifact)",
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": "subClassOf",
      "http://endhealth.info/im#status": "status",
      "http://snomed.info/sct#427611000000105": "[V]Encounter with person who has no complaint or sickness (context-dependent category)",
      "http://endhealth.info/im#Inactive": "Inactive",
      "http://snomed.info/sct#305335007": "Admission to establishment (procedure)",
      "http://snomed.info/sct#305056002": "Admission procedure (procedure)",
      "http://endhealth.info/im#Active": "Active",
      "http://snomed.info/sct#416681000000109": "[V]Other specified reasons for encounter (context-dependent category)",
      "http://snomed.info/sct#430251000000105": "[V]Unspecified reasons for encounter (context-dependent category)",
      "http://endhealth.info/icd10#Z769": "Person encountering health services in unspecified circumstances",
      "http://snomed.info/sct#2876009": "Hospital admission, type unclassified, explain by report (procedure)",
      "http://snomed.info/sct#401171000000108": "[V] Admission for bladder training",
      "http://endhealth.info/icd10#Z768": "Persons encountering health services in other specified circumstances",
      "http://snomed.info/sct#71388002": "Procedure (procedure)",
      "http://snomed.info/sct#14734007": "Administrative procedure (procedure)",
      "http://endhealth.info/im#scheme": "scheme",
      "http://snomed.info/sct#411851000000109": "[X]Other boarder in health care facility (context-dependent category)",
      "http://snomed.info/sct#": "Snomed-CT code scheme and graph",
      "http://snomed.info/sct#32485007": "Hospital admission (procedure)",
      "http://snomed.info/sct#428231000000104": "[V]Other boarder in health-care facility (context-dependent category)",
      "http://snomed.info/sct#24221000000103": "SNOMED CT UK administrative concepts (administrative concept)",
      "http://endhealth.info/im#usageTotal": "usage total",
      "http://endhealth.info/icd10#Z763": "Healthy person accompanying sick person",
      "http://snomed.info/sct#351921000000108": "Review of court order (procedure)",
      "http://endhealth.info/icd10#Z764": "Other boarder in health-care facility",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type",
      "http://endhealth.info/im#im1Id": "im1 id",
      "http://snomed.info/sct#455051000000105": "[V]Admitted for conversion to insulin",
      "http://snomed.info/sct#351931000000105": "Amendment of court order (procedure)",
      "http://endhealth.info/im#hasMap": "has map",
      "http://snomed.info/sct#351891000000100": "Refusal of court order (procedure)",
      "http://snomed.info/sct#451961000000105": "[V]Other reasons for encounter NOS (context-dependent category)",
      "http://snomed.info/sct#243797000": "Referral and admission procedures (procedure)",
      "http://snomed.info/sct#342831000000109": "Labelling procedure (procedure)",
      "http://snomed.info/sct#418621000000107": "[V]Admitted for commencement of insulin",
      "http://endhealth.info/im#someOf": "some of",
      "http://snomed.info/sct#857441000000103": "Admission procedure",
      "http://endhealth.info/im#mappedTo": "mapped to",
      "http://snomed.info/sct#11781000000101": "Care Programme Approach adminiasMstrative procedures (procedure)",
      "http://endhealth.info/im#usuallySubsumedBy": "usually subsumed by",
      "http://snomed.info/sct#440741000000102": "[V]Healthy person accompanying sick person (context-dependent category)",
      "http://snomed.info/sct#479091000000102": "[X]Persons encountering health services in other specified circumstances (context-dependent category)",
      "http://snomed.info/sct#431101000000109": "[V]Admission for instruction in the use of a nebuliser",
      "http://snomed.info/sct#351901000000104": "Discharge of court order (procedure)",
      "http://endhealth.info/im#multipleSubsumedBy": "multiple subsumed by",
      "http://endhealth.info/im#hasTermCode": "has term code",
      "http://endhealth.info/im#mapPriority": "mapPriority",
      "http://endhealth.info/im#assuranceLevel": "assurance level",
      "http://snomed.info/sct#55402005": "Hospital admission, for laboratory work-up, radiography, etc. (procedure)",
      "http://snomed.info/sct#351881000000102": "Granting of court order (procedure)",
      "http://snomed.info/sct#351941000000101": "Expiration of court order (procedure)",
      "http://endhealth.info/im#weighting": "weighting",
      "http://snomed.info/sct#409891000000104": "[V]Other reasons for encounter OS (context-dependent category)"
    }
  },
  details: [
    {
      key: "http://endhealth.info/im#im1Id",
      label: "im1 id: SN_32485007",
      children: []
    },
    {
      key: "http://endhealth.info/im#usuallySubsumedBy",
      label: "usually subsumed by",
      children: [
        {
          key: "http://snomed.info/sct#2876009",
          label: "Hospital admission, type unclassified, explain by report (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#55402005",
          label: "Hospital admission, for laboratory work-up, radiography, etc. (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#342831000000109",
          label: "Labelling procedure (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#345241000000105",
          label: "Court order procedure (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351871000000104",
          label: "Application for court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351881000000102",
          label: "Granting of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351891000000100",
          label: "Refusal of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351901000000104",
          label: "Discharge of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351911000000102",
          label: "Subject to court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351921000000108",
          label: "Review of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351931000000105",
          label: "Amendment of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351941000000101",
          label: "Expiration of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#397941000000102",
          label: "[V]Other reasons for encounter (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#409891000000104",
          label: "[V]Other reasons for encounter OS (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#411851000000109",
          label: "[X]Other boarder in health care facility (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#416681000000109",
          label: "[V]Other specified reasons for encounter (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#427611000000105",
          label: "[V]Encounter with person who has no complaint or sickness (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#428231000000104",
          label: "[V]Other boarder in health-care facility (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#430251000000105",
          label: "[V]Unspecified reasons for encounter (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#440431000000103",
          label: "[V]Person with other specified health problems (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#440741000000102",
          label: "[V]Healthy person accompanying sick person (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#451961000000105",
          label: "[V]Other reasons for encounter NOS (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#464391000000106",
          label: "[V]Unspecified health problems (context-dependent category)",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#multipleSubsumedBy",
      label: "multiple subsumed by",
      children: [
        {
          key: "http://snomed.info/sct#243797000",
          label: "Referral and admission procedures (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#11781000000101",
          label: "Care Programme Approach administrative procedures (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#24221000000103",
          label: "SNOMED CT UK administrative concepts (administrative concept)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#479091000000102",
          label: "[X]Persons encountering health services in other specified circumstances (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#714351000000107",
          label: "Administration NOS (record artifact)",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#scheme",
      label: "scheme",
      children: [
        {
          key: "http://snomed.info/sct#",
          label: "Snomed-CT code scheme and graph",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#hasMap",
      label: "has map",
      children: [
        {
          key: "http://endhealth.info/im#someOf",
          label: "some of",
          children: [
            {
              key: "ALWAYS Z76.9",
              label: "ALWAYS Z76.9",
              children: [
                {
                  key: "ALWAYS Z76.9http://endhealth.info/im#mapAdvice",
                  label: "mapping advice - ALWAYS Z76.9"
                },
                {
                  key: "ALWAYS Z76.9http://endhealth.info/im#mapPriority",
                  label: "mapPriority - 4"
                },
                {
                  key: "ALWAYS Z76.9http://endhealth.info/im#assuranceLevel",
                  label: "assurance level",
                  children: [
                    {
                      key: "http://endhealth.info/im#NationallyAssuredUK",
                      label: "Nationally assured UK level",
                      type: "link"
                    }
                  ]
                },
                {
                  key: "ALWAYS Z76.9http://endhealth.info/im#mappedTo",
                  label: "mapped to",
                  children: [
                    {
                      key: "http://endhealth.info/icd10#Z769",
                      label: "Person encountering health services in unspecified circumstances",
                      type: "link"
                    }
                  ]
                }
              ]
            },
            {
              key: "ALWAYS Z76.4 | ADDITIONAL CODE MANDATORY | CODE MUST NEVER BE USED IN A PRIMARY POSITION",
              label: "ALWAYS Z76.4 | ADDITIONAL CODE MANDATORY | CODE MUST NEVER BE USED IN A PRIMARY POSITION",
              children: [
                {
                  key: "ALWAYS Z76.4 | ADDITIONAL CODE MANDATORY | CODE MUST NEVER BE USED IN A PRIMARY POSITIONhttp://endhealth.info/im#mapAdvice",
                  label: "mapping advice - ALWAYS Z76.4 | ADDITIONAL CODE MANDATORY | CODE MUST NEVER BE USED IN A PRIMARY POSITION"
                },
                {
                  key: "ALWAYS Z76.4 | ADDITIONAL CODE MANDATORY | CODE MUST NEVER BE USED IN A PRIMARY POSITIONhttp://endhealth.info/im#mapPriority",
                  label: "mapPriority - 2"
                },
                {
                  key: "ALWAYS Z76.4 | ADDITIONAL CODE MANDATORY | CODE MUST NEVER BE USED IN A PRIMARY POSITIONhttp://endhealth.info/im#assuranceLevel",
                  label: "assurance level",
                  children: [
                    {
                      key: "http://endhealth.info/im#NationallyAssuredUK",
                      label: "Nationally assured UK level",
                      type: "link"
                    }
                  ]
                },
                {
                  key: "ALWAYS Z76.4 | ADDITIONAL CODE MANDATORY | CODE MUST NEVER BE USED IN A PRIMARY POSITIONhttp://endhealth.info/im#mappedTo",
                  label: "mapped to",
                  children: [
                    {
                      key: "http://endhealth.info/icd10#Z764",
                      label: "Other boarder in health-care facility",
                      type: "link"
                    }
                  ]
                }
              ]
            },
            {
              key: "ALWAYS Z76.3 | ADDITIONAL CODE MANDATORY | CODE MUST BE USED IN A PRIMARY POSITION",
              label: "ALWAYS Z76.3 | ADDITIONAL CODE MANDATORY | CODE MUST BE USED IN A PRIMARY POSITION",
              children: [
                {
                  key: "ALWAYS Z76.3 | ADDITIONAL CODE MANDATORY | CODE MUST BE USED IN A PRIMARY POSITIONhttp://endhealth.info/im#mapAdvice",
                  label: "mapping advice - ALWAYS Z76.3 | ADDITIONAL CODE MANDATORY | CODE MUST BE USED IN A PRIMARY POSITION"
                },
                {
                  key: "ALWAYS Z76.3 | ADDITIONAL CODE MANDATORY | CODE MUST BE USED IN A PRIMARY POSITIONhttp://endhealth.info/im#mapPriority",
                  label: "mapPriority - 1"
                },
                {
                  key: "ALWAYS Z76.3 | ADDITIONAL CODE MANDATORY | CODE MUST BE USED IN A PRIMARY POSITIONhttp://endhealth.info/im#assuranceLevel",
                  label: "assurance level",
                  children: [
                    {
                      key: "http://endhealth.info/im#NationallyAssuredUK",
                      label: "Nationally assured UK level",
                      type: "link"
                    }
                  ]
                },
                {
                  key: "ALWAYS Z76.3 | ADDITIONAL CODE MANDATORY | CODE MUST BE USED IN A PRIMARY POSITIONhttp://endhealth.info/im#mappedTo",
                  label: "mapped to",
                  children: [
                    {
                      key: "http://endhealth.info/icd10#Z763",
                      label: "Healthy person accompanying sick person",
                      type: "link"
                    }
                  ]
                }
              ]
            },
            {
              key: "ALWAYS Z76.8",
              label: "ALWAYS Z76.8",
              children: [
                {
                  key: "ALWAYS Z76.8http://endhealth.info/im#mapAdvice",
                  label: "mapping advice - ALWAYS Z76.8"
                },
                {
                  key: "ALWAYS Z76.8http://endhealth.info/im#mapPriority",
                  label: "mapPriority - 3"
                },
                {
                  key: "ALWAYS Z76.8http://endhealth.info/im#assuranceLevel",
                  label: "assurance level",
                  children: [
                    {
                      key: "http://endhealth.info/im#NationallyAssuredUK",
                      label: "Nationally assured UK level",
                      type: "link"
                    }
                  ]
                },
                {
                  key: "ALWAYS Z76.8http://endhealth.info/im#mappedTo",
                  label: "mapped to",
                  children: [
                    {
                      key: "http://endhealth.info/icd10#Z768",
                      label: "Persons encountering health services in other specified circumstances",
                      type: "link"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      key: "http://endhealth.info/im#hasTermCode",
      label: "has term code",
      children: [
        {
          key: "54238014",
          label: "Hospital admission - 54238014",
          children: []
        },
        {
          key: "763773011",
          label: "Hospital admission (procedure) - 763773011",
          children: []
        },
        {
          key: "1227951014",
          label: "Admission to hospital - 1227951014",
          children: []
        }
      ]
    },
    {
      key: "http://endhealth.info/im#subsumedBy",
      label: "subsumed by",
      children: [
        {
          key: "http://snomed.info/sct#20641000000101",
          label: "Administration NOS (administrative concept)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#401171000000108",
          label: "[V] Admission for bladder training",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#418621000000107",
          label: "[V]Admitted for commencement of insulin",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#431101000000109",
          label: "[V]Admission for instruction in the use of a nebuliser",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#455051000000105",
          label: "[V]Admitted for conversion to insulin",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#469761000000100",
          label: "[V]Admission for instruction of self-catheterisation",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#857441000000103",
          label: "Admission procedure",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#891081000000104",
          label: "Admission to establishment",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#isA",
      label: "is a",
      children: [
        {
          key: "http://snomed.info/sct#32485007",
          label: "Hospital admission (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#71388002",
          label: "Procedure (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#2876009",
          label: "Hospital admission, type unclassified, explain by report (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#55402005",
          label: "Hospital admission, for laboratory work-up, radiography, etc. (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#342831000000109",
          label: "Labelling procedure (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#345241000000105",
          label: "Court order procedure (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351871000000104",
          label: "Application for court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351881000000102",
          label: "Granting of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351891000000100",
          label: "Refusal of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351901000000104",
          label: "Discharge of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351911000000102",
          label: "Subject to court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351921000000108",
          label: "Review of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351931000000105",
          label: "Amendment of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#351941000000101",
          label: "Expiration of court order (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#397941000000102",
          label: "[V]Other reasons for encounter (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#409891000000104",
          label: "[V]Other reasons for encounter OS (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#411851000000109",
          label: "[X]Other boarder in health care facility (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#416681000000109",
          label: "[V]Other specified reasons for encounter (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#427611000000105",
          label: "[V]Encounter with person who has no complaint or sickness (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#428231000000104",
          label: "[V]Other boarder in health-care facility (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#430251000000105",
          label: "[V]Unspecified reasons for encounter (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#440431000000103",
          label: "[V]Person with other specified health problems (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#440741000000102",
          label: "[V]Healthy person accompanying sick person (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#451961000000105",
          label: "[V]Other reasons for encounter NOS (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#464391000000106",
          label: "[V]Unspecified health problems (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#243797000",
          label: "Referral and admission procedures (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#11781000000101",
          label: "Care Programme Approach administrative procedures (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#24221000000103",
          label: "SNOMED CT UK administrative concepts (administrative concept)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#479091000000102",
          label: "[X]Persons encountering health services in other specified circumstances (context-dependent category)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#714351000000107",
          label: "Administration NOS (record artifact)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#20641000000101",
          label: "Administration NOS (administrative concept)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#401171000000108",
          label: "[V] Admission for bladder training",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#418621000000107",
          label: "[V]Admitted for commencement of insulin",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#431101000000109",
          label: "[V]Admission for instruction in the use of a nebuliser",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#455051000000105",
          label: "[V]Admitted for conversion to insulin",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#469761000000100",
          label: "[V]Admission for instruction of self-catheterisation",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#857441000000103",
          label: "Admission procedure",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#891081000000104",
          label: "Admission to establishment",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#14734007",
          label: "Administrative procedure (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#305056002",
          label: "Admission procedure (procedure)",
          type: "link"
        },
        {
          key: "http://snomed.info/sct#305335007",
          label: "Admission to establishment (procedure)",
          type: "link"
        }
      ]
    },
    {
      key: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
      label: "subClassOf",
      children: [
        {
          key: "http://snomed.info/sct#305335007",
          label: "Admission to establishment (procedure)",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#usageTotal",
      label: "usage total: 2",
      children: []
    },
    {
      key: "http://endhealth.info/im#weighting",
      label: "weighting: 9068",
      children: []
    }
  ]
};

export const hasProperty = {
  entityBundle: {
    entity: {
      iri: "http://endhealth.info/im#Patient",
      "http://endhealth.info/im#isContainedIn": [
        { iri: "http://endhealth.info/im#PeopleAndTeams", name: "People" },
        { iri: "http://endhealth.info/im#MainEntityTypes" }
      ],
      "http://endhealth.info/im#weighting": 10000,
      "http://www.w3.org/ns/shacl#property": [
        {
          "http://www.w3.org/ns/shacl#order": 1,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#statedGender",
              name: "Gender as stated"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ],
          "http://www.w3.org/ns/shacl#class": [
            {
              iri: "http://endhealth.info/im#905011000252108",
              name: "Stated Gender"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 2,
          "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#contact", name: "contact" }],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 3,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#deathIndicator",
              name: "death indicator"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ],
          "http://www.w3.org/ns/shacl#class": [
            {
              iri: "http://endhealth.info/im#VSET_Unspecified",
              name: "Unspecified (Data model value set)"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 4,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#ethnicity",
              name: "ethnicity"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ],
          "http://www.w3.org/ns/shacl#class": [
            {
              iri: "http://endhealth.info/im#VSET_Unspecified",
              name: "Unspecified (Data model value set)"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 5,
          "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#title", name: "title" }],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 6,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#callingName",
              name: "calling name"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 7,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#forenames",
              name: "forenames"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 8,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#familyName",
              name: "family name"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 9,
          "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#language", name: "language" }],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ],
          "http://www.w3.org/ns/shacl#class": [
            {
              iri: "http://endhealth.info/im#VSET_Unspecified",
              name: "Unspecified (Data model value set)"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 10,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#homeAddress",
              name: "home address"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#node": [{ iri: "http://endhealth.info/im#Address", name: "Address" }],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 11,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#workAddress",
              name: "work address"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#node": [{ iri: "http://endhealth.info/im#Address", name: "Address" }],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 12,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#temporaryAddress",
              name: "temporary address"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#node": [{ iri: "http://endhealth.info/im#Address", name: "Address" }],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 13,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#patientAddress",
              name: "patient address history"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#PatientAddress",
              name: "Patient Address"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 14,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#pdsSensitive",
              name: "pDS sensitive"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ],
          "http://www.w3.org/ns/shacl#class": [
            {
              iri: "http://endhealth.info/im#VSET_Unspecified",
              name: "Unspecified (Data model value set)"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 15,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#relatedPersons",
              name: "related persons"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ],
          "http://www.w3.org/ns/shacl#class": [
            {
              iri: "http://endhealth.info/im#VSET_Unspecified",
              name: "Unspecified (Data model value set)"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://endhealth.info/im#DateTime",
              name: "Date time"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 16,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#dateOfBirth",
              name: "date of birth"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://endhealth.info/im#DateTime",
              name: "Date time"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 17,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#dateOfDeath",
              name: "date of Death"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 18,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#nhsNumber",
              name: "nHS Number"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#integer",
              name: "integer"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 19,
          "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#age", name: "age" }],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#DemographicsGroup",
              name: "Demographic details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 20,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#homeTelephoneNumber",
              name: "home telephone number"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ContactsGroup",
              name: "Contact details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 21,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#workTelephoneNumber",
              name: "work telephone number"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ContactsGroup",
              name: "Contact details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 22,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#mobileTelephoneNumber",
              name: "mobile telephone number"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ContactsGroup",
              name: "Contact details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 23,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#primaryEmail",
              name: "primary email"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ContactsGroup",
              name: "Contact details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://www.w3.org/2001/XMLSchema#string",
              name: "string"
            }
          ],
          "http://www.w3.org/ns/shacl#order": 24,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#secondaryEmail",
              name: "secondary email"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ContactsGroup",
              name: "Contact details"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 25,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#hospitalInpatientStay",
              name: "hospital inpatient stay"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#HospitalInpatientStay",
              name: "Hospital inpatient stay"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#HospitalCareGroup",
              name: "Hospital Care activities"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 26,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#medicationAuthorisation",
              name: "medication authorisation"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#MedicationAuthorisation",
              name: "Medication authorisation"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#TreatmentAndManagementGroup",
              name: "Treatment and management"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 27,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#gpCurrentRegistration",
              name: "gp current registration"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#GPCurrentRegistration",
              name: "GP Current registration"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#RegistrationAndCareEpisodesGroup",
              name: "Registration and  care episodes"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 28,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#placeOfResidenceAtEvent",
              name: "place of residence at event"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#PlaceOfResidenceAtEvent",
              name: "Place of residence at event"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#RegistrationAndCareEpisodesGroup",
              name: "Registration and  care episodes"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 29,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#appointment",
              name: "appointment"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#Appointment",
              name: "Appointment"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#CareAdministrationGroup",
              name: "Care administration activities"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 30,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#carePlan",
              name: "care plan"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#CarePlan",
              name: "Care plan"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#TreatmentAndManagementGroup",
              name: "Treatment and management"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 31,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#condition",
              name: "condition"
            }
          ],
          "http://www.w3.org/ns/shacl#maxCount": 1,
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#Condition",
              name: "Condition"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ClinicalGroup",
              name: "Clinical notes"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 32,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#accidentAndEmergencyEncounter",
              name: "emergency care commissioning data set"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#AccidentAndEmergencyEncounter",
              name: "Emergency Care Commissioning Data Set"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#HospitalCareGroup",
              name: "Hospital Care activities"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 33,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#allergyIntoleranceAndAdverseReaction",
              name: "allergy, intolerance or adverse reaction"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#AllergyIntoleranceAndAdverseReaction",
              name: "Allergy, intolerance or adverse reaction"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ClinicalGroup",
              name: "Clinical notes"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 34,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#familyHistory",
              name: "family history"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#FamilyHistory",
              name: "Family history"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ClinicalGroup",
              name: "Clinical notes"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 35,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#referralRequestOrProcedureRequest",
              name: "referral request or procedure request"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#ReferralRequestOrProcedureRequest",
              name: "Referral Request or procedure request"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#TreatmentAndManagementGroup",
              name: "Treatment and management"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 36,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#immunisation",
              name: "immunisation"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#Immunisation",
              name: "Immunisation"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#TreatmentAndManagementGroup",
              name: "Treatment and management"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 37,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#hospitalOutpatientEncounter",
              name: "hospital outpatient encounter"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#HospitalOutpatientEncounter",
              name: "Hospital outpatient encounter"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#HospitalCareGroup",
              name: "Hospital Care activities"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 38,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#consultation",
              name: "consultation"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#Consultation",
              name: "Consultation"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ClinicalGroup",
              name: "Clinical notes"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 39,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#administrationNote",
              name: "administration  note"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#AdministrationNote",
              name: "Administration  note"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#CareAdministrationGroup",
              name: "Care administration activities"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 40,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#appointmentAttendance",
              name: "appointment attendance"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#AppointmentAttendance",
              name: "Appointment attendance"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#CareAdministrationGroup",
              name: "Care administration activities"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 41,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#criticalCareEncounter",
              name: "critical care encounter"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#CriticalCareEncounter",
              name: "Critical care encounter"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#HospitalCareGroup",
              name: "Hospital Care activities"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 42,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#prescription",
              name: "medication request / prescription"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#MedicationRequest",
              name: "Medication request / Prescription"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#TreatmentAndManagementGroup",
              name: "Treatment and management"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 43,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#hospitalDischarge",
              name: "hospital discharge"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#HospitalDischarge",
              name: "Hospital discharge"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#HospitalCareGroup",
              name: "Hospital Care activities"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 44,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#observation",
              name: "observation"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#Observation",
              name: "Observation"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ClinicalGroup",
              name: "Clinical notes"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 46,
          "http://www.w3.org/ns/shacl#path": [{ iri: "http://endhealth.info/im#flag", name: "flag" }],
          "http://www.w3.org/ns/shacl#node": [{ iri: "http://endhealth.info/im#Flag", name: "Flag" }],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#ClinicalGroup",
              name: "Clinical notes"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 47,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#hospitalAdmission",
              name: "hospital admission"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#HospitalAdmission",
              name: "Hospital admission"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#HospitalCareGroup",
              name: "Hospital Care activities"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 48,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#procedure",
              name: "procedure "
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#Procedure",
              name: "Procedure "
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#TreatmentAndManagementGroup",
              name: "Treatment and management"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 49,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#diagnosticReport",
              name: "diagnostic report"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#DiagnosticReport",
              name: "Diagnostic report"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#TreatmentAndManagementGroup",
              name: "Treatment and management"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 50,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#episodeOfCare",
              name: "episode of care"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#EpisodeOfCare",
              name: "Episode of care"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#RegistrationAndCareEpisodesGroup",
              name: "Registration and  care episodes"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 51,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#gPAdminRegistrationStatus",
              name: "gp registration administration status history"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#GPAdminRegistrationStatus",
              name: "GP Registration administration status history"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#RegistrationAndCareEpisodesGroup",
              name: "Registration and  care episodes"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        },
        {
          "http://www.w3.org/ns/shacl#order": 52,
          "http://www.w3.org/ns/shacl#path": [
            {
              iri: "http://endhealth.info/im#gPRegistration",
              name: "gp registration episode"
            }
          ],
          "http://www.w3.org/ns/shacl#node": [
            {
              iri: "http://endhealth.info/im#GPRegistration",
              name: "GP Registration Episode"
            }
          ],
          "http://www.w3.org/ns/shacl#group": [
            {
              iri: "http://endhealth.info/im#RegistrationAndCareEpisodesGroup",
              name: "Registration and  care episodes"
            }
          ],
          "http://endhealth.info/im#inversePath": [
            {
              iri: "http://endhealth.info/im#patient",
              name: "patient"
            }
          ]
        }
      ],
      "http://endhealth.info/im#scheme": [
        {
          iri: "http://endhealth.info/im#",
          name: "Endeavour code scheme and graph"
        }
      ]
    },
    predicates: {
      "http://endhealth.info/im#criticalCareEncounter": "critical care encounter",
      "http://endhealth.info/im#DiagnosticReport": "Diagnostic report",
      "http://endhealth.info/im#CriticalCareEncounter": "Critical care encounter",
      "http://www.w3.org/ns/shacl#path": "path",
      "http://endhealth.info/im#nhsNumber": "nHS Number",
      "http://endhealth.info/im#contact": "contact",
      "http://endhealth.info/im#PatientAddress": "Patient Address",
      "http://endhealth.info/im#hospitalAdmission": "hospital admission",
      "http://endhealth.info/im#RegistrationAndCareEpisodesGroup": "Registration and  care episodes",
      "http://endhealth.info/im#inversePath": "inverse path",
      "http://endhealth.info/im#Procedure": "Procedure ",
      "http://endhealth.info/im#Consultation": "Consultation",
      "http://endhealth.info/im#hospitalOutpatientEncounter": "hospital outpatient encounter",
      "http://endhealth.info/im#AllergyIntoleranceAndAdverseReaction": "Allergy, intolerance or adverse reaction",
      "http://endhealth.info/im#carePlan": "care plan",
      "http://endhealth.info/im#Observation": "Observation",
      "http://endhealth.info/im#HospitalCareGroup": "Hospital Care activities",
      "http://www.w3.org/ns/shacl#class": "class",
      "http://endhealth.info/im#DateTime": "Date time",
      "http://www.w3.org/ns/shacl#node": "node",
      "http://endhealth.info/im#scheme": "scheme",
      "http://endhealth.info/im#secondaryEmail": "secondary email",
      "http://endhealth.info/im#HospitalAdmission": "Hospital admission",
      "http://endhealth.info/im#905011000252108": "Stated Gender",
      "http://endhealth.info/im#DemographicsGroup": "Demographic details",
      "http://endhealth.info/im#ClinicalGroup": "Clinical notes",
      "http://endhealth.info/im#pdsSensitive": "pDS sensitive",
      "http://endhealth.info/im#dateOfDeath": "date of Death",
      "http://endhealth.info/im#patientAddress": "patient address history",
      "http://www.w3.org/ns/shacl#order": "order",
      "http://endhealth.info/im#TreatmentAndManagementGroup": "Treatment and management",
      "http://endhealth.info/im#": "Endeavour code scheme and graph",
      "http://endhealth.info/im#accidentAndEmergencyEncounter": "emergency care commissioning data set",
      "http://endhealth.info/im#CareAdministrationGroup": "Care administration activities",
      "http://endhealth.info/im#temporaryAddress": "temporary address",
      "http://endhealth.info/im#referralRequestOrProcedureRequest": "referral request or procedure request",
      "http://endhealth.info/im#familyName": "family name",
      "http://endhealth.info/im#workTelephoneNumber": "work telephone number",
      "http://endhealth.info/im#observation": "observation",
      "http://www.w3.org/ns/shacl#maxCount": "max count",
      "http://endhealth.info/im#administrationNote": "administration  note",
      "http://endhealth.info/im#appointment": "appointment",
      "http://endhealth.info/im#diagnosticReport": "diagnostic report",
      "http://endhealth.info/im#ReferralRequestOrProcedureRequest": "Referral Request or procedure request",
      "http://endhealth.info/im#age": "age",
      "http://endhealth.info/im#condition": "condition",
      "http://endhealth.info/im#allergyIntoleranceAndAdverseReaction": "allergy, intolerance or adverse reaction",
      "http://endhealth.info/im#callingName": "calling name",
      "http://endhealth.info/im#AccidentAndEmergencyEncounter": "Emergency Care Commissioning Data Set",
      "http://endhealth.info/im#AdministrationNote": "Administration  note",
      "http://endhealth.info/im#ethnicity": "ethnicity",
      "http://endhealth.info/im#homeAddress": "home address",
      "http://endhealth.info/im#medicationAuthorisation": "medication authorisation",
      "http://endhealth.info/im#gPRegistration": "gp registration episode",
      "http://endhealth.info/im#hospitalDischarge": "hospital discharge",
      "http://endhealth.info/im#appointmentAttendance": "appointment attendance",
      "http://endhealth.info/im#PeopleAndTeams": "People",
      "http://endhealth.info/im#GPAdminRegistrationStatus": "GP Registration administration status history",
      "http://endhealth.info/im#flag": "flag",
      "http://endhealth.info/im#isContainedIn": "is contained in",
      "http://endhealth.info/im#procedure": "procedure ",
      "http://endhealth.info/im#homeTelephoneNumber": "home telephone number",
      "http://endhealth.info/im#MedicationRequest": "Medication request / Prescription",
      "http://endhealth.info/im#title": "title",
      "http://www.w3.org/ns/shacl#NodeShape": "Data model/Node shape ",
      "http://endhealth.info/im#dateOfBirth": "date of birth",
      "http://endhealth.info/im#primaryEmail": "primary email",
      "http://endhealth.info/im#forenames": "forenames",
      "http://endhealth.info/im#MedicationAuthorisation": "Medication authorisation",
      "http://endhealth.info/im#episodeOfCare": "episode of care",
      "http://endhealth.info/im#FamilyHistory": "Family history",
      "http://endhealth.info/im#CarePlan": "Care plan",
      "http://endhealth.info/im#gpCurrentRegistration": "gp current registration",
      "http://endhealth.info/im#VSET_Unspecified": "Unspecified (Data model value set)",
      "http://endhealth.info/im#HospitalInpatientStay": "Hospital inpatient stay",
      "http://www.w3.org/ns/shacl#datatype": "datatype",
      "http://endhealth.info/im#statedGender": "Gender as stated",
      "http://www.w3.org/ns/shacl#property": "property",
      "http://endhealth.info/im#Address": "Address",
      "http://endhealth.info/im#prescription": "medication request / prescription",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type",
      "http://endhealth.info/im#AppointmentAttendance": "Appointment attendance",
      "http://endhealth.info/im#patient": "patient",
      "http://endhealth.info/im#placeOfResidenceAtEvent": "place of residence at event",
      "http://endhealth.info/im#consultation": "consultation",
      "http://endhealth.info/im#Appointment": "Appointment",
      "http://endhealth.info/im#GPCurrentRegistration": "GP Current registration",
      "http://endhealth.info/im#GPRegistration": "GP Registration Episode",
      "http://endhealth.info/im#language": "language",
      "http://endhealth.info/im#Condition": "Condition",
      "http://endhealth.info/im#PlaceOfResidenceAtEvent": "Place of residence at event",
      "http://endhealth.info/im#familyHistory": "family history",
      "http://endhealth.info/im#immunisation": "immunisation",
      "http://endhealth.info/im#ContactsGroup": "Contact details",
      "http://endhealth.info/im#HospitalDischarge": "Hospital discharge",
      "http://endhealth.info/im#EpisodeOfCare": "Episode of care",
      "http://www.w3.org/2001/XMLSchema#integer": "integer",
      "http://endhealth.info/im#workAddress": "work address",
      "http://endhealth.info/im#HospitalOutpatientEncounter": "Hospital outpatient encounter",
      "http://endhealth.info/im#Immunisation": "Immunisation",
      "http://www.w3.org/ns/shacl#group": "group",
      "http://endhealth.info/im#hospitalInpatientStay": "hospital inpatient stay",
      "http://endhealth.info/im#deathIndicator": "death indicator",
      "http://endhealth.info/im#relatedPersons": "related persons",
      "http://www.w3.org/2001/XMLSchema#string": "string",
      "http://endhealth.info/im#weighting": "weighting",
      "http://endhealth.info/im#gPAdminRegistrationStatus": "gp registration administration status history",
      "http://endhealth.info/im#Flag": "Flag",
      "http://endhealth.info/im#mobileTelephoneNumber": "mobile telephone number"
    }
  },
  details: [
    {
      key: "http://endhealth.info/im#isContainedIn",
      label: "is contained in",
      children: [
        {
          key: "http://endhealth.info/im#PeopleAndTeams",
          label: "People",
          type: "link"
        },
        {
          key: "http://endhealth.info/im#MainEntityTypes",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#weighting",
      label: "weighting: 10000",
      children: []
    },
    {
      key: "http://www.w3.org/ns/shacl#property",
      label: "property",
      children: []
    },
    {
      key: "http://endhealth.info/im#scheme",
      label: "scheme",
      children: [
        {
          key: "http://endhealth.info/im#",
          label: "Endeavour code scheme and graph",
          type: "link"
        }
      ]
    }
  ]
};

export const hasParameter = {
  entityBundle: {
    entity: {
      iri: "http://endhealth.info/im#age",
      "http://endhealth.info/im#isA": [
        { iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property", name: "Property" },
        { iri: "http://www.w3.org/2000/01/rdf-schema#Class", name: "Class" },
        { iri: "http://endhealth.info/im#age", name: "age" },
        { iri: "http://endhealth.info/im#functionProperty", name: "function Property" },
        { iri: "http://endhealth.info/im#dataModelProperty", name: "data model property" },
        { iri: "http://www.w3.org/2000/01/rdf-schema#Entity" }
      ],
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
        {
          iri: "http://endhealth.info/im#functionProperty",
          name: "function Property"
        }
      ],
      "http://www.w3.org/ns/shacl#parameter": [
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "firstDate",
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://endhealth.info/im#DateTime",
              name: "Date time"
            }
          ]
        },
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "secondDate",
          "http://www.w3.org/ns/shacl#datatype": [
            {
              iri: "http://endhealth.info/im#DateTime",
              name: "Date time"
            }
          ],
          "http://endhealth.info/im#valueVariable": "$referenceDate"
        },
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "units",
          "http://www.w3.org/ns/shacl#class": [
            {
              iri: "http://snomed.info/sct#258700003",
              name: "Non-International System of Units unit of time (qualifier value)"
            }
          ]
        }
      ],
      "http://endhealth.info/im#function": [
        {
          iri: "http://endhealth.info/im#TimeDifference",
          name: "Time difference"
        }
      ],
      "http://endhealth.info/im#scheme": [
        {
          iri: "http://endhealth.info/im#",
          name: "Endeavour code scheme and graph"
        }
      ],
      "http://www.w3.org/2000/01/rdf-schema#range": [
        {
          iri: "http://www.w3.org/2001/XMLSchema#double",
          name: "double"
        }
      ]
    },
    predicates: {
      "http://www.w3.org/ns/shacl#Function": "Function",
      "http://endhealth.info/im#dataModelProperty": "data model property",
      "http://endhealth.info/im#": "Endeavour code scheme and graph",
      "http://endhealth.info/im#age": "age",
      "http://www.w3.org/ns/shacl#parameter": "parameter",
      "http://www.w3.org/ns/shacl#class": "class",
      "http://www.w3.org/2001/XMLSchema#double": "double",
      "http://snomed.info/sct#258700003": "Non-International System of Units unit of time (qualifier value)",
      "http://endhealth.info/im#DateTime": "Date time",
      "http://www.w3.org/2000/01/rdf-schema#Class": "Class",
      "http://endhealth.info/im#scheme": "scheme",
      "http://endhealth.info/im#valueVariable": "value variable",
      "http://www.w3.org/ns/shacl#datatype": "datatype",
      "http://endhealth.info/im#isA": "is a",
      "http://endhealth.info/im#functionProperty": "function Property",
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": "subClassOf",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property": "Property",
      "http://endhealth.info/im#function": "function",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type",
      "http://www.w3.org/2000/01/rdf-schema#range": "range",
      "http://endhealth.info/im#TimeDifference": "Time difference"
    }
  },
  details: [
    {
      key: "http://endhealth.info/im#isA",
      label: "is a",
      children: [
        {
          key: "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
          label: "Property",
          type: "link"
        },
        {
          key: "http://www.w3.org/2000/01/rdf-schema#Class",
          label: "Class",
          type: "link"
        },
        {
          key: "http://endhealth.info/im#age",
          label: "age",
          type: "link"
        },
        {
          key: "http://endhealth.info/im#functionProperty",
          label: "function Property",
          type: "link"
        },
        {
          key: "http://endhealth.info/im#dataModelProperty",
          label: "data model property",
          type: "link"
        },
        {
          key: "http://www.w3.org/2000/01/rdf-schema#Entity",
          type: "link"
        }
      ]
    },
    {
      key: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
      label: "subClassOf",
      children: [
        {
          key: "http://endhealth.info/im#functionProperty",
          label: "function Property",
          type: "link"
        }
      ]
    },
    {
      key: "http://www.w3.org/ns/shacl#parameter",
      label: "parameter",
      children: [
        {
          key: "1021051141151166897116101",
          label: "firstDate",
          children: [
            {
              key: "http://www.w3.org/2000/01/rdf-schema#label",
              label: "http://www.w3.org/2000/01/rdf-schema#label: firstDate",
              children: []
            },
            {
              key: "http://www.w3.org/ns/shacl#datatype",
              label: "datatype",
              children: [
                {
                  key: "http://endhealth.info/im#DateTime",
                  label: "Date time",
                  type: "link"
                }
              ]
            }
          ]
        },
        {
          key: "115101991111101006897116101",
          label: "secondDate",
          children: [
            {
              key: "http://www.w3.org/2000/01/rdf-schema#label",
              label: "http://www.w3.org/2000/01/rdf-schema#label: secondDate",
              children: []
            },
            {
              key: "http://www.w3.org/ns/shacl#datatype",
              label: "datatype",
              children: [
                {
                  key: "http://endhealth.info/im#DateTime",
                  label: "Date time",
                  type: "link"
                }
              ]
            },
            {
              key: "http://endhealth.info/im#valueVariable",
              label: "value variable: $referenceDate",
              children: []
            }
          ]
        },
        {
          key: "117110105116115",
          label: "units",
          children: [
            {
              key: "http://www.w3.org/2000/01/rdf-schema#label",
              label: "http://www.w3.org/2000/01/rdf-schema#label: units",
              children: []
            },
            {
              key: "http://www.w3.org/ns/shacl#class",
              label: "class",
              children: [
                {
                  key: "http://snomed.info/sct#258700003",
                  label: "Non-International System of Units unit of time (qualifier value)",
                  type: "link"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      key: "http://endhealth.info/im#function",
      label: "function",
      children: [
        {
          key: "http://endhealth.info/im#TimeDifference",
          label: "Time difference",
          type: "link"
        }
      ]
    },
    {
      key: "http://endhealth.info/im#scheme",
      label: "scheme",
      children: [
        {
          key: "http://endhealth.info/im#",
          label: "Endeavour code scheme and graph",
          type: "link"
        }
      ]
    },
    {
      key: "http://www.w3.org/2000/01/rdf-schema#range",
      label: "range",
      children: [
        {
          key: "http://www.w3.org/2001/XMLSchema#double",
          label: "double",
          type: "link"
        }
      ]
    }
  ]
};
