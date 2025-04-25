import Env from "./Env";
import axios from "axios";
import { CodeTemplate } from "@/interfaces";

const CodeGenService = {
  async getCodeTemplateList(): Promise<any[]> {
    return await axios.get(Env.API + "api/codeGen/public/codeTemplates");
  },
  async getCodeTemplate(name: string): Promise<any> {
    return await axios.get(Env.API + "api/codeGen/public/codeTemplate", {
      params: {
        templateName: name
      }
    });
  },
  async updateCodeTemplate(template: any): Promise<string> {
    return await axios.post(Env.API + "api/codeGen/public/codeTemplate", template);
  },
  async generateCodeForAllModels(namespace: string, template: string): Promise<any> {
    return axios.get(Env.API + "api/codeGen/public/generateCode", {
      params: {
        template,
        namespace
      },
      responseType: "blob"
    });
  },
  async generateCodeForModel(template: CodeTemplate, modelIri: string, namespace: string): Promise<string> {
    return axios.post(Env.API + "api/codeGen/public/generateCodePreview", template, {
      params: {
        iri: modelIri,
        namespace
      }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(CodeGenService);

export default CodeGenService;
