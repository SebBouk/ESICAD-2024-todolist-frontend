import { createRouter, createWebHistory } from 'vue-router';
import TachesViews from '@/Views/TachesViews.vue';
import UsersView from '@/Views/UsersView.vue';
import HomeView from '../Views/HomeView.vue';
import ListeViews from '@/Views/ListeViews.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:'home',
      component: HomeView
    },
    {
      path:'/users',
      name:'users',
      component: UsersView
    },
    {
      path:'/tache',
      name:'tache',
      component: TachesViews
    },
    {
      path:'/listes',
      name:'liste',
      component: ListeViews
    }
  ]
});

export default router;
