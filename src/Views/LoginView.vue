<template>
    <div class="login">
      <h1>Connexion</h1>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="email">Adresse e-mail</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Entrez votre adresse e-mail"
          />
        </div>
  
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Entrez votre mot de passe"
          />
        </div>
  
        <button type="submit" class="btn">Se connecter</button>
  
        <p class="register">
          Pas encore de compte ?
          <router-link to="/register">Inscrivez-vous ici</router-link>
        </p>
  
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoginView',
    data() {
      return {
        email: '',
        password: '',
        errorMessage: null, // Pour afficher un message d'erreur si besoin
      };
    },
    methods: {
      async submitForm() {
        try {
          // Utilisation de fetch pour envoyer une requête POST au serveur
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          });
          const data = await response.json();
  
          if (response.ok) {
            // Si la connexion est réussie, on récupère les données de la réponse
            console.log('Réponse du serveur :', data);
            alert('Connexion réussie !');
            localStorage.setItem('token', data.IdUser);
            const token = localStorage.getItem('token');
            console.log('Token récupéré :', token);

            // Redirection vers une autre page après une connexion réussie
            this.$router.push('/tache');
          } else {
            // Si le serveur retourne une erreur (comme une authentification échouée)
            const errorData = await response.json();
            this.errorMessage = errorData.message || 'Erreur lors de la connexion';
          }
        } catch (error) {
          // En cas d'erreur réseau ou autre
          console.error('Erreur de connexion :', error);
          this.errorMessage = 'Erreur lors de la communication avec le serveur';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .login {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .login h1 {
    margin-bottom: 20px;
    font-size: 2rem;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .btn {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1rem;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
  }
  
  .btn:hover {
    background-color: #2980b9;
  }
  
  .register {
    margin-top: 20px;
    font-size: 0.9rem;
  }
  
  .register a {
    color: #3498db;
    text-decoration: none;
  }
  
  .register a:hover {
    text-decoration: underline;
  }
  </style>
  