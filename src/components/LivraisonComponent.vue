<script setup lang="ts">
import { Livraison } from '@/models/Livraison';
import { useRouter } from 'vue-router';

const props = defineProps<{
    livraison : Livraison;
}>();

const ColisRouteur = useRouter()

function goToColis() {
    ColisRouteur.push(`/colis/${props.livraison.IdLivraison}`);
}
</script>

<template>
    <tr>
        <td> {{ props.livraison.IdLivraison }}</td>
        <td><button @click="goToColis">Colis</button></td>
        <td><button @click="$router.push('/tournee')">Tournee</button></td>
    </tr>
</template>