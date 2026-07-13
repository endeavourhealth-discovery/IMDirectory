import type { CodeGen } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/codeGen/public";

const CodeGenService = {
  async getCodeTemplateList(): Promise<string[]> {
    return await api.get(API_URL + "/codeTemplates");
  },
  async getCodeTemplate(name: string): Promise<CodeGen> {
    return await api.get(API_URL + "/codeTemplate", {
      params: {
        templateName: name
      }
    });
  },
  async updateCodeTemplate(template: CodeGen): Promise<string> {
    return await api.post(API_URL + "/codeTemplate", template);
  },
  async generateCodeForAllModels(namespace: string, template: string): Promise<Blob> {
    return await api.get(API_URL + "/generateCode", {
      params: {
        template,
        namespace
      },
      responseType: "blob"
    });
  },
  async generateCodeForModel(template: CodeGen, modelIri: string, namespace: string): Promise<string> {
    return await api.post(API_URL + "/generateCodePreview", template, {
      params: {
        iri: modelIri,
        namespace
      }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(CodeGenService);

export default CodeGenService;
