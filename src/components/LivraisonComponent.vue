<script setup lang="ts">
import { Livraison } from '@/models/Livraison';

const props = defineProps<{
    livraison : Livraison;
}>();

</script>

<template>
    <tr>
        <td> {{ props.livraison.IdLivraison }}</td>
        <td><button @click="$router.push('/colis')">Colis</button></td>
        <td><button @click="$router.push('/tournee')">Tournee</button></td>
    </tr>
</template>