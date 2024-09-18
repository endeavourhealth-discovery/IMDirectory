import Env from "./Env";
import axios from "axios";
const api = Env.API;
const FilerService = {
  moveFolder(entity: string, oldFolder: string, newFolder: string): Promise<void> {
    return axios.post(api + "api/filer/folder/move", null, {
      params: {
        entity,
        oldFolder,
        newFolder
      }
    });
  },

  addToFolder(entity: string, folder: string): Promise<void> {
    return axios.post(api + "api/filer/folder/add", null, {
      params: {
        entity,
        folder
      }
    });
  },

  async createFolder(container: string, name: string): Promise<string> {
    return axios.post(api + "api/filer/folder/create", null, {
      params: {
        container: container,
        name: name
      }
    });
  },

  async downloadDeltas(): Promise<any> {
    return axios.get(api + "api/filer/deltas/download", { responseType: "blob" });
  },

  async fileEntity(entity: any, graph: string, crud: string): Promise<void> {
    return axios.post(api + "api/filer/file/entity", entity, {
      params: {
        graph,
        crud
      }
    });
  },

  async fileDocument(document: any, withoutTransaction?: any): Promise<any> {
    return axios.post(api + "api/filer/file/document", document, {
      params: {
        withoutTransaction
      }
    });
  },

  async getTaskProgress(taskId: string): Promise<any> {
    return axios.get(api + `api/filer/file/document/${taskId}`);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(FilerService);

export default FilerService;
