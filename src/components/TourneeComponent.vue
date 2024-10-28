<script setup lang="ts">
import { TourneeAvecEmploye } from '@/models/TourneeAvecEmploye';

const props = defineProps<{
    tournee : TourneeAvecEmploye;
}>();

</script>

<template>
    <tr>
        <td> {{ props.tournee.IdTournée }}</td>
        <td> {{ props.tournee.DateTournée }}</td>
        <td> {{ props.tournee.NomEmployé }}</td>
        <td><button @click="$router.push('/livraison')">Colis</button></td>
    </tr>
</template>