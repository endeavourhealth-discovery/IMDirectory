import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

export default class ParserService {
  constructor() {}

  getListFromText(text: string): string[] {
    const result = text.match(/\d+/g);
    return result?.filter(code => code.length >= 6) as string[];
  }

  getListFromFile(file: any, selectedColumn: string) {
    let codeList: string[] = [];
    const headers = [];
    for (const column of Object.keys(file[0])) {
      headers.push(column);
    }

    for (const row of file) {
      if (selectedColumn) {
        const rowArray = this.getListFromText(row[selectedColumn] as string);
        if (isArrayHasLength(rowArray)) codeList = codeList.concat(rowArray);
      } else {
        for (const key of headers) {
          const rowArray = this.getListFromText(row[key] as string);
          if (isArrayHasLength(rowArray)) codeList = codeList.concat(rowArray);
        }
      }
    }
    return codeList;
  }
}
