<template>
  <div id="license-main-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>SNOMED</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="license-content">
      <Button label="Back" icon="fa-solid fa-arrow-left" @click="goBack" class="back-button" />
      <h1>SNOMED License Agreement</h1>
      <p>
        <strong>{{ appName }}</strong> includes SNOMED Clinical Terms® (SNOMED CT®) which is used by permission of the International Health Terminology
        Standards Development Organization (IHTSDO). All rights reserved. SNOMED CT® was originally created by the College of American Pathologists. “SNOMED”,
        “SNOMED CT” and “SNOMED Clinical Terms” are registered trademarks of the IHTSDO (<Button link as="a" href="http://www.ihtsdo.org">www.ihtsdo.org</Button
        >). Use of SNOMED CT in <strong>{{ appName }}</strong> is governed by the conditions of the following SNOMED CT license issued by the IHTSDO:
      </p>

      <ol>
        <li>
          The meaning of the terms “Affiliate”, or “Data Analysis System”, “Data Creation System”, “Derivative”, “End User”, “Extension”, “Member”, “Non-Member
          Territory”, “SNOMED CT” and “SNOMED CT Content” are as defined in the IHTSDO Affiliate License Agreement (see
          <Button link as="a" href="http://www.ihtsdo.org/resource/resource/117">on the IHTSDO web site</Button>).
        </li>
        <li>
          Information about Affiliate Licensing is available at
          <Button link as="a" href="http://www.ihtsdo.org/snomed-ct/get-snomed-ct"> http://www.ihtsdo.org/snomed-ct/get-snomed-ct</Button>. Individuals or
          organizations wishing to register as IHTSDO Affiliates can register at
          <Button link as="a" href="https://mlds.ihtsdotools.org">mlds.ihtsdotools.org</Button>, subject to acceptance of the Affiliate License Agreement (see
          <Button link as="a" href="http://www.ihtsdo.org/resource/resource/117"> on the IHTSDO web site</Button>).
        </li>
        <li>
          The current list of IHTSDO Member Territories can be viewed at
          <Button link as="a" href="http://www.ihtsdo.org/members">www.ihtsdo.org/members</Button>. Countries not included in that list are "Non-Member
          Territories".
        </li>
        <li>
          End Users, that do not hold an IHTSDO Affiliate License, may access SNOMED CT® using <strong>{{ appName }}</strong> subject to acceptance of and
          adherence to the following sub-license limitations:
          <ul>
            <li>
              The sub-licensee is only permitted to access SNOMED CT® using this software (or service) for the purpose of exploring and evaluating the
              terminology.
            </li>
            <li>
              The sub-licensee is not permitted the use of this software as part of a system that constitutes a SNOMED CT "Data Creation System" or "Data
              Analysis System", as defined in the IHTSDO Affiliate License. This means that the sub-licensee must not use
              <strong>{{ appName }}</strong> to add or copy SNOMED CT identifiers into any type of record system, database or document.
            </li>
            <li>The sub-licensee is not permitted to translate or modify SNOMED CT Content or Derivatives.</li>
            <li>The sub-licensee is not permitted to distribute or share SNOMED CT Content or Derivatives.</li>
          </ul>
        </li>
        <li>
          IHTSDO Affiliates may use <strong>{{ appName }}</strong> as part of a "Data Creation System" or "Data Analysis System" subject to the following
          conditions:
          <ul>
            <li>
              The IHTSDO Affiliate, using
              <strong>{{ appName }}</strong> must accept full responsibility for any reporting and fees due for use or deployment of such a system in a
              Non-Member Territory.
            </li>
            <li>
              The IHTSDO Affiliate must not use
              <strong>{{ appName }}</strong> to access or interact with SNOMED CT in any way that is not permitted by the Affiliate License Agreement.
            </li>
            <li>
              In the event of termination of the Affiliate License Agreement, the use of <strong>{{ appName }}</strong> will be subject to the End User
              limitations noted in 4.
            </li>
          </ul>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const appName = ref("Information Model");

async function goBack() {
  if (window.history.length > 2) router.back();
  else await router.push({ name: "LandingPage" });
}
</script>

<style scoped>
#license-main-container {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}
#license-content {
  flex: 1 1 auto;
  padding: 1rem 4rem;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}
.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}
.title {
  font-size: 2rem;
}

.back-button {
  width: fit-content;
}

#license-content:deep(.p-button-link) {
  padding: 0;
}
</style>
