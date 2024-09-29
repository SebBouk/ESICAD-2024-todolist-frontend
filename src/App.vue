<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TodoComponent from './components/TodoComponent.vue';
const monTableau = ref<any[]>([]);

onMounted(async () => {
  const todosRequest = await fetch('api/todos');
  const todos = await todosRequest.json();
  monTableau.value = [...todos];
});

// const monTableau = [1, 2, 3];

const onTodoInput = async (newTodoValue: Todo, index: number) => {
  monTableau.value[index] = newTodoValue;
  // Appel PUT pour mettre à jour le todo côté serveur
  await fetch(`api/todos/${newTodoValue.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTodoValue),
  });
  console.log('monTableau est mis à jour et la modification est envoyée au serveur');
};

const deleteTodo = async (id: number, index: number) => {
  // Suppression sur le serveur
  await fetch(`api/todos/${id}`, {
    method: 'DELETE',
  });
  // Mise à jour locale du tableau
  monTableau.value.splice(index, 1);
  console.log('Todo supprimé');
};

</script>

<template>
  <p>Hello World !</p>
  <span v-if="monTableau.length % 2 === 0">Mon tableau est pair</span>
  <span v-else>Mon tableau est impair</span>
  <br />
  <TodoComponent v-for="(element, index) in monTableau" :todo="element" v-bind:key="index"
    @onInput="onTodoInput($event, index)" @onDelete="deleteTodo(element.id, index)" />
  <!-- {{ monTableau }} -->

</template>

<style scoped></style>
