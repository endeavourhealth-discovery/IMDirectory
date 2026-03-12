import Env from "./Env";
import axios from "axios";
import { CodeTemplate } from "@/interfaces";
import { CodeGenDto } from "@/interfaces/AutoGen";

const API_URL = Env.API + "api/codeGen/public";

const CodeGenService = {
  async getCodeTemplateList(): Promise<string[]> {
    return await axios.get(API_URL + "/codeTemplates");
  },
  async getCodeTemplate(name: string): Promise<CodeGenDto> {
    return await axios.get(API_URL + "/codeTemplate", {
      params: {
        templateName: name
      }
    });
  },
  async updateCodeTemplate(template: CodeGenDto): Promise<string> {
    return await axios.post(API_URL + "/codeTemplate", template);
  },
  async generateCodeForAllModels(namespace: string, template: string): Promise<Blob> {
    return await axios.get(API_URL + "/generateCode", {
      params: {
        template,
        namespace
      },
      responseType: "blob"
    });
  },
  async generateCodeForModel(template: CodeTemplate, modelIri: string, namespace: string): Promise<string> {
    return await axios.post(API_URL + "/generateCodePreview", template, {
      params: {
        iri: modelIri,
        namespace
      }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(CodeGenService);

export default CodeGenService;
