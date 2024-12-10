<script setup lang="ts">
import { ref } from 'vue';
import { Users } from '../models/Users';

const props = defineProps<{users :Users}>();

const editMode = ref(false);


</script>

<template>
  <span v-if="!editMode">
    <span>
      {{ props.users.nomUser }}
    </span>
  </span>
  <span v-else>
    <!-- mode edition -->
    <input type="text" v-model="newValue" />
    <button @click="onConfirmText">Confirmer</button>
    <button @click="onCancelText">Annuler</button>
    <br />
  </span>
</template>
