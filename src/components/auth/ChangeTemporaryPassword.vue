<template>
  <div class="flex flex-row items-center">
    <Card class="justify-content-sm-around password-edit-card flex flex-col items-center">
      <template #header> </template>
      <template #title> Change temporary password</template>
      <template #content>
        <form class="password-edit-form flex flex-col justify-start" @submit="onSubmit">
          <div class="field">
            <label for="fieldFirstName">First name</label>
            <InputText
              id="fieldFirstName"
              data-testid="register-firstname"
              type="text"
              maxlength="50"
              v-model="firstName"
              v-bind="firstNameAttrs"
              @focus="updateFocused('firstName', true)"
              @blur="updateFocused('firstName', false)"
              :class="errors.firstName && firstName && !focused.get('firstName') && 'p-invalid'"
            />
            <Message v-if="errors.firstName" severity="error"> {{ errors.firstName }} </Message>
          </div>
          <div class="field">
            <label for="fieldLastName">Last name</label>
            <InputText
              id="fieldLastName"
              data-testid="register-lastname"
              type="text"
              maxlength="50"
              v-model="lastName"
              v-bind="lastNameAttrs"
              @focus="updateFocused('lastName', true)"
              @blur="updateFocused('lastName', false)"
              :class="errors.lastName && lastName && !focused.get('lastName') && 'p-invalid'"
            />
            <Message v-if="errors.lastName" severity="error" class="error-message"> {{ errors.lastName }}</Message>
          </div>
          <PasswordInputs test-id="password-edit-password-" @update:password="setNewPassword" @update:arePasswordsValid="setIsNewPasswordValid" />
          <div class="mt-2 flex flex-row justify-center">
            <Button :disabled="buttonDisabled" class="user-edit" data-testid="password-edit-submit" label="Change password" @click="onSubmit" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, Ref, ref } from "vue";
import { AuthService } from "@/services";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useForm } from "vee-validate";
import PasswordInputs from "@/components/auth/PasswordInputs.vue";
import * as yup from "yup";
import { verifyIsFirstName, verifyIsLastName } from "@/helpers/UserMethods";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

interface Props {
  tempPassword: string;
}

const props = defineProps<Props>();

const router = useRouter();
const authStore = useAuthStore();

const authReturnPath = computed(() => authStore.authReturnPath);
const buttonDisabled = computed(() => setButtonDisabled());

const allVerified = computed(() => isNewPasswordValid.value && props.tempPassword != password.value && isObjectHasKeys(errors));

const focused: Ref<Map<string, boolean>> = ref(new Map());
const password = ref("");
const isNewPasswordValid = ref(false);

const schema: any = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .test("isFirstNameVerified", 'First name contains unexpected characters. Letters, apostrophes, and hyphens only allowed e.g."Mary-Anne"', () =>
      verifyIsFirstName(firstName.value)
    ),
  lastName: yup
    .string()
    .required("Last name is required")
    .test("isLastNameValid", 'Last name must have a minimum of two letters and only contain letters, apostrophes, and hyphens e.g."O\'Keith-Smith"', () =>
      verifyIsLastName(lastName.value)
    )
});

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: schema
});

const [firstName, firstNameAttrs]: any = defineField("firstName");
const [lastName, lastNameAttrs]: any = defineField("lastName");

onMounted(async () => {
  if (!props.tempPassword) await router.push({ name: "Login" });
});

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

function setNewPassword(newPassword: string) {
  password.value = newPassword;
}

function setIsNewPasswordValid(isValid: boolean) {
  isNewPasswordValid.value = isValid;
}

function setButtonDisabled(): boolean {
  return !isNewPasswordValid.value;
}

const onSubmit = handleSubmit(async () => {
  if (allVerified.value) {
    AuthService.changeTemporaryPassword(password.value, firstName.value, lastName.value).then(res => {
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password successfully updated"
        }).then(() => {
          if (authReturnPath.value) {
            router.push({ path: authReturnPath.value });
          } else {
            router.push({ name: "UserDetails" });
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.message
        });
      }
    });
  } else if (props.tempPassword === password.value) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "New password can not be the same as the current password."
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error updating password. Authentication error or new passwords do not match."
    });
  }
});
</script>

<style scoped>
.password-edit-card {
  padding: 1.25rem 2em 0 2em;
}

.user-edit {
  min-width: fit-content !important;
}

.password-edit-form {
  display: flex;
  flex-flow: column nowrap;
  min-width: 20rem;
}

.field {
  display: flex;
  flex-flow: column nowrap;
}

.avatar-icon {
  margin-block-start: 0.5rem;
  width: 10rem;
  border: 1px solid lightgray;
  border-radius: 50%;
}

.input-with-button {
  display: flex;
  flex-flow: row nowrap;
}
</style>
