<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- Top Header -->
    <header class="bg-[#001a54] text-white flex flex-row items-center justify-between p-4">
      <img alt="logo_04" class="h-12" src="@/assets/logo_04.png" />
      <div class="flex flex-col items-center">
        <h1 class="text-2xl font-bold">北极海冰时空多尺度预报基础模型 MetaICE</h1>
        <p class="text-lg">
          MetaICE: Fundation Model for Arctic Sea Ice Spatio-Temporal Multi-Scale Forecasting
        </p>
      </div>
      <div class="w-12"></div>
      <div class="flex-none">
        <a
          href="https://kmrvyozrlx.k.topthink.com/@oucaigroup/readme.html"
          target="_blank"
          class="text-white hover:text-gray-300"
          >关于我们</a
        >
      </div>
    </header>
    <hr class="border-t-2 border-gray-700 w-full" />
    <div class="flex flex-1">
      <!-- Sidebar Navigation -->
      <nav class="bg-[#001a54] text-white w-40 flex flex-col space-y-4 p-4">
        <RouterLink to="/" class="hover:text-gray-300" active-class="text-yellow-300"
          >实时逐日预报</RouterLink
        >
        <RouterLink
          to="/real-time-monthly-forecast"
          class="hover:text-gray-300"
          active-class="text-yellow-300"
          >实时逐月预报</RouterLink
        >
        <RouterLink
          to="/daily-forecast-predict"
          class="hover:text-gray-300"
          active-class="text-yellow-300"
          >逐日预报测试</RouterLink
        >
        <RouterLink
          to="/monthly-forecast-predict"
          class="hover:text-gray-300"
          active-class="text-yellow-300"
          >逐月预报测试</RouterLink
        >
        <RouterLink
          to="/uncertainty-analysis"
          class="hover:text-gray-300"
          active-class="text-yellow-300"
          >不确定性分析</RouterLink
        >
        <RouterLink
          to="/dynamics-analysis"
          class="hover:text-gray-300"
          active-class="text-yellow-300"
          >动力学分析</RouterLink
        >
      </nav>
      <!-- Main Content -->
      <main class="flex-1 p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>
