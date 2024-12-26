import { createRouter, createWebHistory } from 'vue-router';
import TachesViews from '@/Views/TachesViews.vue';
import UsersView from '@/Views/UsersView.vue';
import HomeView from '../Views/HomeView.vue';
import ListeViews from '@/Views/ListeViews.vue';
import CategorieViews from '@/Views/CategorieViews.vue';
import LoginView from '../Views/LoginView.vue';
import AboutView from '../Views/AboutView.vue';
import DashboardView from '@/Views/DashboardView.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:'login',
      component: LoginView
    },
    {
      path:'/home',
      name:'home',
      component: HomeView
    },
    {
      path:'/about',
      name:'about',
      component: AboutView
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
    },
    {
      path:'/categories',
      name:'categories',
      component:CategorieViews
    },
    {
      path:`/dashboard/:IdUser`,
      name:'dashboard',
      component: DashboardView
    }
  ]
});

export default router;
