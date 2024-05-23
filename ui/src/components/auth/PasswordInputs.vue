<template>
  <div v-if="oldPasswordRequired" class="field">
    <label for="passwordOld">Current password</label>
    <div class="input-with-button">
      <Password
        v-bind="passwordOld"
        :feedback="false"
        toggleMask
        :input-props="{ 'data-testid': testId + 'old', autofocus: true }"
        data-testid="password-edit-password-old-container"
        id="passwordOld"
      />
    </div>
    <InlineMessage v-if="errors.passwordOld && passwordOld.modelValue === ''" severity="info"> {{ errors.passwordOld }} </InlineMessage>
  </div>
  <div class="field">
    <label for="password">New password</label>
    <div class="input-with-button">
      <Password
        v-bind="password"
        toggleMask
        :input-props="{ 'data-testid': testId + 'new1' }"
        data-testid="password-edit-password-new1-container"
        id="password"
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
          <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
            <li>At least one lowercase</li>
            <li>At least one uppercase</li>
            <li>At least one number</li>
            <li>Special characters such as !@#$%^&*</li>
            <li>Minimum 8 characters</li>
          </ul>
        </template>
      </Password>
    </div>
    <InlineMessage v-if="errors.password && password.modelValue !== ''" severity="info"> {{ errors.password }} </InlineMessage>
  </div>
  <div class="field">
    <label for="password2">Confirm new password</label>
    <div class="input-with-button">
      <Password
        v-bind="password2"
        toggleMask
        :feedback="false"
        :input-props="{ 'data-testid': testId + 'new2' }"
        data-testid="password-edit-password-new2-container"
        id="password2"
      />
    </div>
    <InlineMessage v-if="!isMatchingPassword && password2.modelValue" severity="error"> {{ errors.password2 }}</InlineMessage>
  </div>
</template>

<script setup lang="ts">
import Password from "primevue/password";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import { checkPasswordStrength, verifyPasswordsMatch } from "@im-library/helpers/UserMethods";
import * as yup from "yup";
import { PasswordStrength } from "@im-library/enums";

interface Props {
  testId: string;
  oldPasswordRequired?: boolean;
}

const props = defineProps<Props>();

const schema = yup.object({
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
});

const { defineComponentBinds, errors } = useForm({
  validationSchema: schema
});

const passwordOld = defineComponentBinds("passwordOld");
const password = defineComponentBinds("password");
const password2 = defineComponentBinds("password2");

const isMatchingPassword = computed(() => verifyPasswordsMatch(password.value.modelValue, password2.value.modelValue));
const hasOldPassword = computed(() => {
  if (props.oldPasswordRequired) return passwordOld.value.modelValue && passwordOld.value.modelValue !== password.value.modelValue;
  else return !props.oldPasswordRequired;
});
const arePasswordsValid = computed(() => isValidPassword() && isMatchingPassword.value && hasOldPassword.value);

function isValidPassword(): boolean {
  return (
    checkPasswordStrength(password.value.modelValue) === PasswordStrength.medium || checkPasswordStrength(password.value.modelValue) === PasswordStrength.strong
  );
}

watch([], async () => {});

const emit = defineEmits({
  "update:password": (_payload: string) => true,
  "update:arePasswordsValid": (_payload: boolean) => true
});

watch(
  () => password.value.modelValue,
  async newValue => {
    emit("update:password", newValue);
  }
);

watch(
  () => arePasswordsValid.value,
  async newValue => {
    emit("update:arePasswordsValid", newValue);
  }
);
</script>

<style scoped></style>
