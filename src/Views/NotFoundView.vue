<template>
    <div class="not-found">
      <h1>404 - Page Non Trouvée</h1>
      <p>La page que vous recherchez n'existe pas.</p>
      <router-link to="/">Retour à l'accueil</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFoundView',
  };
  </script>
  
  <style scoped>
  .not-found {
    text-align: center;
    margin-top: 50px;
  }
  
  .not-found h1 {
    font-size: 3rem;
    color: #ff6b6b;
  }
  
  .not-found p {
    margin: 20px 0;
  }
  
  .not-found a {
    color: #3498db;
    text-decoration: none;
  }
  
  .not-found a:hover {
    text-decoration: underline;
  }
  </style>
  