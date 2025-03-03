<template>
  <div class="forecast-container">
    <div class="forecast-content">
      <div class="viewer-wrapper">
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

<style scoped>
.forecast-container {
  width: 100%;
  max-height: 100vh;
  margin: 0 auto;
  display: flex;
}

.forecast-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
}

.viewer-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
