import { createRouter, createWebHistory } from 'vue-router';
import TachesViews from '@/Views/TachesViews.vue';
import UsersView from '@/Views/UsersView.vue';
import UsersViewTest from '../Views/UsersViewTest.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:'home',
      component: UsersViewTest
    },
    {
      path:'/users',
      name:'users',
      component: UsersView
    },
    {
      path:'/taches',
      name:'taches',
      component: TachesViews
    },
  ]
});

export default router;
