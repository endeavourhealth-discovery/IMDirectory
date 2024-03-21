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
        <div class="title-bar">
          <span>Template</span>
          <div class="button-group">
            <div>
              <InputText placeholder="Template name" v-model="nameInput"></InputText>
              <Button type="button" icon="fa-solid fa-chevron-down" @click="toggleLoad" aria-haspopup="true" aria-controls="overlay_menu" />
            </div>
            <Menu ref="templateMenu" id="overlay_menu" :model="templateDropdownList" :popup="true" />
            <Button :disabled="!nameInput.length" class="save-button" label="Save template" @click="saveTemplate" />
          </div>
        </div>
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
            <span>Code template</span>
          </div>
          <Textarea class="text-area" v-model="codeInput" @drop.prevent />
        </div>
      </div>
      <div class="half-width generated-code-container">
        <div class="text-area-group">
          <div class="title-bar">
            <span>Generated Code</span>
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
import entityService from "@/services/EntityService";
import { DataModelProperty, TTIriRef } from "../interfaces/AutoGen";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { RDFS, SHACL } from "@im-library/vocabulary";
import _ from "lodash";
import CodeGenService from "@/services/CodeGenService";
import { generateCode } from "@im-library/helpers";
import { CodeTemplate } from "@im-library/interfaces";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const nameInput = ref("");
const codeInput = ref("");
const fileExtensionInput = ref("");
const collectionWrapperInput = ref("");
const datatypeMapInput: Ref<any> = ref([]);
const templateDropdownList: Ref<any> = ref([]);
const generatedCode = ref();
const templateMenu = ref();
let modelData: any = null;

onMounted(async () => {
  await init();
});

watch([codeInput, collectionWrapperInput, nameInput], () => {
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
    nameInput.value = "java";
  }
  await convert();
}
async function convert() {
  if (modelData == null) modelData = await entityService.getPartialEntity("http://endhealth.info/im#Organisation", [RDFS.LABEL, RDFS.COMMENT, SHACL.PROPERTY]);

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
    collectionWrapper: collectionWrapperInput.value,
    datatypeMap: JSON.stringify(datatypeMapInput.value),
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
    datatypeMapInput.value = newTemplate.datatypeMap ? JSON.parse(newTemplate.datatypeMap) : [{ code: "", replace: "" }];
  }
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
