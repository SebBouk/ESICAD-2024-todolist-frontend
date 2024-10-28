<script setup lang="ts">
import { Colis } from '@/models/Colis';

const props = defineProps<{
    colis : Colis;
}>();
</script>

<template>
    <tr>
        <td> {{ props.colis.NumColis }}</td>
        <td> {{ props.colis.AdresseColis }}</td>
        <td>{{ props.colis.ContactColis }}</td>
        <td>{{ props.colis.DateLivColis }}</td>
    </tr>
</template>