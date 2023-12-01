import TextDefinition from "@/components/shared/generics/TextDefinition.vue";
import { render, within } from "@testing-library/vue";
import Button from "primevue/button";
import StyleClass from "primevue/styleclass";
import ProgressSpinner from "primevue/progressspinner";
import { expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";

createTestingPinia({
  initialState: {
    directory: {
      textDefinitionStartExpanded: ["Definition"],
      conceptIri: "http://snomed.info/sct#298382003"
    }
  }
});

const BUNDLE = {
  entity: {
    "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
      { "@id": "http://snomed.info/sct#64217002", name: "Curvature of spine" },
      { "@id": "http://snomed.info/sct#928000", name: "Disorder of musculoskeletal system" },
      { "@id": "http://snomed.info/sct#699699005", name: "Disorder of vertebral column" },
      {
        "http://endhealth.info/im#roleGroup": [
          {
            "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#31739005", name: "Lateral abnormal curvature" },
            "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#289959001", name: "Musculoskeletal structure of spine" }
          }
        ]
      }
    ]
  },
  predicates: {
    "http://www.w3.org/2000/01/rdf-schema#subClassOf": "Is subclass of",
    "http://endhealth.info/im#roleGroup": "Where",
    "http://snomed.info/sct#116676008": "Associated morphology",
    "http://snomed.info/sct#363698007": "Finding site",
    "http://endhealth.info/im#mapAdvice": "mapping advice",
    "http://endhealth.info/im#someOf": "some of",
    "http://endhealth.info/im#hasMap": "has map",
    "http://endhealth.info/im#mapPriority": "mapPriority",
    "http://endhealth.info/im#assuranceLevel": "assurance level",
    "http://www.w3.org/2002/07/owl#onProperty": "On property",
    "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
    "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
    "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to"
  }
};

describe("TextDefinition.vue ___ data", () => {
  let component;
  let docSpy;
  let mockButton;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockButton = { click: vi.fn() };

    docSpy = vi.spyOn(document, "getElementById");
    docSpy.mockReturnValue(mockButton);

    component = render(TextDefinition, {
      global: { components: { Button, ProgressSpinner }, directives: { styleclass: StyleClass } },
      props: {
        data: BUNDLE,
        label: "Definition",
        show: true
      }
    });

    await flushPromises();
    vi.clearAllMocks();
  });

  it.skip("has a definition with hyperlinks", () => {
    component.getByText("Definition");
    const definition = component.getByTestId("text-definition");
    within(definition).getByText((content, element) => content.startsWith("Is subclass of"));
    const tag1 = within(definition).getByText("Curvature of spine");
    expect(tag1.nodeName).toBe("A");
    const tag2 = within(definition).getByText("Disorder of musculoskeletal system");
    expect(tag2.nodeName).toBe("A");
    const tag3 = within(definition).getByText("Disorder of vertebral column");
    expect(tag3.nodeName).toBe("A");
    const where = within(definition).getByText((content, element) => content.includes("Where"));
    within(where).getByText(content => content.includes("Associated morphology"));
    const tag4 = within(where).getByText("Lateral abnormal curvature");
    expect(tag4.nodeName).toBe("A");
    within(where).getByText(content => content.includes("Finding site"));
    const tag5 = within(where).getByText("Musculoskeletal structure of spine");
    expect(tag5.nodeName).toBe("A");
  });
});
