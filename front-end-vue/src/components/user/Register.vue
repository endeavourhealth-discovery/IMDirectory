<template>
  <Card class="p-d-flex p-flex-column p-jc-sm-around p-ai-center register-card">
    <template #header>
      <avatar-with-selector :selectedAvatar="selectedAvatar" @avatarSelected="updateAvatar" />
    </template>
    <template #title>
      Register
    </template>
    <template #content>
      <div class="p-fluid register-form">
        <div class="p-field">
          <label for="fieldUsername">Username</label>
          <InputText id="fieldUsername" type="text" maxlength="50" v-model="username" v-on:blur="setShowUsernameNotice" />
          <InlineMessage v-if="showUsernameNotice" severity="error">
            Username contains unexpected characters. A-Z, 0-9 and hyphen/underscore(-_) only allowed e.g."John-Doe2"
          </InlineMessage>
        </div>
        <div class="p-field">
          <label for="fieldEmail1">Email address</label>
          <div class="p-d-flex p-flex-row p-ai-center">
            <InputText
              id="fieldEmail1"
              type="text"
              maxlength="50"
              v-model="email1"
              v-on:focus="setShowEmail1Notice(true)"
              v-on:blur="setShowEmail1Notice(false)"
            />
            <i v-if="showEmail1Notice && email1Verified" class="pi pi-check-circle email-check" aria-hidden="true" />
            <i v-if="showEmail1Notice && !email1Verified" class="pi pi-times-circle email-times" aria-hidden="true" />
          </div>
        </div>
        <div class="p-field">
          <label for="fieldEmail2">Confirm email address</label>
          <InputText id="fieldEmail2" type="text" maxlength="50" v-model="email2" v-on:blur="setShowEmail2Notice" />
          <InlineMessage v-if="showEmail2Notice" severity="error">
            Email addresses do not match!
          </InlineMessage>
        </div>
        <div class="p-field">
          <label for="fieldFirstName">First name</label>
          <InputText id="fieldFirstName" type="text" maxlength="50" v-model="firstName" v-on:blur="setShowFirstNameNotice" />
          <InlineMessage v-if="showFirstNameNotice" severity="error">
            First name contains unexpected characters. A-Z and hyphens only allowed e.g."Mary-Anne"
          </InlineMessage>
        </div>
        <div class="p-field">
          <label for="fieldLastName">Last name</label>
          <InputText id="fieldLastName" type="text" maxlength="50" v-model="lastName" v-on:blur="setShowLastNameNotice" />
          <InlineMessage v-if="showLastNameNotice" severity="error">
            Last name contains unexpected characters. A-Z, apostropies and hyphens only allowed e.g."O'Keith-Smith"
          </InlineMessage>
        </div>
        <div class="p-field">
          <label for="fieldPassword1">Password</label>
          <InputText id="fieldPassword1" type="password" maxlength="50" aria-describedby="password-help" v-model="password1" />
          <InlineMessage v-if="passwordStrength === 'strong'" severity="success">
            Password strength: Strong
          </InlineMessage>
          <InlineMessage v-if="passwordStrength === 'medium'" severity="success">
            Password strength: Medium
          </InlineMessage>
          <InlineMessage v-if="passwordStrength === 'weak'" severity="warn">
            Password strength: Weak
          </InlineMessage>
          <InlineMessage v-if="passwordStrength === 'fail' && password1 !== ''" severity="error">
            Invalid password
          </InlineMessage>
          <small id="password-help">
            Password must be a minimum length of 8 characters. Improve password strength with a mixture of UPPERCASE, lowercase, numbers and special characters
            [!@#$%^&*].
          </small>
        </div>
        <div class="p-field">
          <label for="fieldPassword2">Confirm password</label>
          <InputText id="fieldPassword2" type="password" maxlength="50" v-model="password2" v-on:blur="setShowPassword2Notice" @keyup="checkKey" />
          <InlineMessage v-if="showPassword2Notice" severity="error">
            Passwords do not match!
          </InlineMessage>
        </div>
        <div class="p-d-flex p-flex-row p-jc-center">
          <Button v-if="!allVerified()" class="user-submit" type="submit" label="Register" disabled v-on:click.prevent="handleSubmit" />
          <Button v-else class="user-submit" type="submit" label="Register" v-on:click.prevent="handleSubmit" />
        </div>
      </div>
    </template>
    <template #footer>
      <span>
        Already have an account?
        <a id="login-link" class="footer-link" @click="$router.push({ name: 'Login' })">Login here</a>
      </span>
    </template>
  </Card>
</template>

<script lang="ts">
import { User } from "@/models/user/User";
import { PasswordStrength } from "@/models/user/PasswordStrength";
import Swal from "sweetalert2";
import { verifyIsUsername, verifyIsEmail, verifyPasswordsMatch, verifyEmailsMatch, verifyIsName, checkPasswordStrength } from "@/helpers/UserMethods";
import AuthService from "@/services/AuthService";
import { avatars } from "@/models/user/Avatars";
import AvatarWithSelector from "./AvatarWithSelector.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Register",
  components: {
    "avatar-with-selector": AvatarWithSelector
  },
  emits: { userCreated: (payload: User) => true },
  watch: {
    username(newValue) {
      this.usernameVerified = verifyIsUsername(newValue);
    },
    email1(newValue) {
      this.email1Verified = verifyIsEmail(newValue);
    },
    email2(newValue) {
      this.emailsMatch = verifyEmailsMatch(this.email1, newValue);
    },
    firstName(newValue) {
      this.firstNameVerified = verifyIsName(newValue);
    },
    lastName(newValue) {
      this.lastNameVerified = verifyIsName(newValue);
    },
    password1(newValue) {
      this.passwordStrength = checkPasswordStrength(newValue);
    },
    password2(newValue) {
      this.passwordsMatch = verifyPasswordsMatch(this.password1, newValue);
    }
  },

  data() {
    return {
      username: "",
      usernameVerified: false,
      email1: "",
      email1Verified: false,
      email2: "",
      emailsMatch: false,
      firstName: "",
      firstNameVerified: false,
      lastName: "",
      lastNameVerified: false,
      password1: "",
      password2: "",
      passwordStrength: PasswordStrength.fail as PasswordStrength,
      passwordsMatch: false,
      showEmail1Notice: false,
      showEmail2Notice: false,
      showPassword2Notice: false,
      showUsernameNotice: false,
      showFirstNameNotice: false,
      showLastNameNotice: false,
      selectedAvatar: avatars[0]
    };
  },

  methods: {
    setShowUsernameNotice(): void {
      this.showUsernameNotice = this.usernameVerified ? false : true;
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

    handleSubmit(): void {
      if (this.allVerified()) {
        const user = new User(this.username, this.firstName, this.lastName, this.email1.toLowerCase(), this.password1, this.selectedAvatar);
        AuthService.register(user)
          .then(res => {
            if (res.status === 201) {
              Swal.fire({
                icon: "success",
                title: "Success",
                text: res.message,
                showCancelButton: true,
                confirmButtonText: "Continue"
              }).then(result => {
                this.$emit("userCreated", user);
                if (result.isConfirmed) {
                  this.$store.commit("updateRegisteredUsername", this.username);
                  this.$router.push({ name: "ConfirmCode" });
                } else {
                  this.clearForm();
                }
              });
            } else if (res.status === 409) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Username already taken. Please pick another username",
                confirmButtonText: "Close"
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: res.message,
                confirmButtonText: "Close"
              });
            }
          })
          .catch(err => {
            console.error(err);
          });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User creation failed. Check input data.",
          confirmButtonText: "Close"
        });
      }
    },

    clearForm(): void {
      this.username = "";
      this.usernameVerified = false;
      this.email1 = "";
      this.email1Verified = false;
      this.email2 = "";
      this.emailsMatch = false;
      this.firstName = "";
      this.lastName = "";
      this.password1 = "";
      this.password2 = "";
      this.passwordStrength = PasswordStrength.fail;
      this.passwordsMatch = false;
      this.showEmail1Notice = false;
      this.showEmail2Notice = false;
      this.showPassword2Notice = false;
      this.showFirstNameNotice = false;
      this.showLastNameNotice = false;
      this.selectedAvatar = avatars[0];
    },

    allVerified(): boolean {
      if (
        verifyIsUsername(this.username) &&
        verifyIsEmail(this.email1) &&
        verifyIsEmail(this.email2) &&
        verifyEmailsMatch(this.email1, this.email2) &&
        verifyPasswordsMatch(this.password1, this.password2) &&
        this.passwordStrength !== PasswordStrength.fail &&
        verifyIsName(this.firstName) &&
        verifyIsName(this.lastName) &&
        this.selectedAvatar
      ) {
        return true;
      } else {
        return false;
      }
    },

    updateAvatar(newValue: string): void {
      this.selectedAvatar = newValue;
    },

    checkKey(event: any): void {
      if (event.keyCode === 13) {
        this.handleSubmit();
      }
    }
  }
});
</script>

<style scoped>
.user-submit {
  width: fit-content !important;
}

#password-help {
  overflow-wrap: break-word;
}

.register-card {
  padding: 0 2em;
}

.register-form {
  max-width: 32em;
}

.footer-link:hover {
  cursor: pointer;
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
