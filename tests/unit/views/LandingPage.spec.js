import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage from "@/views/LandingPage.vue";
import ProgressSpinner from "primevue/progressspinner";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tooltip from "primevue/tooltip";
import { ConfigService, DirectService } from "im-library";
import { shallowMount } from "@vue/test-utils";

vi.mock("@/main");

describe("LandingPage.vue", () => {
  let wrapper;
  let mockStore;
  let mockConfigService;
  let mockDirectService;
  let mockEntityService;

  beforeEach(() => {
    mockStore = {
      state: {
        recentLocalActivity: [{ iri: "http://snomed.info/sct#6081001", dateTime: "2022-03-25T15:57:56.778Z", app: "/viewer/#/concept/" }]
      }
    };
    mockEntityService = {
      getPartialEntity: vi
        .fn()
        .mockResolvedValueOnce({
          "@id": "http://endhealth.info/im#ontologyOverview",
          "http://www.w3.org/2000/01/rdf-schema#label": "Ontology overview",
          "http://www.w3.org/2000/01/rdf-schema#comment": "A brief overview of the concepts stored in the Ontology",
          "http://endhealth.info/im#hasStatsReportEntry": [
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Value sets",
              "http://www.w3.org/2002/07/owl#hasValue": 8
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Data models",
              "http://www.w3.org/2002/07/owl#hasValue": "1973"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Ontology",
              "http://www.w3.org/2002/07/owl#hasValue": "1124984"
            }
          ]
        })
        .mockResolvedValueOnce({
          "@id": "http://endhealth.info/im#ontologyConceptTypes",
          "http://www.w3.org/2000/01/rdf-schema#label": "Ontology concept types",
          "http://www.w3.org/2000/01/rdf-schema#comment": "A brief overview of the types of data stored in the Ontology",
          "http://endhealth.info/im#hasStatsReportEntry": [
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Class",
              "http://www.w3.org/2002/07/owl#hasValue": "1030354"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Legacy concept",
              "http://www.w3.org/2002/07/owl#hasValue": "93282"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Object property",
              "http://www.w3.org/2002/07/owl#hasValue": "1811"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Set",
              "http://www.w3.org/2002/07/owl#hasValue": "1122"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Node shape",
              "http://www.w3.org/2002/07/owl#hasValue": "99"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Record type",
              "http://www.w3.org/2002/07/owl#hasValue": "94"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Data property",
              "http://www.w3.org/2002/07/owl#hasValue": "68"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "undefined",
              "http://www.w3.org/2002/07/owl#hasValue": "45"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Functional property",
              "http://www.w3.org/2002/07/owl#hasValue": "26"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Annotation property",
              "http://www.w3.org/2002/07/owl#hasValue": "23"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Symmetric property",
              "http://www.w3.org/2002/07/owl#hasValue": "11"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Transitive property",
              "http://www.w3.org/2002/07/owl#hasValue": "11"
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Folder",
              "http://www.w3.org/2002/07/owl#hasValue": 8
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Value set",
              "http://www.w3.org/2002/07/owl#hasValue": 8
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Reflexive property",
              "http://www.w3.org/2002/07/owl#hasValue": 2
            },
            {
              "http://www.w3.org/2000/01/rdf-schema#label": "Query template",
              "http://www.w3.org/2002/07/owl#hasValue": "1"
            }
          ]
        })
        .mockResolvedValue({
          "@id": "http://snomed.info/sct#6081001",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
            {
              "@id": "http://endhealth.info/im#Concept",
              name: "Terminology Concept"
            }
          ],
          "http://www.w3.org/2000/01/rdf-schema#label": "Deformity (morphologic abnormality)"
        })
    };
    mockConfigService = {
      getDashboardLayout: vi.fn().mockResolvedValue([
        {
          type: "ReportTable",
          order: 100,
          iri: "http://endhealth.info/im#ontologyOverview"
        },
        {
          type: "PieChartDashCard",
          order: 200,
          iri: "http://endhealth.info/im#ontologyConceptTypes"
        }
      ])
    };

    mockDirectService = { directTo: vi.fn() };

    wrapper = shallowMount(LandingPage, {
      global: {
        components: { ProgressSpinner, Card, DataTable, Column, Button },
        mocks: { $store: mockStore, $configService: mockConfigService, $directService: mockDirectService, $entityService: mockEntityService },
        directives: { Tooltip: Tooltip }
      }
    });
  });

  it("mounts", () => {
    expect(wrapper.vm.activities).toStrictEqual([]);
  });
});
