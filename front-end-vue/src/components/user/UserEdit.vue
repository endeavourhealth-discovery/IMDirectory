<template>
  <div v-if="isLoggedIn" class="p-d-flex p-flex-row p-ai-center">
    <Card class="p-d-flex p-flex-column p-jc-sm-around p-ai-center user-edit-card">
      <template #header>
        <avatar-with-selector :selectedAvatar="selectedAvatar" @avatarSelected="updateAvatar" />
      </template>
      <template #title>
        Edit my account
      </template>
      <template #content>
        <div class="p-fluid p-d-flex p-flex-column p-jc-start user-edit-form">
          <div class="p-field">
            <label for="username">Username</label>
            <InputText id="username" type="text" v-model="username" disabled />
            <small id="user-help">Username cannot currently be changed.</small>
          </div>
          <div class="p-field">
            <label for="firstName">First name</label>
            <InputText id="firstName" type="text" v-model="firstName" v-on:blur="setShowFirstNameNotice" />
            <InlineMessage v-if="showFirstNameNotice" severity="error">
              First name contains unexpected characters. A-Z and hyphens only allowed e.g."Mary-Anne".
            </InlineMessage>
          </div>
          <div class="p-field">
            <label for="lastName">Last name</label>
            <InputText id="lastName" type="text" v-model="lastName" v-on:blur="setShowLastNameNotice" />
            <InlineMessage v-if="showLastNameNotice" severity="error">
              Last name contains unexpected characters. A-Z, apostropies and hyphens only allowed e.g."O'Keith-Smith".
            </InlineMessage>
          </div>
          <div class="p-field">
            <label for="email1">Email address</label>
            <div class="p-d-flex p-flex-row p-ai-center">
              <InputText id="email1" type="text" v-model="email1" v-on:focus="setShowEmail1Notice(true)" v-on:blur="setShowEmail1Notice(false)" />
              <i v-if="showEmail1Notice && email1Verified" class="pi pi-check-circle email-check" aria-hidden="true" />
              <i v-if="showEmail1Notice && !email1Verified" class="pi pi-times-circle email-times" aria-hidden="true" />
            </div>
          </div>
          <div class="p-field">
            <label for="email2">Confirm email address</label>
            <InputText id="email2" type="text" v-model="email2" v-on:blur="setShowEmail2Notice()" />
            <InlineMessage v-if="showEmail2Notice" severity="error">
              Email addresses do not match!
            </InlineMessage>
          </div>
          <div v-if="showPasswordEdit" class="p-field">
            <label for="passwordOld">Current password</label>
            <InputText id="passwordOld" type="password" v-model="passwordOld" />
          </div>
          <div v-if="showPasswordEdit" class="p-field">
            <label for="passwordNew1">New password</label>
            <InputText id="passwordNew1" type="password" v-model="passwordNew1" />
            <InlineMessage v-if="passwordStrength === 'strong'" severity="success">
              Password strength: Strong
            </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'medium'" severity="success">
              Password strength: Medium
            </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'weak'" severity="warn">
              Password strength: Weak
            </InlineMessage>
            <InlineMessage v-if="passwordStrength === 'fail' && passwordNew1 !== ''" severity="error">
              Invalid password
            </InlineMessage>
            <small id="password-help">
              Password must be a minimum length of 8 characters. Improve password strength with a mixture of UPPERCASE, lowercase, numbers and special
              characters [!@#$%^&*].
            </small>
          </div>
          <div v-if="showPasswordEdit" class="p-field">
            <label for="passwordNew2">Confirm new password</label>
            <InputText id="passwordNew2" type="password" v-model="passwordNew2" v-on:blur="setShowPassword2Notice" />
            <InlineMessage v-if="showPassword2Notice" severity="error">
              New passwords do not match
            </InlineMessage>
          </div>
          <div class="p-d-flex p-flex-row p-jc-between p-ai-center">
            <Button
              v-if="!showPasswordEdit"
              class="password-edit p-button-secondary"
              type="submit"
              label="Change password"
              v-on:click.prevent="editPasswordClicked(true)"
            />
            <Button
              v-else
              class="password-edit p-button-secondary"
              type="submit"
              label="Cancel password edit"
              v-on:click.prevent="editPasswordClicked(false)"
            />
            <Button class="form-reset p-button-warning" type="button" label="Reset changes" v-on:click.prevent="resetForm" />
            <Button v-if="setButtonDisabled()" class="user-edit" type="submit" label="Update account" disabled v-on:click.prevent="handleEditSubmit" />
            <Button v-else class="user-edit" type="submit" label="Update account" v-on:click.prevent="handleEditSubmit" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { User } from "@/models/user/User";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { verifyIsEmail, verifyPasswordsMatch, verifyEmailsMatch, verifyIsName, checkPasswordStrength } from "@/helpers/UserMethods";
import { PasswordStrength } from "@/models/user/PasswordStrength";
import AuthService from "@/services/AuthService";
import { avatars } from "@/models/user/Avatars";
import AvatarWithSelector from "./AvatarWithSelector.vue";

export default defineComponent({
  name: "UserEdit",
  components: {
    "avatar-with-selector": AvatarWithSelector
  },
  computed: mapState(["currentUser", "isLoggedIn"]),
  watch: {
    email1(newValue) {
      this.email1Verified = verifyIsEmail(newValue);
    },
    email2(newValue) {
      this.emailsMatch = verifyEmailsMatch(this.email1, newValue);
    },
    passwordOld(newValue) {
      this.passwordStrengthOld = checkPasswordStrength(newValue);
    },
    passwordNew1(newValue) {
      this.passwordStrength = checkPasswordStrength(newValue);
    },
    passwordNew2(newValue) {
      this.passwordsMatch = verifyPasswordsMatch(this.passwordNew1, newValue);
    },
    firstName(newValue) {
      this.firstNameVerified = verifyIsName(newValue);
    },
    lastName(newValue) {
      this.lastNameVerified = verifyIsName(newValue);
    }
  },
  data() {
    return {
      username: "",
      firstName: "",
      firstNameVerified: false,
      lastName: "",
      lastNameVerified: false,
      email1: "",
      email2: "",
      email1Verified: false,
      emailsMatch: false,
      showEmail1Notice: false,
      showEmail2Notice: false,
      passwordOld: "",
      passwordNew1: "",
      passwordNew2: "",
      passwordStrength: PasswordStrength.fail as PasswordStrength,
      passwordStrengthOld: PasswordStrength.fail as PasswordStrength,
      showPasswordEdit: false,
      passwordsMatch: false,
      showPassword2Notice: false,
      showFirstNameNotice: false,
      showLastNameNotice: false,
      selectedAvatar: avatars[0],
      avatarOptions: avatars
    };
  },
  mounted() {
    if (this.currentUser && this.isLoggedIn) {
      this.username = this.currentUser.username;
      this.firstName = this.currentUser.firstName;
      this.lastName = this.currentUser.lastName;
      this.email1 = this.currentUser.email;
      this.email2 = this.currentUser.email;
      this.selectedAvatar = this.currentUser.avatar;
    }
  },
  methods: {
    editPasswordClicked(result: boolean): void {
      if (result === false) {
        this.passwordOld = "";
        this.passwordNew1 = "";
        this.passwordNew2 = "";
      }
      this.showPasswordEdit = result;
    },

    setShowEmail1Notice(result: boolean): void {
      this.showEmail1Notice = result;
    },

    setShowEmail2Notice(): void {
      this.showEmail2Notice = this.emailsMatch ? false : true;
    },

    setShowPassword2Notice(): void {
      this.showPassword2Notice = this.passwordsMatch ? false : true;
    },

    setShowFirstNameNotice(): void {
      this.showFirstNameNotice = this.firstNameVerified ? false : true;
    },

    setShowLastNameNotice(): void {
      this.showLastNameNotice = this.lastNameVerified ? false : true;
    },

    async swalert(icon: SweetAlertIcon, title: string, text: string) {
      Swal.fire({
        icon: icon,
        title: title,
        text: text
      });
    },

    handleFieldsVerified(handlePasswordChange: boolean) {
      const updatedUser = new User(this.username, this.firstName, this.lastName, this.email1, "", this.selectedAvatar);
      updatedUser.setId(this.currentUser.id);
      AuthService.updateUser(updatedUser).then(res => {
        if (res.status === 200) {
          if (!handlePasswordChange) {
            this.swalert("success", "Success", "Account details updated successfully.").then(() => {
              this.$store.commit("updateCurrentUser", res.user);
              this.$router.push({ name: "UserDetails" });
            });
          } else {
            AuthService.changePassword(this.passwordOld, this.passwordNew1).then(res2 => {
              res2.status === 200
                ? this.swalert("success", "Success", "User details and password successfully updated.")
                : this.swalert("error", "Error", "Password update failed, but user details updated successfully. " + res2.message);
              this.$store.commit("updateCurrentUser", res.user);
              this.$router.push({ name: "UserDetails" });
            });
          }
        } else {
          this.swalert("error", "Error", res.message);
        }
      });
    },

    handleEditSubmit(): void {
      if (this.userFieldsVerified() && this.passwordFieldsVerified()) {
        this.handleFieldsVerified(true);
      } else if (this.showPasswordEdit) {
        const message = !this.passwordDifferentFromOriginal()
          ? "New password can not be the same as the current password."
          : "Authentication failed. Please check your current password.";
        this.swalert("error", "Error", message);
      } else if (!this.checkForChanges()) {
        this.swalert("warning", "Nothing to update", "Your account details have not been updated.");
      } else if (this.userFieldsVerified()) {
        this.handleFieldsVerified(false);
      } else {
        this.swalert("error", "Error", "Error with user form");
      }
    },

    userFieldsVerified(): boolean {
      if (
        verifyIsEmail(this.email1) &&
        verifyIsEmail(this.email2) &&
        verifyEmailsMatch(this.email1, this.email2) &&
        verifyIsName(this.firstName) &&
        verifyIsName(this.lastName) &&
        this.selectedAvatar
      ) {
        return true;
      } else {
        return false;
      }
    },

    passwordFieldsVerified(): boolean {
      if (
        this.showPasswordEdit &&
        this.passwordsMatch &&
        this.passwordStrength !== PasswordStrength.fail &&
        this.passwordStrengthOld !== PasswordStrength.fail &&
        this.passwordDifferentFromOriginal()
      ) {
        return true;
      } else {
        return false;
      }
    },

    passwordDifferentFromOriginal(): boolean {
      return this.passwordOld !== this.passwordNew1 ? true : false;
    },

    resetForm(): void {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Are you sure that you want to reset changes to this form? Any changes you have made will be lost.",
        showCancelButton: true,
        confirmButtonText: "Reset changes",
        reverseButtons: true
      }).then(result => {
        if (result.isConfirmed) {
          this.username = this.currentUser.username;
          this.firstName = this.currentUser.firstName;
          this.lastName = this.currentUser.lastName;
          this.email1 = this.currentUser.email;
          this.email2 = this.currentUser.email;
          this.selectedAvatar = this.currentUser.avatar;
          this.showFirstNameNotice = false;
          this.showLastNameNotice = false;
          this.showEmail1Notice = false;
          this.showEmail2Notice = false;
          this.selectedAvatar = this.currentUser.avatar;
        }
      });
    },

    updateAvatar(newValue: string): void {
      this.selectedAvatar = newValue;
    },

    setButtonDisabled(): boolean {
      if (this.userFieldsVerified() && !this.showPasswordEdit && this.checkForChanges()) {
        return false;
      } else if (this.userFieldsVerified() && this.passwordFieldsVerified()) {
        return false;
      } else {
        return true;
      }
    },

    checkForChanges(): boolean {
      if (
        this.currentUser.firstName === this.firstName &&
        this.currentUser.lastName === this.lastName &&
        this.currentUser.email === this.email1 &&
        this.currentUser.avatar === this.selectedAvatar
      ) {
        return false;
      } else {
        return true;
      }
    }
  }
});
</script>

<style scoped>
.user-edit,
.password-edit,
.form-reset {
  width: fit-content !important;
}

.form-reset {
  margin: 10px 0px;
}

.user-edit-form {
  max-width: 32em;
}

.user-edit-card {
  padding: 0 2em;
}
.email-check {
  color: #439446;
  font-size: 2em;
}
.email-times {
  color: #e60017;
  font-size: 2em;
}
</style>
