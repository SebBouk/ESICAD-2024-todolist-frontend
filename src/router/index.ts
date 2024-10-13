import { createRouter, createWebHistory } from 'vue-router';
import NotFoundView from '@/Views/NotFoundView.vue';
import HomeView from '@/Views/HomeView.vue';
import AboutView from '@/Views/AboutView.vue';
import LoginView from '@/Views/LoginView.vue';
import UsersComponent from '@/components/UsersComponent.vue';
import TacheComponent from '@/components/TacheComponent.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // La route de base, généralement pour la page d'accueil
      name: 'home',
      component: HomeView // Composant qui sera rendu pour cette route
    },
    {
      path: '/about', // Un autre chemin, pour une page "À propos"
      name: 'about',
      component: AboutView
    },
    {
      path: '/:catchAll(.*)', // Route pour gérer les 404 (pages non trouvées)
      name: 'not-found',
      component: NotFoundView
    },
    {
      path:'/login',
      name: 'login',
      component: LoginView
    },
    {
      path:'/users',
      name:'users',
      component: UsersComponent
    },
    {
      path:'/tache',
      name:'tache',
      component: TacheComponent
    }
  ]
});

export default router;
