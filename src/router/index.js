import { createRouter, createWebHashHistory } from 'vue-router'
import RealTimeDailyForecastView from '../views/RealTimeDailyForecastView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'real-time-daily-forecast',
      component: RealTimeDailyForecastView
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
      path: '/model-interpreter',
      name: 'model-interpreter',
      component: () => import('../views/ModelInterpreterView.vue')
    }
  ]
})

export default router
