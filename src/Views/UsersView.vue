<script setup lang="ts">
import { Users } from '@/models/Users';
import UserComponent from '../components/UserComponent.vue';
import { onMounted, ref } from 'vue';

const mesUsers = ref<Users[]>([]);

onMounted(async()=>{
    const userRequest = await fetch('/api/users');
    const users = await userRequest.json();
    mesUsers.value = [...users]
})

</script>
<template>
    <p>Users :</p>
    <UserComponent v-for="(element,index) in mesUsers" :user="element" v-bind:key="index"/>
</template>