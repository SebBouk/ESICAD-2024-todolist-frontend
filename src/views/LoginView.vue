<script lang="ts">
import { defineComponent } from 'vue';

  export default defineComponent({
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
        }
      }
    }
  });
  </script>

<template>
    <div>
      <h1>Connexion</h1>
      <form @submit.prevent="submitForm">
        <div>
          <label for="email">Adresse e-mail</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Entrez votre adresse e-mail"
          />
        </div>
  
        <div>
          <label for="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Entrez votre mot de passe"
          />
        </div>
  
        <button type="submit">Se connecter</button>
  
  
        <p v-if="errorMessage">{{ errorMessage }}</p>
      </form>
    </div>
  </template>
  
  