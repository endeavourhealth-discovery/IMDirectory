<template>
  <div id="mfa-setup">
    <Card class="flex flex-column justify-content-sm-around align-items-center mfa-setup-card">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-shield-halved" class="icon-header" />
      </template>
      <template #title>2-factor authentication</template>
      <template #content>
        <div class="mfa-setup-content">
          <p>Scan the qr code with your prefered authenticator app to setup 2-factor authentication for your account.</p>
          <Button icon="fa-solid fa-circle-question" rounded severity="secondary" v-tooltip="'Need some help?'" @click="showHelpDialog" />
          <div v-if="options.data" id="qr-code" ref="qrCodeElement"></div>
          <div class="code-input">
            <label for="mfa-code">Code</label>
            <InputText id="mfa-code" v-model="code" />
            <small id="mfa-code-help">Enter the code from your authenticator app</small>
            <small v-if="isValidCode" class="invalid-text">Code should be a 6 digit number e.g. 123456</small>
          </div>
          <Button :disabled="!isValidCode" label="Submit" @click="handleSubmitMFA" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import QRCodeStyling, { DrawType, TypeNumber, Mode, ErrorCorrectionLevel, DotType, CornerSquareType, CornerDotType } from "qr-code-styling";
import { onMounted, ref, watch, h, computed } from "vue";
import _ from "lodash";
import { useDialog } from "primevue/usedialog";
import Button from "primevue/button";
import MFAHelp from "@/components/shared/dynamicDialogs/MFAHelp.vue";
import Swal from "sweetalert2";
import { AuthService } from "@/services";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { Avatars } from "@im-library/constants";

interface Props {
  QRCode: string;
  user: any;
}

const props = defineProps<Props>();

const router = useRouter();
const helpDialog = useDialog();
const userStore = useUserStore();
const authStore = useAuthStore();

const styles = getComputedStyle(document.body);
const primaryColor = styles.getPropertyValue("--primary-color");
const backgroundColor = styles.getPropertyValue("--surface-a");
const textColor = styles.getPropertyValue("--text-color");

const isValidCode = computed(() => /[0-9]{6}/.test(code.value));
const authReturnUrl = computed(() => authStore.authReturnUrl);

const code = ref("");

const options = ref({
  width: 300,
  height: 300,
  type: "svg" as DrawType,
  data: "http://qr-code-styling.com",
  image: "/src/assets/logos/Logo-object-empty.png",
  margin: 10,
  qrOptions: {
    typeNumber: 0 as TypeNumber,
    mode: "Byte" as Mode,
    errorCorrectionLevel: "Q" as ErrorCorrectionLevel
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.4,
    margin: 2,
    crossOrigin: "anonymous"
  },
  dotsOptions: {
    color: primaryColor,
    // gradient: {
    //   type: 'linear', // 'radial'
    //   rotation: 0,
    //   colorStops: [{ offset: 0, color: '#8688B2' }, { offset: 1, color: '#77779C' }]
    // },
    type: "rounded" as DotType
  },
  backgroundOptions: {
    color: backgroundColor
    // gradient: {
    //   type: 'linear', // 'radial'
    //   rotation: 0,
    //   colorStops: [{ offset: 0, color: '#ededff' }, { offset: 1, color: '#e6e7ff' }]
    // },
  },
  cornersSquareOptions: {
    color: textColor,
    type: "extra-rounded" as CornerSquareType
    // gradient: {
    //   type: 'linear', // 'radial'
    //   rotation: 180,
    //   colorStops: [{ offset: 0, color: '#25456e' }, { offset: 1, color: '#4267b2' }]
    // },
  },
  cornersDotOptions: {
    color: textColor,
    type: "dot" as CornerDotType
    // gradient: {
    //   type: 'linear', // 'radial'
    //   rotation: 180,
    //   colorStops: [{ offset: 0, color: '#00266e' }, { offset: 1, color: '#4060b3' }]
    // },
  }
});

const qrCode = ref(new QRCodeStyling(options.value));

const qrCodeElement = ref();

onMounted(() => {
  // if (props.QRCode) {
  // options.value.data = props.QRCode;
  qrCode.value.append(qrCodeElement.value);
  // } else throw new Error("Multifactor setup is missing required qr code");
});

watch(
  () => _.cloneDeep(options.value.data),
  newValue => {
    if (newValue) qrCode.value.update(options.value);
  }
);

function showHelpDialog() {
  const dialogProps = {
    style: { width: "80vw,height:80vh" },
    closable: true,
    maximizable: true,
    modal: true,
    contentStyle: { flex: "1 1 auto", display: "flex" },
    dismissableMask: true,
    autoZIndex: false
  };
  const dialogRef = helpDialog.open(MFAHelp, {
    props: dialogProps,
    templates: {
      footer: () => {
        return [h(Button, { label: "Close", icon: "pi pi-times", onClick: () => dialogRef.close() })];
      }
    }
  });
}

async function handleSubmitMFA() {
  if (isValidCode.value) {
    AuthService.mfaSignIn(props.user, code.value)
      .then(async res => {
        if (res.status === 200 && res.user) {
          const loggedInUser = res.user;
          // check if avatar exists and replace lagacy images with default avatar on signin
          const result = Avatars.find((avatar: string) => avatar === loggedInUser.avatar);
          if (!result) {
            loggedInUser.avatar = Avatars[0];
          }
          await userStore.updateCurrentUser(loggedInUser);
          await userStore.getAllFromUserDatabase();
          authStore.updateRegisteredUsername("");
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Login successful"
          }).then(() => {
            userStore.clearOptionalCookies();
            if (authReturnUrl.value) {
              window.location.href = authReturnUrl.value;
            } else {
              router.push({ name: "LandingPage" });
            }
          });
        }
      })
      .catch(err => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Authentication error",
          confirmButtonText: "Close"
        });
      });
  }
}
</script>

<style scoped>
#mfa-setup {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow: auto;
}
.icon-header {
  font-size: 5rem;
  margin-top: 1em;
}

.mfa-setup-card {
  padding: 0 2em;
}

.mfa-setup-content {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  max-width: 30rem;
}

.code-input {
  display: flex;
  flex-flow: column nowrap;
}

.invalid-text {
  color: var(--red-500);
}
</style>
