import { TTDocument } from "@/interfaces/AutoGen";
import Env from "./Env";
import axios from "axios";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";
const api = Env.API;
const FilerService = {
  async moveFolder(entity: string, oldFolder: string, newFolder: string): Promise<void> {
    return await axios.post(api + "api/filer/folder/move", null, {
      params: {
        entity,
        oldFolder,
        newFolder
      }
    });
  },

  async addToFolder(entity: string, folder: string): Promise<void> {
    return await axios.post(api + "api/filer/folder/add", null, {
      params: {
        entity,
        folder
      }
    });
  },

  async createFolder(container: string, name: string): Promise<string> {
    return await axios.post(api + "api/filer/folder/create", null, {
      params: {
        container: container,
        name: name
      }
    });
  },

  async downloadDeltas(): Promise<Blob> {
    return await axios.get(api + "api/filer/deltas/download", { responseType: "blob" });
  },

  async fileEntity(entity: TTEntity, graph: string, crud: string): Promise<void> {
    return await axios.post(api + "api/filer/file/entity", entity, {
      params: {
        graph,
        crud
      }
    });
  },

  async fileDocument(document: TTDocument): Promise<{ [x: string]: string }> {
    return await axios.post(api + "api/filer/file/document", document);
  },

  async getTaskProgress(taskId: string): Promise<{ [x: string]: number }> {
    return await axios.get(api + `api/filer/file/document/${taskId}`);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(FilerService);

export default FilerService;
