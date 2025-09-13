<template>
  <div class="globe-container">
    <div v-if="isLoading">
      <LoadingAnimation />
    </div>
    <div v-else>
      <GlobeChartCesium :images="images" :backgroundImage="backgroundImage" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRealtimeDayPrediction } from '@/common/api'
import LoadingAnimation from '../components/LoadingAnimation.vue'
import GlobeChartCesium from '../components/GlobeChartCesium.vue'

const images = ref([])
const isLoading = ref(true)
const backgroundImage = '/picture/sea_ice_map.webp'

onMounted(async () => {
  try {
    const data = await useRealtimeDayPrediction()
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
.globe-container {
  width: 100%;
  height: 75vh; /* 使用视口高度而不是相对高度 */
  position: relative;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.globe-container > div {
  flex: 1; /* 让子元素填充剩余空间 */
  height: 100%;
}

/* 保留其他控制组件的样式 */
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
  z-index: 10;
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
