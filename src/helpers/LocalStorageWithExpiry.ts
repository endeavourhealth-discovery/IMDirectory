import { GenericObject } from "@/interfaces/GenericObject";
import { isObjectHasKeys } from "./DataTypeCheckers";

const localStorageWithExpiry = {
  getItem(key: string) {
    const lsItem = window.localStorage.getItem(key);
    if (lsItem) {
      try {
        const result = JSON.parse(lsItem);
        if (isObjectHasKeys(result, ["data", "expireTime"])) {
          if (result.expireTime <= Date.now()) {
            window.localStorage.removeItem(key);
            return null;
          }
          return result.data;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        console.log(`Error getting item from local storage: ${e}. Removing item wth key: ${key}.`);
        window.localStorage.removeItem(key);
      }
      return null;
    }
    return null;
  },
  setItem(key: string, data: any, maxAge: number = 30 * 24 * 60 * 60 * 1000) {
    // default maxAge 30 days
    const result: { data: GenericObject; expireTime: number } = {
      data: data,
      expireTime: Date.now() + maxAge
    };
    window.localStorage.setItem(key, JSON.stringify(result));
  },
  removeItem(key: string) {
    window.localStorage.removeItem(key);
  },
  clear() {
    window.localStorage.clear();
  }
};

export default localStorageWithExpiry;
