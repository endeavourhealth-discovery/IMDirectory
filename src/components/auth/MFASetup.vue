<template>
  <div id="mfa-setup">
    <Card class="justify-content-sm-around mfa-setup-card flex flex-col items-center">
      <template #header>
        <IMFontAwesomeIcon icon="fa-solid fa-shield-halved" class="icon-header" />
      </template>
      <template #title>2-factor authentication</template>
      <template #content>
        <div class="mfa-setup-content">
          <p>Scan the qr code with your prefered authenticator app to setup 2-factor authentication for your account.</p>
          <Button icon="fa-solid fa-circle-question" rounded severity="secondary" v-tooltip="'Need some help?'" @click="showHelpDialog" />
          <ProgressSpinner v-if="loadingQRCode" />
          <div id="qr-code" ref="qrCodeElement"></div>
          <div class="code-input">
            <label for="mfa-code">Code</label>
            <InputText id="mfa-code" v-model="code" v-on:keyup.enter="handleSubmitMFA" />
            <small id="mfa-code-help">Enter the code from your authenticator app</small>
            <small v-if="!isValidCode" class="invalid-text">Code should be a 6 digit number e.g. 123456</small>
          </div>
          <Button :disabled="!isValidCode" label="Submit" @click="handleSubmitMFA" :loading="loading" class="submit-button" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import QRCodeStyling, { DrawType, TypeNumber, Mode, ErrorCorrectionLevel, DotType, CornerSquareType, CornerDotType } from "qr-code-styling";
import { onMounted, ref, watch, h, computed, Ref } from "vue";
import { useDialog } from "primevue/usedialog";
import Button from "primevue/button";
import MFAHelp from "@/components/shared/dynamicDialogs/MFAHelp.vue";
import Swal from "sweetalert2";
import { AuthService } from "@/services";
import { useRouter } from "vue-router";

const router = useRouter();
const helpDialog = useDialog();

const styles = getComputedStyle(document.body);
const primaryColor = styles.getPropertyValue("--primary-color");
const backgroundColor = styles.getPropertyValue("--surface-a");
const textColor = styles.getPropertyValue("--text-color");

const isValidCode = computed(() => /\d{6}/.test(code.value));

const code = ref("");

const options: Ref<any> = ref();
const loading = ref(false);
const loadingQRCode = ref(false);

const qrCode = ref(new QRCodeStyling(options.value));

const qrCodeElement = ref();

onMounted(async () => {
  loadingQRCode.value = true;
  const mfaTokenUrl = await AuthService.getMfaToken();
  if (mfaTokenUrl) {
    options.value = generateOptions(mfaTokenUrl.href);
    options.value.data = mfaTokenUrl.href;
  }
  loadingQRCode.value = false;
});

watch(options, newValue => {
  if (newValue) {
    qrCode.value = new QRCodeStyling(newValue);
    qrCode.value.append(qrCodeElement.value);
  }
});

function generateOptions(dataUrl: string) {
  return {
    width: 300,
    height: 300,
    type: "svg" as DrawType,
    data: dataUrl,
    image: "/logos/Logo-object-empty.png",
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
      type: "rounded" as DotType
    },
    backgroundOptions: {
      color: backgroundColor
    },
    cornersSquareOptions: {
      color: textColor,
      type: "extra-rounded" as CornerSquareType
    },
    cornersDotOptions: {
      color: textColor,
      type: "dot" as CornerDotType
    }
  };
}

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
        return [h(Button, { label: "Close", icon: "fa-solid fa-xmark", onClick: () => dialogRef.close() })];
      }
    }
  });
}

async function handleSubmitMFA() {
  if (isValidCode.value) {
    loading.value = true;
    try {
      await AuthService.verifyMFAToken(code.value);
      await AuthService.setMfaPreference("TOTP");
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "2-factor authentication successfully setup for this account."
      }).then(() => router.push({ name: "UserDetails" }));
    } catch (err: any) {
      throw new Error("Error setting up mfa", err);
    }
    loading.value = false;
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
  gap: 0.5rem;
}

.invalid-text {
  color: var(--p-red-500);
}

.submit-button {
  margin-top: 0.5rem;
}
</style>
