import { describe, expect, it } from "vitest";
import { CodeGenerator } from "@/codegen/CodeGenerator";
import { TTIriRef, DataModelProperty } from "@/interfaces/AutoGen";

const model: TTIriRef = {
  "@id": "im:GeneralPractitioner",
  name: "General Practitioner",
  description: "A General Practitioner (GP) registered with the British Medical Council"
};

const properties: DataModelProperty[] = [
  {
    property: { "@id": "", name: "Forename", description: "The GP's first/calling name" },
    type: { "@id": "XSD:String" },
    maxInclusive: "1"
  },
  {
    property: { "@id": "", name: "Work Address", description: "The GP's work address history" },
    type: { "@id": "IM:Address", name: "Address" }
  }
];

describe("CodeGen", () => {
  it("Converts a model to JAVA pojo code", () => {
    const cg: CodeGenerator = new CodeGenerator({
      fileExtension: ".java",
      header:
        "package ${NAMESPACE};\n\nimport java.util.ArrayList;\nimport java.util.List;\n\n/**\n* Represents ${MODEL NAME}\n* ${MODEL COMMENT}\n*/\n\npublic class ${ModelName} {",
      property:
        "  private ${DATA TYPE} ${propertyName};\n\n  /**\n  * Gets the ${PROPERTY NAME} of this ${MODEL NAME}\n  * @return ${propertyName}\n  */\n  public ${DATA TYPE} get${PropertyName}() {\n    return ${propertyName};\n  }\n\n  /**\n  * Sets the ${PROPERTY NAME} of this ${MODEL NAME}\n  * @param ${propertyName} The new ${PROPERTY NAME} to set\n  * @return ${ModelName}\n  */\n  public ${ModelName} set${PropertyName}(${DATA TYPE} value) {\n    ${propertyName} = value;\n    return this;\n  }\n\n",
      collectionProperty:
        "  /**\n  * Adds the given ${PROPERTY NAME} to this ${MODEL NAME}\n   * @param ${propertyName} The ${PROPERTY NAME} to add\n   * @return ${ModelName}\n  */\n  public ${ModelName} add${PropertyName}(${BASE DATA TYPE} ${propertyName}) {\n    ${DATA TYPE} array = this.get${PropertyName}();\n\n    if (null == array) {\n     array = new ArrayList();\n      this.set${PropertyName}(array);\n    }\n\n    array.add(${propertyName});\n    return this;\n  }\n",
      collectionWrapper: "List<${BASE DATA TYPE}>",
      footer: "}",
      datatypeMap: {
        "XSD:String": "String"
      }
    });

    const actual = cg.generateCode(model, properties, "org.endeavourhealth.im");

    console.log(actual);
  });

  it("Converts a model to JAVA IM DataModel (health database)", () => {
    const cg: CodeGenerator = new CodeGenerator({
      fileExtension: ".java",
      header:
        'package ${NAMESPACE};\n\nimport java.util.ArrayList;\nimport java.util.List;\nimport java.util.UUID;\n\n/**\n* Represents ${MODEL NAME}\n* ${MODEL COMMENT}\n*/\n\npublic class ${ModelName} extends IMDMBase<${ModelName}> {\n    /**\n    * ${MODEL NAME} constructor with identifier\n    */\n    public ${ModelName}(UUID id) {\n        super("${ModelName}", id);\n    }\n    ',
      property:
        '    /**\n    * Gets the ${PROPERTY NAME} of this ${MODEL NAME}\n    * @return ${propertyName}\n    */\n    public ${DATA TYPE} get${PropertyName}() {\n        return getProperty("${propertyName}");\n    }\n    /**\n    * Sets the ${PROPERTY NAME} of this ${MODEL NAME}\n    * @param ${propertyName} The new ${PROPERTY NAME} to set\n    * @return ${ModelName}\n    */\n    public ${ModelName} set${PropertyName}(${DATA TYPE} value) {\n        setProperty("${propertyName}", value);\n        return this;\n    }\n\n',
      collectionProperty:
        "    /**\n    * Adds the given ${PROPERTY NAME} to this ${MODEL NAME}\n    * @param value The ${PROPERTY NAME} to add\n    * @return ${ModelName}\n    */\n    public ${ModelName} add${PropertyName}(${BASE DATA TYPE} value) {\n        ${DATA TYPE} array = this.get${PropertyName}();\n    \n        if (null == array) {\n            array = new ArrayList();\n            this.set${PropertyName}(array);\n        }\n        \n        array.add(value);\n        return this;\n    }\n",
      collectionWrapper: "List<${BASE DATA TYPE}>",
      footer: "}",
      datatypeMap: {
        "XSD:String": "String"
      }
    });

    const actual = cg.generateCode(model, properties, "org.endeavourhealth.im");

    console.log(actual);
  });

  it("Converts a model to C#.net class", () => {
    const cg: CodeGenerator = new CodeGenerator({
      fileExtension: ".cs",
      header: "namespace ${NAMESPACE};\n{\n    public class ${ModelName}\n    {",
      property: "          public ${DATA TYPE} ${propertyName} { get; set; }\n",
      collectionProperty: "",
      collectionWrapper: "List<${BASE DATA TYPE}>",
      footer: "    }\n}",
      datatypeMap: {
        "XSD:String": "string"
      }
    });

    const actual = cg.generateCode(model, properties, "org.endeavourhealth.im");

    console.log(actual);
  });

  it("Tests variants", () => {
    const cg: CodeGenerator = new CodeGenerator({
      fileExtension: ".cs",
      header: "namespace ${NAMESPACE};\n{\n    public class ${ModelName}\n    {",
      property: "          public ${DATA TYPE} ${propertyName} { get; set; }\n",
      collectionProperty: "",
      collectionWrapper: "List<${BASE DATA TYPE}>",
      footer: "    }\n}",
      datatypeMap: {
        "XSD:String": "string"
      }
    });

    const PROPERTY = "PROPERTY NAME";
    const VALUE = "Medication Statement";

    let actual = cg.replaceVariants("${PROPERTY NAME}", PROPERTY, VALUE);
    expect(actual).toEqual("Medication Statement");

    actual = cg.replaceVariants("${PROPERTYNAME}", PROPERTY, VALUE);
    expect(actual).toEqual("MedicationStatement");

    actual = cg.replaceVariants("${property name}", PROPERTY, VALUE);
    expect(actual).toEqual("medication statement");

    actual = cg.replaceVariants("${propertyname}", PROPERTY, VALUE);
    expect(actual).toEqual("medicationstatement");

    actual = cg.replaceVariants("${property Name}", PROPERTY, VALUE);
    expect(actual).toEqual("medication Statement");

    actual = cg.replaceVariants("${propertyName}", PROPERTY, VALUE);
    expect(actual).toEqual("medicationStatement");

    actual = cg.replaceVariants("${Property Name}", PROPERTY, VALUE);
    expect(actual).toEqual("Medication Statement");

    actual = cg.replaceVariants("${PropertyName}", PROPERTY, VALUE);
    expect(actual).toEqual("MedicationStatement");
  });
});
