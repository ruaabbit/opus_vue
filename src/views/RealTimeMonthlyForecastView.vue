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
// import { useRealtimeMonthPrediction } from '@/common/api'
import LoadingAnimation from '../components/LoadingAnimation.vue'
import GlobeChartCesium from '../components/GlobeChartCesium.vue'

const images = ref([])
const isLoading = ref(true)
const backgroundImage = '/seaice/picture/sea_ice_visualization_background.png'

onMounted(async () => {
  try {
    images.value = [
      {
        path: '/media/temp/sea_ice_visualization_20240815.png',
        date: '2025-08'
      },
      {
        path: '/media/temp/sea_ice_visualization_20240915.png',
        date: '2025-09'
      },
      {
        path: '/media/temp/sea_ice_visualization_20241015.png',
        date: '2025-10'
      },
      {
        path: '/media/temp/sea_ice_visualization_20241115.png',
        date: '2025-11'
      },
      {
        path: '/media/temp/sea_ice_visualization_20241215.png',
        date: '2025-12'
      },
      {
        path: '/media/temp/sea_ice_visualization_20240115.png',
        date: '2026-01'
      },
      {
        path: '/media/temp/sea_ice_visualization_20240215.png',
        date: '2026-02'
      },
      {
        path: '/media/temp/sea_ice_visualization_20250315.png',
        date: '2026-03'
      },
      {
        path: '/media/temp/sea_ice_visualization_20250415.png',
        date: '2026-04'
      },
      {
        path: '/media/temp/sea_ice_visualization_20250515.png',
        date: '2026-05'
      },
      {
        path: '/media/temp/sea_ice_visualization_20250615.png',
        date: '2026-06'
      },
      {
        path: '/media/temp/sea_ice_visualization_20250715.png',
        date: '2026-07'
      }
    ]
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
