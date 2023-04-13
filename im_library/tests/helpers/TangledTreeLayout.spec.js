import { getGroupsPropertiesTypes } from "../../src/helpers/TangledTreeLayout";
import { fakerFactory } from "../../src/mocks/fakerFactory";

describe("getGroupsPropertiesTypes", () => {
  it("gets property types", () => {
    const property1 = fakerFactory.propertyDisplay.create({
      property: fakerFactory.iriRef.create(),
      group: fakerFactory.iriRef.create(),
      type: fakerFactory.iriRef.create()
    });
    const property2 = fakerFactory.propertyDisplay.create({
      property: fakerFactory.iriRef.create(),
      group: fakerFactory.iriRef.create(),
      type: fakerFactory.iriRef.create()
    });
    expect(getGroupsPropertiesTypes("testIri", { twinNode: true }, [property1, property2])).toEqual({
      groups: [
        {
          id: property1.group["@id"],
          name: property1.group.name,
          parents: ["testIri"],
          type: "group"
        },
        {
          id: property2.group["@id"],
          name: property2.group.name,
          parents: ["testIri"],
          type: "group"
        }
      ],
      properties: [
        {
          cardinality: property1.cardinality,
          id: property1.property["@id"],
          name: property1.property.name,
          parents: [
            {
              id: property1.group["@id"],
              name: property1.group.name,
              parents: ["testIri"],
              type: "group"
            }
          ],
          type: "property"
        },
        {
          cardinality: property2.cardinality,
          id: property2.property["@id"],
          name: property2.property.name,
          parents: [
            {
              id: property2.group["@id"],
              name: property2.group.name,
              parents: ["testIri"],
              type: "group"
            }
          ],
          type: "property"
        }
      ],
      types: [
        {
          id: property1.type["@id"],
          name: property1.type.name,
          parents: [property1.property["@id"]],
          type: "type"
        },
        {
          id: property2.type["@id"],
          name: property2.type.name,
          parents: [property2.property["@id"]],
          type: "type"
        }
      ]
    });
  });
});
