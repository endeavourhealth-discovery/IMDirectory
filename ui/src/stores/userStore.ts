import { defineStore } from 'pinia'
import { User } from "@im-library/interfaces";
import { UserState } from "@/stores/userState";

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: {} as User,
  }),
  actions: {
    updateCurrentUser(user: any) {
      this.currentUser = user;
    }
  }
});
