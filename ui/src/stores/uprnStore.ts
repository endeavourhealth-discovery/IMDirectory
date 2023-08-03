import { defineStore } from "pinia";
import { UprnState } from "./types/uprnState";

export const useUprnStore = defineStore("uprn", {
  state: (): UprnState => ({}),
  actions: {}
});
