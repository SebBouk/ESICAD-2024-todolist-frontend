<script setup lang="ts">
import { Livraison } from '../models/Livraison';
import LivraisonComponent from '@/components/LivraisonComponent.vue';
import { onMounted, ref } from 'vue';
import FooterComponent from '@/components/FooterComponent.vue';


const mesLivraison = ref<Livraison[]>([]);

onMounted(async () => {
  const livraisonRequest = await fetch('/api/admin/get-livraison');
  const livraison = await livraisonRequest.json();
  mesLivraison.value = [...livraison];
  console.log(mesLivraison.value);
});
</script>

<template>
  <table>
    <tbody>
      <tr>
        <th>Numero de livraison</th>
      </tr>
      <LivraisonComponent v-for="(element, index) in mesLivraison" :livraison="element" v-bind:key="index" />
    </tbody>
  </table>
  <FooterComponent />
</template>
