import { render, fireEvent, within } from "@testing-library/vue";
import ArrayObjectNamesToStringWithLabel from "../../../../src/components/modules/generics/ArrayObjectNamesToStringWithLabel.vue";

describe("ArrayObjectNameToStringWithLabel.vue", () => {
  let component;

  beforeEach(() => {
    vi.resetAllMocks();

    component = render(ArrayObjectNamesToStringWithLabel, {
      props: {
        label: "Types",
        size: "50%",
        data: [
          { "@id": "http://endhealth.info/im#RecordType", name: "Record type" },
          { "@id": "http://www.w3.org/ns/shacl#NodeShape", name: "Node shape" },
          { "@id": "http://www.w3.org/2002/07/owl#Class", name: "Class" }
        ],
        show: true
      }
    });
  });

  it("renders after mount", () => {
    component.getByText("Types:");
    component.getByText("Record type, Data model, Class");
  });
});
