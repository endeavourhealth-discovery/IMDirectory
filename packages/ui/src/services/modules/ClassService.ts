import { Field, FieldDto } from "im-library/interfaces";
import Env from "./Env";
import axios from "axios";
const api = Env.API;
const ClassService = {
  async getClassProperties(className: string): Promise<Field[]> {
    try {
      return await axios.get(api + "api/class/public/classProperties", {
        params: {
          className: className
        }
      });
    } catch (error) {
      return [] as Field[];
    }
  },

  async getClassFields(className: string): Promise<FieldDto[]> {
    try {
      return await axios.get(api + "api/class/public/classFields", {
        params: {
          className: className
        }
      });
    } catch (error) {
      return [] as FieldDto[];
    }
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ClassService);

export default ClassService;
