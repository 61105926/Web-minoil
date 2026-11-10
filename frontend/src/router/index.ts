import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/services/auth.service'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vacaciones',
      name: 'Vacaciones',
      component: () => import('@/views/VacacionesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/relevamiento-impostor',
      name: 'RelevamientoImpostor',
      component: () => import('@/views/RelevamientoImpostorView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reemplazo-cerveza',
      name: 'ReemplazoCerveza',
      component: () => import('@/views/ReemplazoCervezaView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reportes',
      name: 'Reportes',
      component: () => import('@/views/ReportesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/programacion-relevamiento',
      name: 'ProgramacionRelevamiento',
      component: () => import('@/views/ProgramacionRelevamientoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/materiales',
      name: 'Materiales',
      component: () => import('@/views/MaterialesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/distribuidores',
      name: 'Distribuidores',
      component: () => import('@/views/DistribuidoresView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/configuracion',
      name: 'Configuracion',
      component: () => import('@/views/ConfiguracionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/callback',
      name: 'Callback',
      component: () => import('@/views/Callback.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      redirect: '/dashboard'
    }
  ]
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    // No hay ruta de login — redirige directo a Keycloak
    authService.startLogin()
    next(false)
  } else {
    next()
  }
})

export default router
