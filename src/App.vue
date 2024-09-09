<script setup lang="ts">
import { ref } from 'vue';
import TodoComponent from './components/TodoComponent.vue';
const monTableau = ref([{ todo: 'apprendre Vue Js', done: false },
{ todo: 'apprendre à faire des boucles', done: false },
{ todo: 'apprendre à griller des saucisses', done: true }]);

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
