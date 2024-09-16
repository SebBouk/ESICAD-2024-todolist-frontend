<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TodoComponent from './components/TodoComponent.vue';
const monTableau = ref([]);

onMounted(async () => {
  const todosRequest = await fetch('http://localhost:3000/todos');
  const todos = await todosRequest.json();
  monTableau.value = [...todos];
});

// const monTableau = [1, 2, 3];

const onTodoInput = (newTodoValue: any, index: number) => {
  monTableau.value[index] = newTodoValue;
  console.log('monTableau est mis à jour');
}

</script>

<template>
  <p>Hello World !</p>
  <span v-if="monTableau.length % 2 === 0">Mon tableau est pair</span>
  <span v-else>Mon tableau est impair</span>
  <br />
  <TodoComponent v-for="(element, index) in monTableau" :todo="element" v-bind:key="index"
    @onInput="onTodoInput($event, index)" />

  <!-- {{ monTableau }} -->

</template>

<style scoped></style>
