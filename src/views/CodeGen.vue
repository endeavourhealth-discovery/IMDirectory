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
        <div class="flex flex-row gap-2">
          <div class="flex flex-1 flex-col">
            <h3>Template</h3>
            <div class="button-group">
              <div>
                <InputText placeholder="Template name" v-model="nameInput"></InputText>
                <Button type="button" icon="fa-solid fa-chevron-down" @click="toggleLoad" aria-haspopup="true" aria-controls="overlay_menu" />
              </div>
              <Menu ref="templateMenu" id="overlay_menu" :model="templateDropdownList" :popup="true" />
              <Button :disabled="!nameInput.length" class="save-button" label="Save template" @click="saveTemplate" />
            </div>
          </div>
          <div class="flex flex-1 flex-col">
            <h3>Properties</h3>
            <div class="button-group h-12">
              <Checkbox v-model="complexTypes" binary name="complexTypes" />
              <label for="complexTypes">Include complex types?</label>
            </div>
          </div>
        </div>

        <div class="flex">
          <div class="flex flex-1 flex-col">
            <h3>File extension</h3>
            <div class="button-group">
              <InputText class="input-text flex-1" v-model="fileExtensionInput" type="text" @drop.prevent @dragover.prevent />
            </div>
          </div>
          <div class="title-bar flex-1 flex-col">
            <h3>Collection wrapper</h3>
            <div class="button-group">
              <InputText class="input-text flex-1" v-model="collectionWrapperInput" type="text" @drop.prevent @dragover.prevent />
            </div>
          </div>
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
          <div>
            <h3>Code template</h3>
          </div>
          <Textarea class="text-area" v-model="codeInput" @drop.prevent />
        </div>
      </div>
      <div class="half-width generated-code-container">
        <div class="text-area-group">
          <div class="title-bar">
            <h3>Output Preview (Allergy Intolerance model)</h3>
          </div>
          <Textarea disabled class="text-area" v-model="generatedCode" @drop.prevent spellcheck="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { onMounted, Ref, ref, watch } from "vue";
import EntityService from "@/services/EntityService";
import { DataModelProperty, TTIriRef } from "../interfaces/AutoGen";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { RDFS, SHACL, XSD } from "@/vocabulary";
import { cloneDeep } from "lodash-es";
import CodeGenService from "@/services/CodeGenService";
import { generateCode } from "@/helpers";
import { CodeTemplate } from "@/interfaces";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const nameInput = ref("");
const codeInput = ref("");
const fileExtensionInput = ref("");
const collectionWrapperInput = ref("");
const datatypeMapInput: Ref<any> = ref([{ code: "", replace: "" }]);
const templateDropdownList: Ref<any> = ref([]);
const generatedCode = ref();
const templateMenu = ref();
const complexTypes = ref(false);
let modelData: any = null;

onMounted(async () => {
  await init();
});

watch([codeInput, collectionWrapperInput, nameInput, complexTypes], () => {
  console.log("Something changed!");
  convert();
});

watch(
  () => cloneDeep(datatypeMapInput.value),
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
  await getTemplateList();
  await setDefaultTemplate();
}

async function getTemplateList() {
  templateDropdownList.value = (await CodeGenService.getCodeTemplateList()).map(i => {
    return {
      label: i,
      command: () => loadTemplate(i)
    };
  });
}

async function setDefaultTemplate() {
  if (templateDropdownList.value.length > 0) {
    await loadTemplate(templateDropdownList.value[0].label);
  } else {
    fileExtensionInput.value = ".txt";
    complexTypes.value = false;
    codeInput.value = `WELCOME TO THE CODE GENERATOR!

This application allows you to create a simple text-based template and apply it to the Data Models within IM. It's initial aim was to generate Classes/Structures for use in various programming languages, but may also be used to generate documentation or data definitions such as JSON or XML.

The templates work via the use of placeholder variables, contained within "\${}".  There are model based variables...

  * NAMESPACE
  * MODEL NAME
  * MODEL COMMENT

...and property based variables...

  * PROPERTY NAME
  * DATA TYPE

The variable name casing can also be used to automatically apply various formatting functions, for example...

MODEL NAME - Original (unaltered) name : \${MODEL NAME}
Model Name - Title-case name           : \${Model Name}
model Name - Camel-case name           : \${model Name}
model name - Lower-case name           : \${model name}
MODELNAME  - Codify name               : \${MODELNAME}
ModelName  - Title-case codified name  : \${ModelName}
modelName  - Camel-case codified name  : \${modelName}
modelname  - Lower-case codified name  : \${modelname}

The property variables should be contained inside a "<template>...</template>", with the "#property" keyword, as shown below.

There is an additional "#array" template available to allow special cases for array (collection) properties.  Also note the "Collection wrapper" setting above which allows you to set the language specific array/collection format based on the base data type, for example...

List<\${BASE DATA TYPE}> : List<String>
\${BASE DATA TYPE}[]     : String[]

To aid in the correct development of a template, the right-hand side live-preview shows the template applied to the "\${MODEL NAME}" data model.

Here is a more complete example of the variables in use...

--------------------------------------------------------

NAMESPACE    : \${NAMESPACE}
MODEL NAME   : \${MODEL NAME}
MODEL COMMENT: \${MODEL COMMENT}

PROPERTIES:
<template #property>
  PROPERTY NAME: \${propertyName}
  PROPERTY TYPE: \${DataType}
  <template #array>    ** THIS IS AN ARRAY **
  </template #array>
</template #property>`;
    collectionWrapperInput.value = "List<${BASE DATA TYPE}>";
    datatypeMapInput.value = [{ code: XSD.STRING, replace: "String" }];
    nameInput.value = "Documentation";
  }
  await convert();
}
async function convert() {
  if (modelData == null)
    modelData = await EntityService.getPartialEntity("http://endhealth.info/im#AllergyIntoleranceAndAdverseReaction", [
      RDFS.LABEL,
      RDFS.COMMENT,
      SHACL.PROPERTY
    ]);
  const iri: TTIriRef = {
    "@id": modelData["@id"],
    name: modelData[RDFS.LABEL],
    description: modelData[RDFS.COMMENT]
  };

  const newProperties = await getProperties(modelData);

  generateCodeWithTemplate(codeInput.value, iri, newProperties);
}

async function saveTemplate() {
  const template = {
    name: nameInput.value,
    extension: fileExtensionInput.value,
    complexTypes: complexTypes.value,
    collectionWrapper: collectionWrapperInput.value,
    datatypeMap: Object.fromEntries(datatypeMapInput.value.map((obj: any) => [obj.code, obj.replace] as const)),
    template: codeInput.value
  };
  await CodeGenService.updateCodeTemplate(template);
  toast.add({
    severity: "success",
    summary: "Template saved",
    detail: "Successfully saved template " + template.name,
    life: 3000
  });
  await getTemplateList();
}

function toggleLoad(event: any) {
  templateMenu.value.toggle(event);
}

async function loadTemplate(name: string) {
  let newTemplate;
  if (name) {
    newTemplate = await CodeGenService.getCodeTemplate(name);
    nameInput.value = newTemplate.name ? newTemplate.name : "";
    codeInput.value = newTemplate.template ? newTemplate.template : "";
    fileExtensionInput.value = newTemplate.extension ? newTemplate.extension : "";
    collectionWrapperInput.value = newTemplate.collectionWrapper ? newTemplate.collectionWrapper : "";
    complexTypes.value = newTemplate.complexTypes ? newTemplate.complexTypes : false;
    datatypeMapInput.value = [];
    if (newTemplate.datatypeMap) for (let [key, value] of Object.entries(newTemplate.datatypeMap)) datatypeMapInput.value.push({ code: key, replace: value });
    else datatypeMapInput.value = [{ code: "", replace: "" }];
  }
}

async function getProperties(entity: any): Promise<DataModelProperty[]> {
  const newProperties: DataModelProperty[] = [];
  for (let prop in entity[SHACL.PROPERTY]) {
    const maxExclusive = entity[SHACL.PROPERTY][prop][SHACL.MAXCOUNT] === 1 ? entity[SHACL.PROPERTY][prop][SHACL.MAXCOUNT] : "";

    let datatype;

    if (isArrayHasLength(entity[SHACL.PROPERTY][prop][SHACL.DATATYPE])) datatype = entity[SHACL.PROPERTY][prop][SHACL.DATATYPE][0];
    else if (complexTypes.value) datatype = entity[SHACL.PROPERTY][prop][SHACL.PATH][0];

    if (datatype) {
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
  }
  return newProperties;
}

function generateCodeWithTemplate(template: string, iri: TTIriRef, properties: DataModelProperty[]) {
  const map: any = {};
  datatypeMapInput.value.forEach((m: any) => (map[m.code] = m.replace));

  const codeTemplate: CodeTemplate = {
    fileExtension: fileExtensionInput.value,
    collectionWrapper: collectionWrapperInput.value,
    template: template,
    datatypeMap: map
  };

  generatedCode.value = generateCode(codeTemplate, iri, properties, "org.endavourhealth.im");
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

.generated-code-container {
  position: sticky;
  top: 0;
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
  min-height: 20rem;
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

.button-group {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.save-button {
  text-align: right;
}
</style>
