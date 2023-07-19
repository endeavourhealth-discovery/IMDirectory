import { defineStore } from "pinia";
import { UprnState } from "./types/uprnState";

export const useUprnStore = defineStore("uprn", {
    state: (): UprnState => ({
        welcome: [] as string[],
        customer_name: [] as any,
        organisation: [] as any,
        date_registered: [] as any
    }),
    actions: {
        updateWelcome(welcome: any) {
            this.welcome = welcome;
        },
        updateRegDate(date: any) {
          this.date_registered = date;
        },
        updateCustomerName(name: any) {
            this.customer_name = name;
        },
        updateOrg(org: any) {
            this.organisation = org;
        }
    }
});