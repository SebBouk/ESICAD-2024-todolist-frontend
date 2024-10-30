<script setup lang="ts">

</script>
<template>
  <nav>
    <RouterLink to="/clients" class="nav-link">Clients</RouterLink>
    <RouterLink to="/colis" class="nav-link">Colis</RouterLink>
    <RouterLink to="/commandes" class="nav-link">Commandes</RouterLink>
    <RouterLink to="/livraison" class="nav-link">Livraisons</RouterLink>
    <RouterLink to="/Tournee" class="nav-link">Tournées</RouterLink>
  </nav>
  <RouterView></RouterView>
</template>
