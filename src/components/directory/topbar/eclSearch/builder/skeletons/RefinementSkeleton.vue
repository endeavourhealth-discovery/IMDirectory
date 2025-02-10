<template>
  <div class="skeleton-refinement-container">
    <Skeleton class="autocomplete-skeleton" />
    <Skeleton class="dropdown-descendant-skeleton" />
    <Skeleton class="dropdown-operator-skeleton" />
    <Skeleton class="autocomplete-skeleton" />
    <Skeleton class="dropdown-descendant-skeleton" />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.skeleton-refinement-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  padding: 0;
  border: none;
  border-radius: 5px;
  background-color: unset;
  margin: 0.5rem;
  flex: 1;
}

.autocomplete-skeleton {
  flex: 1 0 25%;
  height: 2rem !important;
}

.dropdown-descendant-skeleton {
  flex: 0 1 15%;
  height: 2rem !important;
}

.dropdown-operator-skeleton {
  flex: 0 1 10%;
  height: 2rem !important;
}
</style>
