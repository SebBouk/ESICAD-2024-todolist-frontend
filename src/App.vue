<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TodoComponent from './components/TodoComponent.vue';
import { Todo } from './models/Todo';
import { Users } from './models/Users';
import Userscomponent from './components/UsersComponent.vue';

const monTableau = ref<Todo[]>([]);

const mesUsers = ref<Users[]>([]);

// onMounted(async () => {
//   const todosRequest = await fetch('/api/todos');
//   const todos: Todo[] = await todosRequest.json();
//   monTableau.value = [...todos];
// });

onMounted(async () => {
  const UsersRequest = await fetch('/api/users');
  const Users: Users[] = await UsersRequest.json();
  mesUsers.value = [...Users];
});
// const monTableau = [1, 2, 3];

const onTodoInput = async (newTodoValue: Todo, index: number) => {
  monTableau.value[index] = newTodoValue;
  await fetch(`/api/todos/${newTodoValue.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newTodoValue)
  });
  console.log('monTableau est mis à jour et la modification est envoyée au serveur');
};

const deleteTodo = async (id: number, index: number) => {
  await fetch(`/api/todos/${id}`, {
    method: 'DELETE'
  });
  monTableau.value.splice(index, 1);
  console.log('Todo supprimé');
};

const ajouterElement = async () => {
  const nouvelleTache = { label: 'Nouvelle tâche', done: false };

  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nouvelleTache)
  });

  if (response.ok) {
    const nouvelleTacheAjoutee = await response.json();

    monTableau.value.push(nouvelleTacheAjoutee);
  } else {
    console.error("Erreur lors de l'ajout de la tâche");
  }
};
</script>

<template>
  <div>
    <nav>
      <router-link to="/">Accueil</router-link>
      <router-link to="/about">À propos</router-link>
      <router-link to="/login">Connexion</router-link>
    </nav>

    <!-- Afficher le contenu du composant en fonction de la route -->
    <router-view></router-view>
  </div>

  <p>Hello World ! It's my Todolist !!!</p>
  <span v-if="monTableau.length % 2 === 0">Mon tableau est pair</span>
  <span v-else>Mon tableau est impair</span>
  <br />
  <br />
  <div v-for="(element, index) in mesUsers" :key="element.idUser">
    <Userscomponent :users="element" @onInput="onTodoInput($event, index)" />
    <button class="suppr" @click="deleteTodo(element.idUser, index)">Supprimer</button>
  </div>

  <!-- <div v-for="(element, index) in monTableau" :key="element.id">
    <TodoComponent :todo="element" @onInput="onTodoInput($event, index)" />
    <button class="suppr" @click="deleteTodo(element.id, index)">Supprimer</button>
  </div>
  <br /> -->
  <button @click="ajouterElement">Ajouter une tâche</button>
</template>

<style scoped>
.suppr {
  display: inline-block;
  background-color: #d62d2d;
  border-radius: 10px;
  border: 4px double #cccccc;
  color: #eeeeee;
  text-align: center;
  font-size: 18px;
  padding: 10px;
  width: 150px;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
  cursor: pointer;
  margin: 5px;
}
</style>
