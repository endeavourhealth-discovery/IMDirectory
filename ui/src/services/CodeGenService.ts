import Env from "./Env";
import axios from "axios";

const CodeGenService = {
  async getCodeTemplateList(): Promise<any[]> {
    return await axios.get(Env.API + "api/codeGen/codeTemplates");
  },
  async getCodeTemplate(name: string): Promise<any> {
    return await axios.get(Env.API + "api/codeGen/codeTemplate", {
      params: {
        templateName: name
      }
    });
  },
  async saveCodeTemplate(template: any): Promise<string> {
    return await axios.post(Env.API + "api/codeGen/codeTemplate", template);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(CodeGenService);

export default CodeGenService;
