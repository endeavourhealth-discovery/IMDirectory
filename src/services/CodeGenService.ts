import Env from "./Env";
import axios from "axios";

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
  async generateCode(namespace: string, template: string): Promise<any> {
    return axios.get(Env.API + "api/codeGen/public/generateCode", {
      params: {
        template,
        namespace
      },
      responseType: "blob"
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(CodeGenService);

export default CodeGenService;
