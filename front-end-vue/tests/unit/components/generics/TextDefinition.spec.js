import TextDefinition from "@/components/generics/TextDefinition.vue";
import { flushPromises, shallowMount } from "@vue/test-utils";
import Button from "primevue/button";
import StyleClass from "primevue/styleclass";
import ConfigService from "@/services/ConfigService";
import ProgressSpinner from "primevue/progressspinner";

describe("TextDefinition.vue ___ data", () => {
  let wrapper;
  let mockStore;
  let docSpy;
  let mockButton;

  const BLOCKED_IRIS = [
    "http://www.w3.org/2001/XMLSchema#string",
    "http://www.w3.org/2001/XMLSchema#boolean",
    "http://www.w3.org/2001/XMLSchema#float",
    "http://www.w3.org/2001/XMLSchema#double",
    "http://www.w3.org/2001/XMLSchema#decimal",
    "http://www.w3.org/2001/XMLSchema#dateTime",
    "http://www.w3.org/2001/XMLSchema#duration",
    "http://www.w3.org/2001/XMLSchema#hexBinary",
    "http://www.w3.org/2001/XMLSchema#base64Binary",
    "http://www.w3.org/2001/XMLSchema#anyURI",
    "http://www.w3.org/2001/XMLSchema#ID",
    "http://www.w3.org/2001/XMLSchema#IDREF",
    "http://www.w3.org/2001/XMLSchema#ENTITY",
    "http://www.w3.org/2001/XMLSchema#NOTATION",
    "http://www.w3.org/2001/XMLSchema#normalizedString",
    "http://www.w3.org/2001/XMLSchema#token",
    "http://www.w3.org/2001/XMLSchema#language",
    "http://www.w3.org/2001/XMLSchema#IDREFS",
    "http://www.w3.org/2001/XMLSchema#ENTITIES",
    "http://www.w3.org/2001/XMLSchema#NMTOKEN",
    "http://www.w3.org/2001/XMLSchema#NMTOKENS",
    "http://www.w3.org/2001/XMLSchema#Name",
    "http://www.w3.org/2001/XMLSchema#QName",
    "http://www.w3.org/2001/XMLSchema#NCName",
    "http://www.w3.org/2001/XMLSchema#integer",
    "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
    "http://www.w3.org/2001/XMLSchema#positiveInteger",
    "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
    "http://www.w3.org/2001/XMLSchema#negativeInteger",
    "http://www.w3.org/2001/XMLSchema#byte",
    "http://www.w3.org/2001/XMLSchema#int",
    "http://www.w3.org/2001/XMLSchema#long",
    "http://www.w3.org/2001/XMLSchema#short",
    "http://www.w3.org/2001/XMLSchema#unsignedByte",
    "http://www.w3.org/2001/XMLSchema#unsignedInt",
    "http://www.w3.org/2001/XMLSchema#unsignedLong",
    "http://www.w3.org/2001/XMLSchema#unsignedShort",
    "http://www.w3.org/2001/XMLSchema#date",
    "http://www.w3.org/2001/XMLSchema#time",
    "http://www.w3.org/2001/XMLSchema#gYearMonth",
    "http://www.w3.org/2001/XMLSchema#gYear",
    "http://www.w3.org/2001/XMLSchema#gMonthDay",
    "http://www.w3.org/2001/XMLSchema#gDay",
    "http://www.w3.org/2001/XMLSchema#gMonth"
  ];

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

  beforeEach(async () => {
    jest.resetAllMocks();

    ConfigService.getDefaultPredicateNames = jest.fn().mockResolvedValue({
      "http://endhealth.info/im#roleGroup": "Where",
      "http://www.w3.org/2002/07/owl#onProperty": "On property",
      "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
      "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
      "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to",
      "http://www.w3.org/2000/01/rdf-schema#subClassOf": "Is subclass of"
    });

    mockStore = { state: { blockedIris: BLOCKED_IRIS }, commit: jest.fn() };

    mockButton = { click: jest.fn() };

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(mockButton);

    wrapper = shallowMount(TextDefinition, {
      global: { components: { Button, ProgressSpinner }, mocks: { $store: mockStore }, directives: { styleclass: StyleClass } },
      props: {
        data: BUNDLE,
        label: "Definition",
        show: true,
        size: "100%"
      }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("mounts", () => {
    expect(wrapper.vm.label).toBe("Definition");
    expect(wrapper.vm.data).toStrictEqual(BUNDLE);
    expect(wrapper.vm.size).toBe("100%");
    expect(wrapper.vm.show).toBe(true);
    expect(wrapper.vm.buttonExpanded).toBe(false);
    expect(wrapper.vm.count).toBe(0);
    expect(wrapper.vm.definition).toBe(
      'Is subclass of : \n  <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%2364217002">Curvature of spine</a>\n  <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%23928000">Disorder of musculoskeletal system</a>\n  <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%23699699005">Disorder of vertebral column</a>\n  Where : \n    ( Associated morphology : <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%2331739005">Lateral abnormal curvature</a>\n      Finding site : <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%23289959001">Musculoskeletal structure of spine</a> )\n'
    );
    expect(wrapper.vm.loading).toBe(false);
  });

  it("checks hasData ___ true", () => {
    expect(TextDefinition.computed.hasData.call({ data: BUNDLE })).toBe(true);
  });

  it("checks hasData ___ false", () => {
    expect(TextDefinition.computed.hasData.call({ data: {} })).toBe(false);
  });

  it("inits ___ definition ___ button", async () => {
    wrapper.vm.getDefinition = jest.fn();
    wrapper.vm.init();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.getDefinition).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.loading).toBe(false);
    expect(mockButton.click).toHaveBeenCalledTimes(1);
  });

  it("inits ___ definition ___ no button", async () => {
    docSpy.mockReturnValue(undefined);
    wrapper.vm.getDefinition = jest.fn();
    wrapper.vm.init();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.getDefinition).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.loading).toBe(false);
    expect(mockButton.click).not.toHaveBeenCalled();
  });

  it("can setButtonExpanded", () => {
    wrapper.vm.buttonExpanded = false;
    wrapper.vm.setButtonExpanded();
    expect(wrapper.vm.buttonExpanded).toBe(true);
  });

  it("can getDefinition", async () => {
    wrapper.vm.definition = "";
    wrapper.vm.getDefinition();
    await flushPromises();
    expect(ConfigService.getDefaultPredicateNames).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.definition).toBe(
      'Is subclass of : \n  <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%2364217002">Curvature of spine</a>\n  <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%23928000">Disorder of musculoskeletal system</a>\n  <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%23699699005">Disorder of vertebral column</a>\n  Where : \n    ( Associated morphology : <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%2331739005">Lateral abnormal curvature</a>\n      Finding site : <a href="http://localhost/#/concept/http:%2F%2Fsnomed.info%2Fsct%23289959001">Musculoskeletal structure of spine</a> )\n'
    );
  });

  it("can getCount", () => {
    expect(wrapper.vm.getCount()).toBe(4);
  });
});

describe("TextDefinition.vue ___ no data", () => {
  let wrapper;
  let mockStore;
  let docSpy;
  let mockButton;

  beforeEach(async () => {
    jest.resetAllMocks();

    ConfigService.getDefaultPredicateNames = jest.fn().mockResolvedValue({});

    mockStore = { state: { blockedIris: [] }, commit: jest.fn() };

    mockButton = { click: jest.fn() };

    docSpy = jest.spyOn(document, "getElementById");
    docSpy.mockReturnValue(mockButton);

    wrapper = shallowMount(TextDefinition, {
      global: { components: { Button, ProgressSpinner }, mocks: { $store: mockStore }, directives: { styleclass: StyleClass } },
      props: {
        label: "Bundle",
        show: true,
        size: "100%"
      }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("inits ___ not definition", async () => {
    wrapper.vm.getDefinition = jest.fn();
    wrapper.vm.init();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.getDefinition).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.loading).toBe(false);
    expect(mockButton.click).not.toHaveBeenCalled();
    expect(wrapper.vm.data).toBe(null);
  });
});
