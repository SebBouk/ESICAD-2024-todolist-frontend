<template>
    <div class="home">
      <h1>Bienvenue sur la page d'accueil</h1>
      <p>C'est ici que commence votre aventure !</p>
      <router-link to="/about">En savoir plus sur nous</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomeView',
  };
  </script>
  
  <style scoped>
  .home {
    text-align: center;
    margin-top: 50px;
  }
  
  .home h1 {
    font-size: 2.5rem;
    color: #3498db;
  }
  
  .home p {
    margin: 20px 0;
    font-size: 1.2rem;
  }
  
  .home a {
    color: #2ecc71;
    text-decoration: none;
  }
  
  .home a:hover {
    text-decoration: underline;
  }
  </style>
  