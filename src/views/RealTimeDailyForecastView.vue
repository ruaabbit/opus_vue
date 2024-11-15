<template>
  <div class="container mx-auto flex max-h-screen">
    <div class="flex flex-col items-end w-full">
      <div class="flex items-center justify-center w-full">
        <div v-if="isLoading">
          <!-- 显示加载动画 -->
          <LoadingAnimation />
        </div>
        <div v-else>
          <ArcticSeaIceViewer :images="images" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRealtimeDayPrediction } from '@/common/api'
import ArcticSeaIceViewer from '../components/ArcticSeaIceViewer.vue'
import LoadingAnimation from '../components/LoadingAnimation.vue'

const images = ref([])
const isLoading = ref(true)

onMounted(() => {
  useRealtimeDayPrediction().then((data) => {
    images.value = data
    isLoading.value = false
  })
})
</script>
