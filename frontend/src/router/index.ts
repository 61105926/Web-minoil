import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/services/auth.service'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/empleados',
      name: 'Empleados',
      component: () => import('@/views/EmpleadosView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vacaciones',
      name: 'Vacaciones',
      component: () => import('@/views/VacacionesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reportes',
      name: 'Reportes',
      component: () => import('@/views/ReportesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/configuracion',
      name: 'Configuracion',
      component: () => import('@/views/ConfiguracionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/dashboard'
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = authService.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
