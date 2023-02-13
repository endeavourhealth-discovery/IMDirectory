import Env from "./Env";
import axios from "axios";

const ParserService = {
  async getListFromText(text: string): Promise<string[]> {
    try {
      return await axios.post(Env.VITE_NODE_API + "node_api/parser/public/text/list", { text: text });
    } catch (error) {
      return [];
    }
  },

  async getListFromFile(file: any, selectedColumn: string): Promise<string[]> {
    try {
      return await axios.post(Env.VITE_NODE_API + "node_api/parser/public/file/list", { file: file, selectedColumn: selectedColumn });
    } catch (error) {
      return [];
    }
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(ParserService);

export default ParserService;
