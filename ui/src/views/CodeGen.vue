<template>
  <div class="codegen">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>Code Generator</strong></span>
        </div>
      </template>
    </TopBar>
    <div class="main-container">
      <div class="half-width">
        <div>
          <div class="title-bar">
            <span>File extension</span>
          </div>
          <InputText class="p-inputtext-lg input-text" v-model="fileExtensionInput" type="text" @drop.prevent @dragover.prevent />
        </div>
        <div>
          <div class="title-bar">
            <span>Collection wrapper</span>
          </div>
          <InputText class="input-text" v-model="collectionWrapperInput" type="text" @drop.prevent @dragover.prevent />
        </div>
        <div>
          <DataTable size="small" :value="datatypeMapInput" showGridlines>
            <Column field="code" header="Type">
              <template #body="slotProps">
                <InputText class="input-text-table" type="text" v-model="slotProps.data.code" />
              </template>
            </Column>
            <Column field="name" header="Replace with">
              <template #body="slotProps">
                <InputText class="input-text-table" type="text" v-model="slotProps.data.replace" />
              </template>
            </Column>
          </DataTable>
        </div>
        <div class="text-area-group">
          <div class="title-bar">
            <span>Code Template</span>
          </div>
          <Textarea class="text-area" v-model="codeInput" @drop.prevent />
        </div>
      </div>
      <div class="half-width">
        <div class="text-area-group">
          <div class="title-bar">
            <span>Generated Code</span>
          </div>
          <Textarea disabled class="text-area" v-model="generatedCode" @drop.prevent />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { CodeGenerator } from "@im-library/codegen/CodeGenerator";
import { onMounted, Ref, ref, watch } from "vue";
import entityService from "@/services/EntityService";
import { DataModelProperty, TTIriRef } from "../interfaces/AutoGen";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { RDFS, SHACL } from "@im-library/vocabulary";
import _ from "lodash";

const codeInput = ref("");
const fileExtensionInput = ref("");
const collectionWrapperInput = ref("");
const datatypeMapInput: Ref<any> = ref([]);
const generatedCode = ref();

interface DatatypeMap {
  [key: string]: string;
}

onMounted(async () => {
  await init();
});

watch([codeInput, collectionWrapperInput], () => {
  convert();
});

watch(
  () => _.cloneDeep(datatypeMapInput.value),
  async () => {
    datatypeMapInput.value.forEach((item: any, index: number) => {
      if (index != datatypeMapInput.value.length - 1 && item.code === "" && item.replace === "") {
        datatypeMapInput.value.splice(index, 1);
      }
      if (datatypeMapInput.value[datatypeMapInput.value.length - 1].code && datatypeMapInput.value[datatypeMapInput.value.length - 1].replace) {
        datatypeMapInput.value.push({ code: "", replace: "" });
      }
    });
    await convert();
  }
);

async function init() {
  fileExtensionInput.value = ".java";
  codeInput.value = `package $\{NAMESPACE};

import java.util.ArrayList;
import java.util.List;

/**
* Represents $\{MODEL NAME}
* $\{MODEL COMMENT}
*/

public class $\{ModelName} {
<template #property>
  private $\{DataType} $\{propertyName};

  /**
  * Gets the $\{PROPERTY NAME} of this $\{MODEL NAME}
  * @return $\{propertyName}
  */
  public $\{DataType} get$\{PropertyName}() {
    return $\{propertyName};
  }

  /**
  * Sets the $\{PROPERTY NAME} of this $\{MODEL NAME}
  * @param $\{propertyName} The new $\{PROPERTY NAME} to set
  * @return $\{ModelName}
  */
  public $\{ModelName} set$\{PropertyName}($\{DataType} value) {
    $\{propertyName} = value;
    return this;
  }

 <template #array>
  /**
  * Adds the given $\{PROPERTY NAME} to this $\{MODEL NAME}
   * @param $\{propertyName} The $\{PROPERTY NAME} to add
   * @return $\{ModelName}
  */
  public $\{ModelName} add$\{PropertyName}($\{BASE DATA TYPE} $\{propertyName}) {
    $\{DataType} array = this.get$\{PropertyName}();
  if (null == array) {
     array = new ArrayList();
      this.set$\{PropertyName}(array);
    }

    array.add($\{propertyName});
    return this;
  }
 </template #array>
</template #property>
}`;
  collectionWrapperInput.value = "List<${BASE DATA TYPE}>";
  datatypeMapInput.value = [{ code: "http://www.w3.org/2001/XMLSchema#string", replace: "String" }];
  await convert();
}
async function convert() {
  const newString = codeInput.value.replaceAll("\n", "\\n").replaceAll("\\n<", "<").replaceAll(">\\n", ">");

  const propertyTemp = "<template #property>";
  const propertyTempEnd = "</template #property>";
  const arrayTemp = "<template #array>";
  const arrayTempEnd = "</template #array>";

  let header = getTemplate(newString, "header", "", propertyTemp);
  let array = getTemplate(newString, "array", arrayTemp, arrayTempEnd);
  let property = getTemplate(newString, "property", propertyTemp, propertyTempEnd)
    .replaceAll(arrayTemp, "")
    .replaceAll(arrayTempEnd, "")
    .replaceAll(array, "")
    .replaceAll("\\n", "\n");
  let footer = getTemplate(newString, "footer", propertyTempEnd, "");

  const entity = await entityService.getPartialEntity("http://endhealth.info/im#Organisation", [RDFS.LABEL, RDFS.COMMENT, SHACL.PROPERTY]);
  const iri: TTIriRef = {
    "@id": entity["@id"],
    name: entity[RDFS.LABEL],
    description: entity[RDFS.COMMENT]
  };

  const newProperties = await getProperties(entity);

  const newDatatypeMap = getDatatypeMap();

  generateCode(header, property, array, footer, iri, newProperties, newDatatypeMap);
}

function getTemplate(code: string, templateName: string, patternStart: string, patternEnd: string) {
  const search = RegExp(new RegExp(patternStart + "(.*)" + patternEnd)).exec(code);
  if (search && search.length > 1) return search[1].replaceAll("\\n", "\n");
  else return "";
}

async function getProperties(entity: any) {
  const newProperties: DataModelProperty[] = [];
  for (let prop in entity[SHACL.PROPERTY]) {
    let datatype = entity[SHACL.PROPERTY][prop][SHACL.PATH][0];
    let maxExclusive = "";
    if (entity[SHACL.PROPERTY][prop][SHACL.MAXCOUNT] === 1) maxExclusive = entity[SHACL.PROPERTY][prop][SHACL.MAXCOUNT];
    if (isArrayHasLength(entity[SHACL.PROPERTY][prop][SHACL.DATATYPE])) {
      datatype = entity[SHACL.PROPERTY][prop][SHACL.DATATYPE][0];
    }
    let newProperty: DataModelProperty = {
      property: {
        "@id": entity[SHACL.PROPERTY][prop][SHACL.PATH][0]["@id"],
        name: entity[SHACL.PROPERTY][prop][SHACL.PATH][0].name,
        description: entity[SHACL.PROPERTY][prop][SHACL.PATH][0].description
      },
      type: datatype,
      maxExclusive: maxExclusive
    };
    newProperties.push(newProperty);
  }
  return newProperties;
}

function getDatatypeMap() {
  let newDatatypeMap: DatatypeMap = {};
  for (let datatype in datatypeMapInput.value) {
    if (datatypeMapInput.value[datatype].code !== "" && datatypeMapInput.value[datatype].replace !== "") {
      let index = datatypeMapInput.value[datatype].code;
      newDatatypeMap[index] = datatypeMapInput.value[datatype].replace;
    } else if (datatypeMapInput.value[datatype].code !== "" || datatypeMapInput.value[datatype].replace !== "") {
      delete newDatatypeMap[datatype];
    }
  }
  return newDatatypeMap;
}

function generateCode(
  header: string,
  property: string,
  array: string,
  footer: string,
  iri: TTIriRef,
  properties: DataModelProperty[],
  dataTypeMap: DatatypeMap
) {
  const cg: CodeGenerator = new CodeGenerator({
    fileExtension: fileExtensionInput.value,
    header: header,
    property: property,
    collectionProperty: array,
    collectionWrapper: collectionWrapperInput.value,
    footer: footer,
    datatypeMap: dataTypeMap
  });

  generatedCode.value = cg.generateCode(iri, properties, "org.endavourhealth.im");
}
</script>

<style scoped>
.codegen {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

.main-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow: auto;
}

.half-width {
  width: 50%;
  height: 100%;
  align-items: stretch;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  padding: 1rem;
}

.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.text-area-group {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

.text-area {
  width: 100%;
  height: 100%;
  vertical-align: top;
  resize: none;
  font-size: 0.8rem;
  font-family: monospace;
}

.input-text {
  width: 40%;
  font-size: 1rem;
}
.input-text-table {
  width: 100%;
}
</style>
