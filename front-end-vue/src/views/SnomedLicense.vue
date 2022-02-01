<template>
  <Dialog header="SNOMED License Agreement" :visible="showDialog" :modal="true">
    <div>
      <div class="license-content">
        <strong>Information Model</strong> includes SNOMED Clinical Terms® (SNOMED CT®) which is used by permission of the International Health Terminology
        Standards Development Organization (IHTSDO). All rights reserved. SNOMED CT® was originally created by the College of American Pathologists. “SNOMED”,
        “SNOMED CT” and “SNOMED Clinical Terms” are registered trademarks of the IHTSDO (<a href="http://www.ihtsdo.org">www.ihtsdo.org</a>)Use of SNOMED CT in
        <strong>Information Model</strong> is governed by the conditions of the following SNOMED CT license issued by the IHTSDO:

        <ol>
          <li>
            The meaning of the terms “Affiliate”, or “Data Analysis System”, “Data Creation System”, “Derivative”, “End User”, “Extension”, “Member”,
            “Non-Member Territory”, “SNOMED CT” and “SNOMED CT Content” are as defined in the IHTSDO Affiliate License Agreement (see
            <a href="http://www.ihtsdo.org/resource/resource/117">on the IHTSDO web site</a>).
          </li>
          <li>
            Information about Affiliate Licensing is available at
            <a href="http://www.ihtsdo.org/snomed-ct/get-snomed-ct"> http://www.ihtsdo.org/snomed-ct/get-snomed-ct</a>. Individuals or organizations wishing to
            register as IHTSDO Affiliates can register at <a href="https://mlds.ihtsdotools.org">mlds.ihtsdotools.org</a>, subject to acceptance of the
            Affiliate License Agreement (see <a href="http://www.ihtsdo.org/resource/resource/117"> on the IHTSDO web site</a>).
          </li>
          <li>
            The current list of IHTSDO Member Territories can be viewed at
            <a href="http://www.ihtsdo.org/members">www.ihtsdo.org/members</a>. Countries not included in that list are "Non-Member Territories".
          </li>
          <li>
            End Users, that do not hold an IHTSDO Affiliate License, may access SNOMED CT® using <strong>Information Model</strong> subject to acceptance of and
            adherence to the following sub-license limitations:
            <ul>
              <li>
                The sub-licensee is only permitted to access SNOMED CT® using this software (or service) for the purpose of exploring and evaluating the
                terminology.
              </li>
              <li>
                The sub-licensee is not permitted the use of this software as part of a system that constitutes a SNOMED CT "Data Creation System" or "Data
                Analysis System", as defined in the IHTSDO Affiliate License. This means that the sub-licensee must not use
                <strong>Information Model</strong> to add or copy SNOMED CT identifiers into any type of record system, database or document.
              </li>
              <li>
                The sub-licensee is not permitted to translate or modify SNOMED CT Content or Derivatives.
              </li>
              <li>
                The sub-licensee is not permitted to distribute or share SNOMED CT Content or Derivatives.
              </li>
            </ul>
          </li>
          <li>
            IHTSDO Affiliates may use <strong>Information Model</strong> as part of a "Data Creation System" or "Data Analysis System" subject to the following
            conditions:
            <ul>
              <li>
                The IHTSDO Affiliate, using
                <strong>Information Model</strong> must accept full responsibility for any reporting and fees due for use or deployment of such a system in a
                Non-Member Territory.
              </li>
              <li>
                The IHTSDO Affiliate must not use
                <strong>Information Model</strong> to access or interact with SNOMED CT in any way that is not permitted by the Affiliate License Agreement.
              </li>
              <li>
                In the event of termination of the Affiliate License Agreement, the use of <strong>Information Model</strong> will be subject to the End User
                limitations noted in 4.
              </li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
    <template #footer>
      <Button class="p-button-warning" label="Decline" icon="pi pi-times" @click="submitDecline" />
      <Button label="Agree" icon="pi pi-check" @click="submitAgree" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";

export default defineComponent({
  name: "SnomedLicense",
  computed: mapState(["snomedLicenseAccepted"]),
  watch: {
    snomedLicenseAccepted(newValue) {
      if (newValue === "true") {
        this.showDialog = false;
      } else {
        this.showDialog = true;
      }
    }
  },
  data() {
    return {
      showDialog: true
    };
  },
  methods: {
    submitDecline(): void {
      window.location.href = "https://www.snomed.org/";
    },

    submitAgree(): void {
      this.$store.commit("updateSnomedLicenseAccepted", "true");
      if (this.$store.state.historyCount === window.history.length) {
        this.$router.push({ name: "Dashboard" });
      } else {
        this.$router.go(-1);
      }
    }
  }
});
</script>

<style scoped>
.license-content {
  height: 40vh;
  width: 60vw;
  overflow: auto;
  margin: 20px;
  border: 1px solid;
  padding: 10px;
}
</style>
