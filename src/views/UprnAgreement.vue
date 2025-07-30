<template>
  <div id="license-main-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>UPRN</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="license-content">
      <Button label="Back" icon="fa-solid fa-arrow-left" @click="goBack" class="back-button" />
      <h1>UPRN License Agreement</h1>
      <h3>Attribution statement</h3>
      <p>
        This code is available to use under the Apache License Version 2.0. (see LICENSE file) and may not be used unless in compliance with the License, and
        with the following attribution against any outputs created from the use of this code including the assignment of UPRNs, geo-coordinates or any
        pseudonymised or other data based on these.
      </p>
      <p>
        This service/work/research acknowledges the use of the Open Access Discovery Programme UPRN-match Address Matching Algorithm (current version 4.2) which
        is licensed under Apache 2.0 and can be accessed <Button link as="a" href="https://github.com/endeavourhealth-discovery/uprn-match">here</Button>. The
        current version number can be found
        <Button link as="a" href="https://wiki.discoverydataservice.org/index.php?title=UPRN_address_matching_algorithm#Best_fit_ranking">here</Button>.
      </p>
      <p>
        This algorithm was developed by David Stables with the support of the Endeavour Health Charity, and by Gill Harper and Carol Dezateux, Queen Mary,
        University of London, with the support of funding from Barts Charity and OneLondon. It was also supported by Health Data Research UK, an initiative
        funded by UK Research and Innovation, Department of Health and Social Care (England) and the devolved administrations, and leading medical research
        charities. This product also includes an API developed by Learning Health Solutions.
      </p>
      <p>
        Ordnance Survey AddressBase Premium is used by the algorithm as the source of Unique Property Reference Numbers (UPRNs), made available to the
        developers by the Ordnance Survey Public Sector Geospatial Agreement.
      </p>
      <p>
        The code developers, their organisations, the funders and the Discovery Programme bear no responsibility for the implementation, use, analysis or
        interpretation of outputs derived from its use (see disclaimer).
      </p>
      <h3>Disclaimer</h3>
      <p>
        The Discovery Programme Address Matching Algorithm has been developed to give a deterministic match to the best estimate Ordnance Survey AddressBase
        Premium Unique Property Reference Number (UPRN) of where a person lives based on their NHS patient recorded address. To facilitate this, only UPRNs with
        relevant residential property classification codes in Ordnance Survey AddressBase Premium are matched to by the algorithm. Documentation of the method
        can be found
        <Button link as="a" href="https://wiki.discoverydataservice.org/index.php?title=UPRN_address_matching_algorithm#Best_fit_ranking">here</Button>.
      </p>
      <p>
        The algorithm has evolved throughout its development and has been quality assured against gold standard datasets to calculate error rates and evaluated
        for bias in non-matches. The quality of the UPRN match is also dependent on the quality of the input address and the quality and completeness of
        Ordnance Survey AddressBase Premium, of which the Discovery Programme has no control.
      </p>
      <p>
        The UPRN match is assigned a qualifier that indicates how close a match the assigned UPRN is considered to be based on the format of the patient address
        supplied.
      </p>

      <p>
        The algorithm error rates and description of match qualifiers can also be found
        <Button link as="a" href="https://wiki.discoverydataservice.org/index.php?title=UPRN_address_matching_algorithm#Best_fit_ranking">here</Button>.
      </p>
      <p>
        The user should be aware of the aforementioned caveats and how they might affect the particular purpose for which they intend to use the assigned UPRNs.
        The code developers, their organisations and funders, and the Discovery Programme bear no responsibility for the implementation, use, analysis or
        interpretation of outputs derived from its use.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/shared/TopBar.vue";
import { useRouter } from "vue-router";

const router = useRouter();

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
