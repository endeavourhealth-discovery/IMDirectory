<template>
  <div class="flex h-full flex-1 flex-col items-center">
    <Card class="justify-content-sm-around register-card flex w-80 flex-col items-center">
      <template #title> Create user </template>
      <template #content>
        <form @submit="onSubmit">
          <div class="flex flex-col flex-nowrap">
            <div class="flex flex-col">
              <label for="fieldUsername">Username</label>
              <InputText
                data-testid="register-username"
                id="fieldUsername"
                type="text"
                maxlength="50"
                v-model="username"
                v-bind="usernameAttrs"
                @focus="updateFocused('username', true)"
                @blur="updateFocused('username', false)"
                :class="errors.username && username && !focused.get('username') && 'p-invalid'"
              />
              <Message v-if="errors.username" severity="error"> {{ errors.username }} </Message>
            </div>
            <div class="flex flex-col">
              <label for="fieldEmail1">Email address</label>
              <div class="flex flex-row items-center">
                <InputText
                  id="fieldEmail1"
                  data-testid="register-email1"
                  type="text"
                  maxlength="50"
                  v-model="email1"
                  v-bind="email1Attrs"
                  class="flex-auto"
                  @focus="updateFocused('email1', true)"
                  @blur="updateFocused('email1', false)"
                  :class="!emailIsNotRegistered && !errors.email1 && !focused.get('email1') && 'p-invalid'"
                />
                <IMFontAwesomeIcon
                  v-if="!errors.email1 && email1 && emailIsNotRegistered"
                  icon="fa-regular fa-circle-check"
                  class="email-check"
                  data-testid="register-email1-verified"
                />
                <IMFontAwesomeIcon
                  v-if="(errors.email1 && email1) || !emailIsNotRegistered"
                  icon="fa-regular fa-circle-xmark"
                  class="email-times"
                  data-testid="register-email1-unverified"
                />
              </div>
              <Message v-if="!emailIsNotRegistered && email1 && !errors.email1" severity="error">Email address is already registered</Message>
              <Message v-if="emailIsNotRegistered && errors.email1" severity="error">{{ errors.email1 }}</Message>
            </div>
            <div class="flex flex-col">
              <label for="fieldEmail2">Confirm email address</label>
              <InputText
                id="fieldEmail2"
                data-testid="register-email2"
                type="text"
                maxlength="50"
                v-model="email2"
                v-bind="email2Attrs"
                @focus="updateFocused('email2', true)"
                @blur="updateFocused('email2', false)"
                :class="errors.email2 && email2 && !focused.get('email2') && 'p-invalid'"
              />
              <Message v-if="errors.email2" severity="error"> {{ errors.email2 }} </Message>
            </div>
            <div class="flex flex-col">
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
            <div class="flex flex-col">
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
              <Message v-if="errors.lastName" severity="error"> {{ errors.lastName }}</Message>
            </div>
            <div class="flex flex-row justify-center">
              <Button :disabled="!allVerified" data-testid="register-submit" class="user-submit" label="Create" @click="onSubmit" />
            </div>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { AuthService } from "@/services";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { computed, Ref, ref, watch } from "vue";
import Swal, { SweetAlertResult } from "sweetalert2";
import { verifyIsEmail, verifyIsFirstName, verifyIsLastName, verifyIsUsername } from "@/helpers/UserMethods";
import { Avatars } from "@/constants";
import { useRouter } from "vue-router";
import { User } from "@/interfaces";
import * as yup from "yup";
import { useForm } from "vee-validate";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash-es";
import AdminService from "@/services/AdminService";

const emit = defineEmits<{
  userCreated: [payload: User];
}>();

const router = useRouter();

const focused: Ref<Map<string, boolean>> = ref(new Map());
const emailIsNotRegistered = ref(true);
const allVerified = computed(() => isObjectHasKeys(errors) && emailIsNotRegistered.value);

const schema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .test("isUsernameVerified", 'Username contains unexpected characters. A-Z, 0-9 and hyphen/underscore(-_) only allowed e.g."John-Doe2"', () =>
      verifyIsUsername(username.value)
    ),
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
    ),
  email1: yup
    .string()
    .required("Email is required")
    .test("isEmailValid", "Email is not valid", () => verifyIsEmail(email1.value)),
  email2: yup
    .string()
    .required("Email is required")
    .oneOf([yup.ref("email1")], "Email addresses do not match")
});

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: schema
});

const [username, usernameAttrs]: any = defineField("username");
const [firstName, firstNameAttrs]: any = defineField("firstName");
const [lastName, lastNameAttrs]: any = defineField("lastName");
const [email1, email1Attrs]: any = defineField("email1");
const [email2, email2Attrs]: any = defineField("email2");

watch(
  () => cloneDeep(email1.value),
  async newValue => {
    await verifyEmailIsNotRegistered(newValue);
  }
);

function updateFocused(key: string, value: boolean) {
  focused.value.set(key, value);
}

const onSubmit = handleSubmit(async () => {
  if (allVerified.value) {
    const user = {
      id: "",
      username: username.value,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email1.value.toLowerCase(),
      password: "",
      avatar: Avatars[0],
      roles: [],
      mfaStatus: []
    } as User;
    AdminService.createUser(user)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User created",
          showCancelButton: true,
          confirmButtonText: "Continue"
        }).then((result: SweetAlertResult) => {
          if (result.isConfirmed) {
            router.push({ name: "CognitoListUsers" });
          } else {
            clearForm();
          }
        });
      })
      .catch(err => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message,
          confirmButtonText: "Close"
        });
      });
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "User creation failed. Check input data.",
      confirmButtonText: "Close"
    });
  }
});

function clearForm(): void {
  username.value = "";
  email1.value = "";
  email2.value = "";
  firstName.value = "";
  lastName.value = "";
}

async function verifyEmailIsNotRegistered(email: string): Promise<void> {
  if (email && !errors.value.email1) emailIsNotRegistered.value = !(await AuthService.isEmailRegistered(email));
  else emailIsNotRegistered.value = true;
}
</script>

<style scoped></style>
