import Vue from 'vue';
import VueRouter from 'vue-router';
import PageIndex from '../views/PageIndex.vue';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: PageIndex,
    },
    {
      path: '/constructor',
      name: 'constructor',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/PageConstructor.vue'),
    },
  ],
});

export default router;
