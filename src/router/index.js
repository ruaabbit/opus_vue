import { createRouter, createWebHistory } from 'vue-router'
import OpusView from '../views/OpusView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'opus',
      component: OpusView
    },
    {
      path: '/real-time-daily-forecast',
      name: 'real-time-daily-forecast',
      component: () => import('../views/RealTimeDailyForecastView.vue')
    },
    {
      path: '/real-time-monthly-forecast',
      name: 'real-time-monthly-forecast',
      component: () => import('../views/RealTimeMonthlyForecastView.vue')
    },
    {
      path: '/daily-forecast-predict',
      name: 'daily-forecast-predict',
      component: () => import('../views/DailyForecastPredictView.vue')
    },
    {
      path: '/monthly-forecast-predict',
      name: 'monthly-forecast-predict',
      component: () => import('../views/MonthlyForecastPredictView.vue')
    },
    {
      path: '/uncertainty-analysis',
      name: 'uncertainty-analysis',
      component: () => import('../views/UncertaintyAnalysisView.vue')
    },
    {
      path: '/dynamics-analysis',
      name: 'dynamics-analysis',
      component: () => import('../views/DynamicsAnalysisView.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
