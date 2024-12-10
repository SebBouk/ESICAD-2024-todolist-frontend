<script setup lang="ts">
import { Taches } from '@/models/Taches';
import TacheComponent from '../components/TacheComponent.vue';
import { onMounted, ref } from 'vue';

const mesTaches = ref<Taches[]>([]);

onMounted(async()=>{
    const tacheRequest = await fetch('/api/taches');
    const taches = await tacheRequest.json();
    mesTaches.value = [...taches]
})

</script>
<template>
    <p>Taches view</p>
    <TacheComponent v-for="(element,index) in mesTaches" :tache="element" v-bind:key="index"/>
</template>