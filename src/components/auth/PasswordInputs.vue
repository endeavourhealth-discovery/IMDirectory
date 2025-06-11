<template>
  <div v-if="oldPasswordRequired" class="field">
    <label for="passwordOld">Current password</label>
    <div class="input-with-button">
      <Password
        v-model="passwordOld"
        v-bind="passwordOldAttrs"
        :feedback="false"
        toggleMask
        :input-props="{ autofocus: true }"
        data-testid="password-old"
        id="passwordOld"
        fluid
        :pt="{
          'pc-input-text': { root: { 'data-testid': testId + 'old' } }
        }"
      />
    </div>
    <Message data-testid="inline-error-message" v-if="errors.passwordOld && !passwordOld" severity="info">
      {{ errors.passwordOld }}
    </Message>
  </div>
  <div class="field">
    <label for="password">New password</label>
    <div class="input-with-button">
      <Password
        v-model="password"
        v-bind="passwordAttrs"
        toggleMask
        fluid
        data-testid="password-new1"
        id="password"
        :pt="{
          'pc-input-text': { root: { 'data-testid': testId + 'new1' } }
        }"
        :overlayVisible="true"
        strong-regex="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
        medium-regex="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"
      >
        <template #header>
          <h6>Pick a password</h6>
        </template>
        <template #footer>
          <hr />
          <p class="mt-2">Password should contain:</p>
          <ul class="mt-0 ml-2 pl-2" style="line-height: 1.5">
            <li>At least one lowercase</li>
            <li>At least one uppercase</li>
            <li>At least one number</li>
            <li>Special characters such as !@#$%^&*</li>
            <li>Minimum 8 characters</li>
          </ul>
        </template>
      </Password>
    </div>
    <Message data-testid="inline-error-message" v-if="errors.password" severity="info">
      {{ errors.password }}
    </Message>
  </div>
  <div class="field">
    <label for="password2">Confirm new password</label>
    <div class="input-with-button">
      <Password
        v-model="password2"
        v-bind="password2Attrs"
        toggleMask
        fluid
        :feedback="false"
        data-testid="password-new2"
        id="password2"
        :pt="{
          'pc-input-text': { root: { 'data-testid': testId + 'new2' } }
        }"
      />
    </div>
    <Message data-testid="inline-error-message" v-if="!isMatchingPassword && password2" severity="error"> {{ errors.password2 }}</Message>
  </div>
</template>

<script setup lang="ts">
import Password from "primevue/password";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import { checkPasswordStrength, verifyPasswordsMatch } from "@/helpers/UserMethods";
import * as yup from "yup";
import { PasswordStrength } from "@/enums";

interface Props {
  testId: string;
  oldPasswordRequired?: boolean;
}

const props = defineProps<Props>();

const { defineField, errors } = useForm({
  validationSchema: yup.object({
    password: yup
      .string()
      .required()
      .test("isValidPassword", "Password too weak", () => isValidPassword())
      .notOneOf([yup.ref("passwordOld")], "New password must be different"),
    password2: yup
      .string()
      .required()
      .oneOf([yup.ref("password")], "Passwords do not match"),
    passwordOld: yup.string().required("Current password is required")
  })
});

const [passwordOld, passwordOldAttrs] = defineField("passwordOld");
const [password, passwordAttrs] = defineField("password");
const [password2, password2Attrs] = defineField("password2");

const isMatchingPassword = computed(() => verifyPasswordsMatch(password.value, password2.value));
const hasOldPassword = computed(() => {
  if (props.oldPasswordRequired) return passwordOld.value && passwordOld.value !== password.value;
  else return !props.oldPasswordRequired;
});
const arePasswordsValid = computed(() => isValidPassword() && isMatchingPassword.value && hasOldPassword.value);

function isValidPassword(): boolean {
  return checkPasswordStrength(password.value) === PasswordStrength.medium || checkPasswordStrength(password.value) === PasswordStrength.strong;
}

const emit = defineEmits<{
  "update:oldPassword": [payload: string];
  "update:password": [payload: string];
  "update:arePasswordsValid": [payload: boolean];
}>();

watch(
  () => passwordOld.value,
  newValue => {
    emit("update:oldPassword", newValue);
  }
);

watch(
  () => password.value,
  newValue => {
    emit("update:password", newValue);
  }
);

watch(
  () => arePasswordsValid.value,
  newValue => {
    emit("update:arePasswordsValid", newValue);
  }
);
</script>

<style scoped>
.field {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
}
.input-with-button {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row;
}
.p-password {
  width: 100%;
}
</style>
