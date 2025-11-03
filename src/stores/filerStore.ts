import { defineStore } from "pinia";
import { useUserStore } from "@/stores/userStore";
import localStorageWithExpiry from "@/helpers/LocalStorageWithExpiry";
import { FilerState } from "@/stores/types/filerState";

export const useFilerStore = defineStore("filer", {
  state: (): FilerState => ({
    filerSelectedIri: localStorageWithExpiry.getItem("filerSelectedIri") ?? {}
  }),
  actions: {
    updateFilerIri(iri: string) {
      this.filerSelectedIri = iri;
      if (useUserStore().cookiesOptionalAccepted) localStorageWithExpiry.setItem("filerSelectedIri", iri);
    }
  }
});
