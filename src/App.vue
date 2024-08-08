<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- Top Header -->
    <header class="bg-[#001a54] text-white flex flex-row items-center justify-between p-4">
      <img alt="logo_04" class="h-12" src="@/assets/logo_04.png" />
      <div class="flex flex-col items-center">
        <h1 class="text-2xl font-bold">北极海冰预测结果</h1>
        <p class="text-lg">Arctic Sea Ice Prediction Results</p>
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
          >Opus</RouterLink
        >
        <RouterLink to="/1" class="hover:text-gray-300" active-class="text-yellow-300"
          >Test</RouterLink
        >
        <RouterLink to="/2" class="hover:text-gray-300" active-class="text-yellow-300"
          >Test</RouterLink
        >
        <RouterLink to="/3" class="hover:text-gray-300" active-class="text-yellow-300"
          >Test</RouterLink
        >
        <RouterLink to="/4" class="hover:text-gray-300" active-class="text-yellow-300"
          >Test</RouterLink
        >
      </nav>
      <!-- Main Content -->
      <main class="flex-1 p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>
