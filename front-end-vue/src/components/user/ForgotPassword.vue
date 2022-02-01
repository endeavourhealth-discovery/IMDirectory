<template>
  <div class="p-d-flex p-flex-row p-ai-center">
    <Card class="p-d-flex p-flex-column p-jc-sm-around p-ai-center recovery-card">
      <template #header>
        <i class="pi pi-fw pi-user icon-header" aria-hidden="true" />
      </template>
      <template #title> Account Recovery: <br /><br />Password Reset </template>
      <template #content>
        <div class="p-fluid recovery-form">
          <div class="p-field">
            <label for="fieldUsername">Username</label>
            <InputText id="fieldUsername" type="text" v-model="username" />
          </div>
          <div class="p-d-flex p-flex-row p-jc-center">
            <Button class="user-submit" type="submit" label="Request Reset Code" v-on:click.prevent="handleSubmit" />
          </div>
        </div>
      </template>
      <template #footer>
        <small
          >Already have a recovery code?
          <a id="password-submit-link" class="footer-link" @click="$router.push({ name: 'ForgotPasswordSubmit' })">Submit Code</a></small
        >
        <br />
        <br />
        <small
          >If you have forgotten your username,<br />
          please contact an admin</small
        >
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Swal from "sweetalert2";
import AuthService from "@/services/AuthService";

export default defineComponent({
  name: "ForgotPassword",
  data() {
    return {
      username: ""
    };
  },
  methods: {
    handleSubmit(): void {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Reset password for account: " + this.username,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Reset Password"
      }).then(result => {
        if (result.isConfirmed) {
          AuthService.forgotPassword(this.username).then(res => {
            if (res.status === 200) {
              Swal.fire({
                icon: "success",
                title: "Success",
                text: "Password has been reset for account: " + this.username + ". An email has been sent with a recovery code."
              }).then(() => {
                this.$store.commit("updateRegisteredUsername", this.username);
                this.$router.push({ name: "ForgotPasswordSubmit" });
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: res.message + ". Check username is correct."
              });
            }
          });
        }
      });
    }
  }
});
</script>

<style scoped>
.recovery-card {
  padding: 0 2em;
}

.user-submit {
  width: fit-content !important;
}

.recovery-form {
  max-width: 25em;
}

.footer-link:hover {
  cursor: pointer;
}

.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}
</style>
