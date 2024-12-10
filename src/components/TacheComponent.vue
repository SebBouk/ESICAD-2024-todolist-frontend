<script setup lang="ts">
import { Taches } from '@/models/Taches';

const props = defineProps<{
    tache: Taches;
}>();



</script>
<template>
   <p> Tache : {{ props.tache.NomTache }}</p>
   <p> Date de fin : {{ props.tache.EcheanceTache }}</p> 
</template>