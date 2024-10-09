<template>
    <div class="about">
      <h1>À propos de nous</h1>
      <p>Nous sommes une équipe passionnée qui développe des solutions innovantes.</p>
      <router-link to="/">Retour à l'accueil</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AboutView',
  };
  </script>
  
  <style scoped>
  .about {
    text-align: center;
    margin-top: 50px;
  }
  
  .about h1 {
    font-size: 2.5rem;
    color: #e67e22;
  }
  
  .about p {
    margin: 20px 0;
    font-size: 1.2rem;
  }
  
  .about a {
    color: #3498db;
    text-decoration: none;
  }
  
  .about a:hover {
    text-decoration: underline;
  }
  </style>
  