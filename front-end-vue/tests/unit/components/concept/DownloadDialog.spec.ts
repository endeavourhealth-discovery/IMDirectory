import { flushPromises, shallowMount } from "@vue/test-utils";
import DownloadDialog from "@/components/concept/DownloadDialog.vue";
import Dialog from "primevue/dialog";
import SelectButton from "primevue/selectbutton";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import EntityService from "@/services/EntityService";
import LoggerService from "@/services/LoggerService";
import { RDFS } from "@/vocabulary/RDFS";
import { IM } from "@/vocabulary/IM";

describe("DownloadDialog.vue", () => {
  const CONCEPT = { "@id": "http://snomed.info/sct#298382003", "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)" };
  const DEFINITION = {
    entity: {
      "@id": "http://snomed.info/sct#298382003",
      "http://endhealth.info/im#isA": [
        { "@id": "http://snomed.info/sct#64217002", name: "Curvature of spine (disorder)" },
        { "@id": "http://snomed.info/sct#928000", name: "Disorder of musculoskeletal system (disorder)" },
        { "@id": "http://snomed.info/sct#699699005", name: "Disorder of vertebral column (disorder)" }
      ],
      "http://endhealth.info/im#roleGroup": [
        {
          "http://snomed.info/sct#116676008": { "@id": "http://snomed.info/sct#31739005", name: "Lateral abnormal curvature (morphologic abnormality)" },
          "http://snomed.info/sct#363698007": { "@id": "http://snomed.info/sct#289959001", name: "Musculoskeletal structure of spine (body structure)" }
        }
      ]
    },
    predicates: [
      { name: "is a", "@id": "http://endhealth.info/im#isA" },
      { name: "Associated morphology (attribute)", "@id": "http://snomed.info/sct#116676008" },
      { name: "Finding site (attribute)", "@id": "http://snomed.info/sct#363698007" },
      { name: "role group", "@id": "http://endhealth.info/im#roleGroup" }
    ]
  };
  const CHILDREN = [
    {
      name: "Acquired scoliosis (disorder)",
      hasChildren: true,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#111266001"
    },
    {
      name: "Acrodysplasia scoliosis (disorder)",
      hasChildren: false,
      type: [{ name: "Class", "@id": "http://www.w3.org/2002/07/owl#Class" }],
      "@id": "http://snomed.info/sct#773773006"
    }
  ];
  const DATA_MODEL = [
    {
      property: { name: "additional Practitioners", "@id": "http://endhealth.info/im#additionalPractitioners" },
      type: { name: "Practitioner in role  (record type)", "@id": "http://endhealth.info/im#ThePractitionerInRole" },
      inheritedFrom: {}
    },
    {
      property: { name: "completion Status", "@id": "http://endhealth.info/im#completionStatus" },
      type: { name: "Concept class", "@id": "http://endhealth.info/im#894281000252100" },
      inheritedFrom: {}
    },
    {
      property: { name: "duration", "@id": "http://endhealth.info/im#duration" },
      type: { name: "Concept class", "@id": "http://endhealth.info/im#894281000252100" },
      minExclusive: "1",
      inheritedFrom: {}
    }
  ];
  const MEMBERS = {
    valueSet: { name: "Family history", "@id": "http://endhealth.info/im#VSET_RecordType_FamilyHistory" },
    members: [
      {
        entity: { name: "Family history with explicit context (situation)", "@id": "http://snomed.info/sct#57177007" },
        code: "57177007",
        scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
        type: "MemberIncluded"
      },
      {
        entity: { name: "No family history of clinical finding (situation)", "@id": "http://snomed.info/sct#160266009" },
        code: "160266009",
        scheme: { name: "Snomed-CT code", "@id": "http://endhealth.info/im#SnomedCodeScheme" },
        type: "MemberXcluded"
      }
    ],
    limited: false
  };
  const TERMS = [
    { name: "Scoliosis deformity of spine", code: "439061010", scheme: "Snomed-CT namespace" },
    { name: "Scoliosis", code: "439062015", scheme: "Snomed-CT namespace" },
    { name: "Scoliosis deformity of spine (disorder)", code: "2153143014", scheme: "Snomed-CT namespace" }
  ];

  let wrapper: any;
  let mockToast: any;

  beforeEach(async () => {
    jest.resetAllMocks();
    mockToast = {
      add: jest.fn()
    };
    EntityService.getPartialEntity = jest.fn().mockResolvedValue(CONCEPT);
    EntityService.getDefinitionBundle = jest.fn().mockResolvedValue(DEFINITION);
    EntityService.getEntityChildren = jest.fn().mockResolvedValue(CHILDREN);
    EntityService.getDataModelProperties = jest.fn().mockResolvedValue(DATA_MODEL);
    EntityService.getEntityMembers = jest.fn().mockResolvedValue(MEMBERS);
    EntityService.getEntityTermCodes = jest.fn().mockResolvedValue(TERMS);

    wrapper = shallowMount(DownloadDialog, {
      global: {
        components: { Dialog, SelectButton, Checkbox, Button, ProgressSpinner },
        mocks: { $toast: mockToast }
      },
      props: { conceptIri: "http://snomed.info/sct#298382003", showDialog: true }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    jest.clearAllMocks();
  });

  it("inits on mounted", async () => {
    expect(wrapper.vm.concept).toStrictEqual(CONCEPT);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.isChildOf).toStrictEqual([]);
    expect(wrapper.vm.hasChildren).toStrictEqual([]);
    expect(wrapper.vm.definition).toStrictEqual(DEFINITION);
    expect(wrapper.vm.hasSubTypes).toStrictEqual(CHILDREN);
    expect(wrapper.vm.terms).toStrictEqual(TERMS);
    expect(wrapper.vm.dataModelProperties).toStrictEqual(DATA_MODEL);
    expect(wrapper.vm.members).toStrictEqual(MEMBERS);
  });

  it("inits on conceptIri change", () => {
    wrapper.vm.init = jest.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://endhealth.info/im#DiscoveryOntology");
    expect(wrapper.vm.init).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.init).toHaveBeenCalledWith("http://endhealth.info/im#DiscoveryOntology");
  });

  it("emits on closeDownloadDialog", () => {
    wrapper.vm.closeDownloadDialog();
    expect(wrapper.emitted().closeDownloadDialog).toBeTruthy();
  });

  it("can downloadConcept ___ success", () => {
    wrapper.vm.closeDownloadDialog = jest.fn();
    window.open = jest.fn().mockReturnValue(true);
    wrapper.vm.downloadConcept();
    expect(wrapper.vm.closeDownloadDialog).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      "/test/api/entity/download?iri=http:%2F%2Fsnomed.info%2Fsct%23298382003&format=excel&hasSubTypes=true&dataModelProperties=true&members=true&expandMembers=false&inferred=true&terms=true&isChildOf=false&hasChildren=false&inactive=false"
    );
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(LoggerService.success("Download will begin shortly"));
  });

  it("can downloadConcept ___ fail", () => {
    wrapper.vm.closeDownloadDialog = jest.fn();
    window.open = jest.fn().mockReturnValue(false);
    wrapper.vm.downloadConcept();
    expect(wrapper.vm.closeDownloadDialog).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      "/test/api/entity/download?iri=http:%2F%2Fsnomed.info%2Fsct%23298382003&format=excel&hasSubTypes=true&dataModelProperties=true&members=true&expandMembers=false&inferred=true&terms=true&isChildOf=false&hasChildren=false&inactive=false"
    );
    expect(mockToast.add).toHaveBeenCalledTimes(1);
    expect(mockToast.add).toHaveBeenCalledWith(LoggerService.error("Download failed from server"));
  });

  it("Inits ___ success", async () => {
    wrapper.vm.setIncludeBooleans = jest.fn();
    wrapper.vm.init("http://snomed.info/sct#298382003");
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(EntityService.getPartialEntity).toHaveBeenCalledTimes(1);
    expect(EntityService.getPartialEntity).toHaveBeenCalledWith("http://snomed.info/sct#298382003", [RDFS.LABEL, IM.IS_CHILD_OF, IM.HAS_CHILDREN]);
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledTimes(1);
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.concept).toStrictEqual(CONCEPT);
    expect(EntityService.getEntityTermCodes).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityTermCodes).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.terms).toStrictEqual(TERMS);
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.hasSubTypes).toStrictEqual(CHILDREN);
    expect(EntityService.getDataModelProperties).toHaveBeenCalledTimes(1);
    expect(EntityService.getDataModelProperties).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.dataModelProperties).toStrictEqual(DATA_MODEL);
    expect(wrapper.vm.definition).toStrictEqual(DEFINITION);
    expect(EntityService.getEntityMembers).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityMembers).toHaveBeenCalledWith("http://snomed.info/sct#298382003", false, false);
    expect(wrapper.vm.members).toStrictEqual(MEMBERS);
    expect(wrapper.vm.setIncludeBooleans).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.loading).toBe(false);
  });

  it("Inits ___ success ___ not objectwithkeys", async () => {
    EntityService.getPartialEntity = jest.fn().mockResolvedValue({
      "@id": "http://snomed.info/sct#298382003",
      "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)",
      "http://endhealth.info/im#isChildOf": [{ "@id": "testIsChildOfIri", name: "testIsChildOfName" }],
      "http://endhealth.info/im#hasChildren": [{ "@id": "testHasChildrenIri", name: "testHasChildrenName" }]
    });
    wrapper.vm.setIncludeBooleans = jest.fn();
    wrapper.vm.init("http://snomed.info/sct#298382003");
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(EntityService.getPartialEntity).toHaveBeenCalledTimes(1);
    expect(EntityService.getPartialEntity).toHaveBeenCalledWith("http://snomed.info/sct#298382003", [RDFS.LABEL, IM.IS_CHILD_OF, IM.HAS_CHILDREN]);
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledTimes(1);
    expect(EntityService.getDefinitionBundle).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.concept).toStrictEqual({
      "@id": "http://snomed.info/sct#298382003",
      "http://www.w3.org/2000/01/rdf-schema#label": "Scoliosis deformity of spine (disorder)",
      "http://endhealth.info/im#isChildOf": [{ "@id": "testIsChildOfIri", name: "testIsChildOfName" }],
      "http://endhealth.info/im#hasChildren": [{ "@id": "testHasChildrenIri", name: "testHasChildrenName" }]
    });
    expect(EntityService.getEntityTermCodes).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityTermCodes).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.terms).toStrictEqual(TERMS);
    expect(EntityService.getEntityChildren).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityChildren).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.hasSubTypes).toStrictEqual(CHILDREN);
    expect(EntityService.getDataModelProperties).toHaveBeenCalledTimes(1);
    expect(EntityService.getDataModelProperties).toHaveBeenCalledWith("http://snomed.info/sct#298382003");
    expect(wrapper.vm.dataModelProperties).toStrictEqual(DATA_MODEL);
    expect(wrapper.vm.definition).toStrictEqual(DEFINITION);
    expect(EntityService.getEntityMembers).toHaveBeenCalledTimes(1);
    expect(EntityService.getEntityMembers).toHaveBeenCalledWith("http://snomed.info/sct#298382003", false, false);
    expect(wrapper.vm.members).toStrictEqual(MEMBERS);
    expect(wrapper.vm.setIncludeBooleans).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.loading).toBe(false);
  });

  it("Can setIncludeBooleans ___ members", async () => {
    wrapper.vm.setIncludeBooleans();
    expect(wrapper.vm.includeDefinition).toBe(true);
    expect(wrapper.vm.includeHasSubTypes).toBe(true);
    expect(wrapper.vm.includeDataModelProperties).toBe(true);
    expect(wrapper.vm.includeMembers).toBe(true);
  });

  it("Can setIncludeBooleans ___ no members", async () => {
    wrapper.vm.members = {};
    wrapper.vm.setIncludeBooleans();
    expect(wrapper.vm.includeDefinition).toBe(true);
    expect(wrapper.vm.includeHasSubTypes).toBe(true);
    expect(wrapper.vm.includeDataModelProperties).toBe(true);
    expect(wrapper.vm.includeMembers).toBe(false);
  });
});
