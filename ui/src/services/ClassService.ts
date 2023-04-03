import { Field, FieldDto } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";
const api = Env.API;
const ClassService = {
  async getClassProperties(className: string): Promise<Field[]> {
    return await axios.get(api + "api/class/public/classProperties", {
      params: {
        className: className
      }
    });
  },

  async getClassFields(className: string): Promise<FieldDto[]> {
    return await axios.get(api + "api/class/public/classFields", {
      params: {
        className: className
      }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ClassService);

export default ClassService;
