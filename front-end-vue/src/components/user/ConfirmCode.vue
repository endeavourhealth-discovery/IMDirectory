<template>
  <div class="p-d-flex p-flex-row p-ai-center">
    <Card class="p-d-flex p-flex-column p-jc-sm-around p-ai-center confirm-card">
      <template #header>
        <i class="pi pi-fw pi-key icon-header" aria-hidden="true" />
      </template>
      <template #title>
        Confirmation Code
      </template>
      <template #content>
        <div class="p-fluid code-form">
          <div class="p-field">
            <label for="fieldUsername">Username</label>
            <InputText id="fieldUsername" type="text" v-model="username" :placeholder="username" />
          </div>
          <div class="p-field">
            <label for="fieldCode">Confirmation code</label>
            <div class="p-d-flex p-flex-row p-ai-center">
              <InputText id="fieldCode" type="password" v-model="code" />
              <i v-if="codeVerified" class="pi pi-check-circle password-check" aria-hidden="true" />
              <i v-if="!codeVerified && code !== ''" class="pi pi-times-circle password-times" aria-hidden="true" />
            </div>
            <small id="code-help">Your 6-digit code should arrive by email from<br />no-reply@verificationemail.com</small>
          </div>
          <div class="p-d-flex p-flex-row p-jc-center">
            <Button class="user-submit" type="submit" label="Submit" v-on:click.prevent="handleSubmit" />
          </div>
        </div>
      </template>
      <template #footer>
        <small
          >Not received a code? <br /><Button
            class="p-button-secondary p-button-sm code-request"
            type="submit"
            label="Request a new code"
            v-on:click.prevent="requestCode"
        /></small>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import AuthService from "@/services/AuthService";
import Swal from "sweetalert2";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ConfirmCode",
  computed: mapState(["registeredUsername"]),
  watch: {
    code() {
      this.verifyCode();
    }
  },
  data() {
    return {
      code: "",
      codeVerified: false,
      username: ""
    };
  },
  mounted() {
    if (this.registeredUsername && this.registeredUsername !== "") {
      this.username = this.registeredUsername;
    }
  },
  methods: {
    verifyCode() {
      this.codeVerified = /^(?=.{6,})/.test(this.code);
    },

    handleSubmit() {
      if (this.codeVerified && this.username !== "") {
        AuthService.confirmRegister(this.username, this.code)
          .then(res => {
            if (res.status === 200) {
              Swal.fire({
                icon: "success",
                title: "Success",
                text: res.message,
                confirmButtonText: "Login"
              }).then(() => {
                this.$store.commit("updateRegisteredUsername", this.username);
                this.$router.push({ name: "Login" });
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: res.message
              });
            }
          })
          .catch(err => {
            console.error(err);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Auth Service Error"
            });
          });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Invalid Credentials",
          text: "Username or Confirmation Code incorrect."
        });
      }
    },

    requestCode() {
      AuthService.resendConfirmationCode(this.username)
        .then(res => {
          if (res.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Code has been resent to email for: " + this.username
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Code resending failed. Please contact an admin."
            });
          }
        })
        .catch(err => {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Internal application error"
          });
        });
    }
  }
});
</script>

<style scoped>
.confirm-card {
  padding: 0 2em;
}

.user-submit {
  width: fit-content !important;
}

.code-form {
  max-width: 25em;
}

.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}

.password-check {
  color: #439446;
  font-size: 2em;
}

.password-times {
  color: #e60017;
  font-size: 2em;
}
</style>
