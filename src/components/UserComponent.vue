<script setup lang="ts">
import { Users } from '@/models/Users';

const props = defineProps<{
    user: Users;
}>();



</script>
<template>
   <p> Nom User : {{ props.user.NomUser }}</p>
   <p>ID User : {{ props.user.IdUser }}</p> 
</template>