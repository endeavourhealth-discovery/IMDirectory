<template>
  <div class="flex flex-row items-center">
    <Card class="justify-content-sm-around confirm-card flex flex-col items-center">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-key" class="icon-header" />
      </template>
      <template #title> Confirmation Code </template>
      <template #content>
        <form @subit="onSubmit" class="code-form">
          <div class="field">
            <label for="fieldUsername">Username</label>
            <InputText
              data-testid="confirm-code-username-input"
              id="fieldUsername"
              type="text"
              v-model="username"
              v-bind="usernameAttrs"
              :class="errors.username && username && !focused.get('username') && 'p-invalid'"
              @focus="updateFocused('username', true)"
              @blur="updateFocused('username', false)"
            />
            <Message v-if="errors.username && !focused.get('username')" severity="error">{{ errors.username }}</Message>
          </div>
          <div class="field">
            <label for="fieldCode">Confirmation code</label>
            <div class="flex flex-row items-center">
              <InputOtp
                class="flex-auto"
                data-testid="confirm-code-input"
                id="fieldCode"
                type="password"
                :length="6"
                v-model="code"
                v-bind="codeAttrs"
                :class="errors.code && code && !focused.get('code') && 'p-invalid'"
                @focus="updateFocused('code', true)"
                @blur="updateFocused('code', false)"
                :pt="{ 'pc-input': { root: { 'data-testid': 'otp-input' } } }"
              />
            </div>
            <Message v-if="errors.code && !focused.get('code')" severity="error">{{ errors.code }}</Message>
            <small id="code-help">Your 6-digit code should arrive by email from<br />no-reply@verificationemail.com</small>
          </div>
          <div class="flex flex-row justify-center">
            <Button
              data-testid="confirm-code-submit-button"
              class="user-submit"
              label="Submit"
              :disabled="Object.keys(values).length < 2 || Object.keys(errors).length > 0"
              @click="onSubmit"
            />
          </div>
        </form>
      </template>
      <template #footer>
        <small
          >Not received a code? <br /><Button
            class="p-button-sm code-request"
            severity="secondary"
            data-testid="confirm-code-not-received-button"
            label="Request a new code"
            v-on:click.prevent="showDialog = true"
        /></small>
      </template>
    </Card>
  </div>
  <Dialog v-model:visible="showDialog" header="Request new code" :modal="true" :style="{ width: '40vw' }">
    <div class="dialog-container">
      <form class="flex flex-col" @submit="requestCode">
        <div class="field">
          <label for="dialog-username">Enter your username</label>
          <InputText id="dialog-username" type="text" v-model="username" :class="errors.username && 'invalid'" />
          <small v-if="errors.username" class="validate-error">Username is required.</small>
        </div>
      </form>
    </div>
    <template #footer>
      <Button data-testid="confirm-code-resend-code-button" label="Request a new code" :disabled="!username || !!errors.username" @click="requestCode" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { AuthService, UserService } from "@/services";
import { computed, onMounted, Ref, ref } from "vue";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { useAuthStore } from "@/stores/authStore";
import { autoSignIn } from "aws-amplify/auth";
import * as yup from "yup";
import { useForm } from "vee-validate";

const authStore = useAuthStore();
const router = useRouter();

const registeredUsername = computed(() => authStore.registeredUsername);

const showDialog = ref(false);

const schema = yup.object({
  username: yup.string().required("Username is required"),
  code: yup.string().required("Code is required").length(6)
});

const { values, errors, defineField, handleSubmit } = useForm({ validationSchema: schema });

const [username, usernameAttrs] = defineField("username");
const [code, codeAttrs] = defineField("code");

const focused: Ref<Map<string, boolean>> = ref(new Map());

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

onMounted(() => {
  if (registeredUsername.value && registeredUsername.value !== "") {
    username.value = registeredUsername.value;
  }
});

const onSubmit = handleSubmit(async () => {
  await AuthService.confirmRegister(username.value, code.value)
    .then(res => {
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.message,
          confirmButtonText: "Login"
        }).then(async () => {
          authStore.updateRegisteredUsername(username.value);
          if (res.nextStep === "COMPLETE_AUTO_SIGN_IN") await AuthService.handleAutoSignIn();
          else router.push({ name: "Login" });
        });
      } else if (res.status === 403) {
        if (res.nextStep === "COMPLETE_AUTO_SIGN_IN") {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Confirmed registration",
            confirmButtonText: "Login"
          }).then(async () => {
            authStore.updateRegisteredUsername(username.value);
            await AuthService.handleAutoSignIn();
            await router.push({ name: "LandingPage" });
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.message
          });
        }
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
});

async function requestCode() {
  showDialog.value = false;
  await AuthService.resendConfirmationCode(username.value)
    .then(async res => {
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Code has been resent to email for: " + username.value
        });
      } else if (res.message === "User is already confirmed.") {
        await UserService.updateEmailVerified(true).then(async () =>
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Account has successfully been verified",
            confirmButtonText: "Login"
          }).then(async () => {
            authStore.updateRegisteredUsername(username.value);
            await autoSignIn();
            router.push({ name: "LandingPage" });
          })
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Code resending failed. Please check your username is correct."
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
</script>

<style scoped>
.confirm-card {
  padding: 0 2em;
}

.code-form {
  display: flex;
  flex-flow: column nowrap;
}

.field {
  display: flex;
  flex-flow: column nowrap;
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
  color: var(--p-green-500);
  font-size: 2em;
}

.password-times {
  color: var(--p-red-500);
  font-size: 2em;
}

.invalid {
  border-color: var(--p-red-400);
}

.validate-error {
  color: var(--p-red-400);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}
</style>
