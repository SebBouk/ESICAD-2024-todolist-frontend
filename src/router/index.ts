import LoginView from '@/views/LoginView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import ClientView from "@/views/ClientView.vue"
import AdminView from '@/views/AdminView.vue';
import ColisView from '@/views/ColisView.vue';
import CommandeView from '@/views/CommandeView.vue';
import LivraisonView from '@/views/LivraisonView.vue';
import TourneeView from '@/views/TourneeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:'login',
      component: LoginView
    },
    {
      path:'/clients',
      name:'clients',
      component: ClientView
    },
    {
      path:'/admin',
      name:'admin',
      component: AdminView
    },
    {
      path:'/colis',
      name:'colis',
      component: ColisView
    },
    {
      path:'/commandes',
      name:'commande',
      component:CommandeView
    },
    {
      path:'/livraison',
      name:'livraison',
      component:LivraisonView
    },
    {
      path:'/tournee',
      name:'tournee',
      component:TourneeView
    }
  ]
});

export default router;
