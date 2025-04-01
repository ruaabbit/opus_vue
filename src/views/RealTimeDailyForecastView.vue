<template>
  <div class="main-container">
    <div class="content-wrapper">
      <div class="viewer-container">
        <div v-if="isLoading">
          <!-- 显示加载动画 -->
          <LoadingAnimation />
        </div>
        <div v-else class="globe-wrapper">
          <GlobeChartEchartsGL
            class="globe-chart"
            :images="images"
            :current-index="currentIndex"
            :auto-rotate="false"
          />
          <div class="controls">
            <div class="date-display">{{ currentDate }}</div>
            <div class="playback-controls">
              <button @click="togglePlayback">{{ isPlaying ? '暂停' : '播放' }}</button>
              <input type="range" min="1" max="10" v-model.number="playbackSpeed" />
              <span>速度: {{ playbackSpeed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRealtimeDayPrediction } from '@/common/api'
import LoadingAnimation from '../components/LoadingAnimation.vue'
import GlobeChartEchartsGL from '../components/GlobeChartEchartsGL.vue'

const images = ref([])
const isLoading = ref(true)
const currentIndex = ref(0)
const isPlaying = ref(true)
const playbackSpeed = ref(3)
let playbackTimer = null

// 计算当前显示的日期
const currentDate = computed(() => {
  if (images.value.length > 0 && currentIndex.value < images.value.length) {
    return images.value[currentIndex.value].date
  }
  return ''
})

// 切换到下一张图片
const nextImage = () => {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

// 控制播放/暂停
const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startPlayback()
  } else {
    stopPlayback()
  }
}

// 开始播放
const startPlayback = () => {
  stopPlayback() // 确保没有多个定时器运行
  playbackTimer = setInterval(nextImage, 1000 / playbackSpeed.value)
}

// 停止播放
const stopPlayback = () => {
  if (playbackTimer) {
    clearInterval(playbackTimer)
    playbackTimer = null
  }
}

// 监听播放速度变化
watch(playbackSpeed, () => {
  if (isPlaying.value) {
    startPlayback() // 重新启动定时器使用新速度
  }
})

onMounted(async () => {
  try {
    const data = await useRealtimeDayPrediction()
    if (data.success && data.data.images) {
      images.value = data.data.images

      // 开始自动播放
      if (images.value.length > 1) {
        startPlayback()
      }
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
})

// 组件卸载时清除定时器
onUnmounted(() => {
  stopPlayback()
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
