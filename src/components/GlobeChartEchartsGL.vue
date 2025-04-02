<template>
  <div class="globe-chart-container" ref="chartContainer">
    <v-chart
      v-if="isEChartsReady"
      :option="option"
      :update-options="updateOption"
      :loading="isLoading"
      :loading-options="loadingOptions"
      autoresize
    />
    <div v-else class="loading-indicator">加载中，请稍后...</div>

    <div class="controls">
      <div class="date-display">{{ currentDate }}</div>
      <div class="playback-controls">
        <button @click="togglePlayback">{{ isPlaying ? '暂停' : '播放' }}</button>
        <input type="range" min="1" max="10" v-model.number="playbackSpeed" />
        <span>速度: {{ playbackSpeed }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, nextTick, watch, computed, onUnmounted } from 'vue'
import VChart, { THEME_KEY } from 'vue-echarts'

const isEChartsReady = ref(false)
const chartContainer = ref(null)

// 定义props
const props = defineProps({
  baseTexture: {
    type: String,
    default: '/seaice/picture/sea_ice_map.png'
  },
  images: {
    type: Array,
    default: () => []
  }
})

// 播放控制相关状态
const currentIndex = ref(0)
const isPlaying = ref(true)
const playbackSpeed = ref(3)
let playbackTimer = null

// 计算当前显示的日期
const currentDate = computed(() => {
  if (props.images.length > 0 && currentIndex.value < props.images.length) {
    return props.images[currentIndex.value].date
  }
  return ''
})

// 当前显示的纹理
const currentTexture = computed(() => {
  if (props.images && props.images.length > 0) {
    return 'https://seaice.52lxy.one:20443' + props.images[currentIndex.value].path
  } else {
    return null
  }
})

// 切换到下一张图片
const nextImage = () => {
  if (props.images.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
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
    startPlayback()
  }
})

const isLoading = ref(true)
const loadingOptions = {
  text: '正在加载中...',
  color: '#c23531',
  textColor: '#000',
  maskColor: 'rgba(255, 255, 255, 0.8)',
  zlevel: 0,

  fontSize: 12,
  showSpinner: true,
  spinnerRadius: 10,
  lineWidth: 5,
  fontWeight: 'normal',
  fontStyle: 'normal',
  fontFamily: 'sans-serif'
}

const option = ref({
  animation: true,
  globe: {
    baseTexture: props.baseTexture,
    shading: 'color',
    realisticMaterial: {
      roughness: 0.9
    },
    light: {
      main: {
        intensity: props.lightIntensity,
        shadow: true
      }
    },
    viewControl: {
      autoRotate: false,
      targetCoord: [0, 90]
    },
    layers: [
      {
        type: 'blend',
        blendTo: 'emphasis',
        texture: currentTexture,
        animation: true,
        regionHeight: 0.1,
        regionWidth: 0.1,
        regionColor: '#fff',
        regionOpacity: 0.5
      }
    ]
  }
})

const updateOption = {
  // notMerge: true,
  // replaceMerge: ['globe'],
  // lazyUpdate: true
}

watch(currentTexture, (newTexture) => {
  if (window.echarts && chartContainer.value) {
    if (isEChartsReady.value) {
      option.value.globe.layers[0].texture = newTexture
    }
  }
})

// 初始化ECharts
const initECharts = async () => {
  try {
    await nextTick()

    const { use } = await import('echarts/core')
    const { CanvasRenderer } = await import('echarts/renderers')
    const { GlobeComponent } = await import('echarts-gl/components')
    const { Lines3DChart } = await import('echarts-gl/charts')

    use([CanvasRenderer, GlobeComponent, Lines3DChart])

    // 确认容器尺寸
    if (chartContainer.value?.offsetWidth && chartContainer.value?.offsetHeight) {
      isEChartsReady.value = true

      // 预加载所有图片
      await preloadAllImages()
      isLoading.value = false

      // 开始自动播放
      if (props.images.length > 1) {
        startPlayback()
      }
    } else {
      throw new Error('Container dimensions not available')
    }
  } catch (error) {
    console.error('Failed to initialize ECharts:', error)
    isLoading.value = false
  }
}

// 预加载所有图片函数
const preloadAllImages = async () => {
  if (!props.images || props.images.length === 0) {
    return
  }

  const imageLoadPromises = props.images.map((image) => {
    return new Promise((resolve) => {
      const img = new Image()
      const imageUrl = 'https://seaice.52lxy.one:20443' + image.path

      img.onload = () => resolve(imageUrl)
      img.onerror = () => {
        console.warn(`Failed to preload image: ${imageUrl}`)
        resolve(null)
      }
      img.src = imageUrl
    })
  })

  try {
    await Promise.all(imageLoadPromises)
    console.log(`Successfully preloaded ${props.images.length} images`)
  } catch (error) {
    console.error('Error during image preloading:', error)
  }
}

provide(THEME_KEY, 'dark')

onMounted(async () => {
  await initECharts()
})

onUnmounted(() => {
  stopPlayback()
})
</script>

<style scoped>
.globe-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 500px;
  min-height: 500px;
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
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

:deep(.echarts) {
  width: 100% !important;
  height: 100% !important;
}
</style>
