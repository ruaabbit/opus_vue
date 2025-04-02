<template>
  <div class="main-container">
    <div class="content-wrapper">
      <div class="viewer-container">
        <div v-if="isLoading">
          <!-- 显示加载动画 -->
          <LoadingAnimation />
        </div>
        <div v-else class="globe-wrapper">
          <GlobeChartEchartsGL class="globe-chart" :images="images" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRealtimeMonthPrediction } from '@/common/api'
import LoadingAnimation from '../components/LoadingAnimation.vue'
import GlobeChartEchartsGL from '../components/GlobeChartEchartsGL.vue'

const images = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const data = await useRealtimeMonthPrediction()
    if (data.success && data.data.images) {
      images.value = data.data.images
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.main-container {
  margin: 0 auto;
  display: flex;
  max-height: 100vh;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
}

.viewer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80vh;
}

.globe-wrapper {
  position: relative;
  width: 80vw;
  height: 80vh;
}

.globe-chart {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 12px;
  border-radius: 8px;
  color: white;
  text-align: center;
}

.date-display {
  font-size: 18px;
  margin-bottom: 10px;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.playback-controls button {
  padding: 5px 15px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.playback-controls button:hover {
  background-color: #1565c0;
}
</style>
