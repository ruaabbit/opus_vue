<template>
  <el-row ref="viewerContainer" class="demo-viewer">
    <div id="cesiumContainer"></div>
    <!-- 控制UI - 包含加载状态、日期显示和播放控制 -->
    <div class="controls" ref="controlsRef" @mousedown="startDrag" :style="controlsStyle">
      <div class="controls-header">
        <div class="drag-handle">☰</div>
      </div>
      <div v-if="isPreloading || isFading" class="loading-indicator">
        {{ isPreloading ? '图片加载中...' : isFading ? '切换中...' : '' }}
      </div>
      <div class="date-display">{{ currentDate }}</div>
      <div class="playback-controls">
        <button @click="togglePlayback" :disabled="isPreloading || !imagesLoaded">
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          v-model.number="playbackInterval"
          :disabled="isPreloading || !imagesLoaded"
        />
        <span>间隔: {{ playbackInterval.toFixed(1) }} 秒</span>
      </div>
    </div>
  </el-row>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue'

/** @type {typeof import('@cesium/engine').Cesium} */
let Cesium = window.Cesium

// 拖拽相关状态
const controlsRef = ref(null)
const isDragging = ref(false)
const position = reactive({
  x: 0,
  y: 0
})
const dragOffset = reactive({
  x: 0,
  y: 0
})

// 控制面板样式
const controlsStyle = computed(() => ({
  position: 'fixed',
  left: `${position.x}px`,
  top: `${position.y}px`,
  transform: 'none'
}))

// 拖拽处理方法
const startDrag = (e) => {
  if (e.target.classList.contains('drag-handle')) {
    isDragging.value = true
    dragOffset.x = e.clientX - position.x
    dragOffset.y = e.clientY - position.y

    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', stopDrag)
  }
}

const handleDrag = (e) => {
  if (isDragging.value) {
    position.x = e.clientX - dragOffset.x
    position.y = e.clientY - dragOffset.y
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 初始化控制面板位置
onMounted(() => {
  const viewerWidth = window.innerWidth
  const viewerHeight = window.innerHeight
  position.x = (viewerWidth - 100) / 2
  position.y = viewerHeight - 200 // 距离底部200px
})

// 组件属性定义
const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
})

// 状态管理
let viewer = null
let imageryLayers = []
const currentIndex = ref(0)
const isPlaying = ref(true)
const playbackInterval = ref(2)
const imagesLoaded = ref(false)
const isPreloading = ref(false)
const isFading = ref(false)
let playbackTimer = null
let fadeTimer = null

const fadeDuration = 500 // Increased for smoother transitions
const fadeSteps = 30 // More steps for smoother fading
let useSmooth = true // Track transition mode

// 计算属性：获取当前日期显示文本
const currentDate = computed(() => {
  if (props.images.length > 0 && currentIndex.value < props.images.length) {
    return props.images[currentIndex.value].date
  }
  return 'N/A'
})

// 初始化 Cesium viewer
const initCesium = () => {
  // 禁用默认的影像提供者
  const options = {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    creditContainer: document.createElement('div'), // 隐藏版权信息
    terrainProvider: undefined,
    imageryProvider: false
  }

  viewer = new Cesium.Viewer('cesiumContainer', options)

  // 设置北极视角
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(0, 90, 10000000),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0.0
    }
  })

  // 添加基础海冰背景图
  viewer.imageryLayers.addImageryProvider(
    new Cesium.SingleTileImageryProvider({
      url: '/seaice/picture/sea_ice_map.webp'
    })
  )

  // 创建时序图层
  createImageryLayers()
}

// 创建图层
const createImageryLayers = () => {
  // 清除现有图层
  imageryLayers.forEach((layer) => {
    viewer.imageryLayers.remove(layer)
  })
  imageryLayers = []

  // 为每个图像创建新图层
  props.images.forEach((imageData) => {
    const layer = viewer.imageryLayers.addImageryProvider(
      new Cesium.SingleTileImageryProvider({
        url: 'https://seaice.52lxy.one:20443' + imageData.path
      })
    )
    layer.show = false
    layer.alpha = 0
    imageryLayers.push(layer)
  })

  // 预加载图像
  preloadImages(props.images)
}

// 预加载图像
const preloadImages = async (imageList) => {
  if (!imageList || imageList.length === 0) {
    imagesLoaded.value = true
    isPreloading.value = false
    return
  }

  isPreloading.value = true
  imagesLoaded.value = false
  console.log('Starting image preloading...')

  const promises = imageList.map((imgData) => {
    return new Promise((resolve) => {
      const img = new Image()
      if (!imgData || !imgData.path) {
        console.warn('Image data or path missing:', imgData)
        resolve()
        return
      }
      const imgUrl = 'https://seaice.52lxy.one:20443' + imgData.path
      img.onload = () => resolve(imgUrl)
      img.onerror = () => {
        console.error(`Failed to load image: ${imgUrl}`)
        resolve()
      }
      img.src = imgUrl
    })
  })

  try {
    await Promise.all(promises)
    console.log('All images preloaded (or attempted).')

    // Ensure synchronous execution of state updates
    imagesLoaded.value = true
    if (imageryLayers.length > 0) {
      imageryLayers[currentIndex.value].show = true
      imageryLayers[currentIndex.value].alpha = 1.0
      if (isPlaying.value) {
        startPlayback()
      }
    }
  } catch (error) {
    console.error('Error during image preloading:', error)
    imagesLoaded.value = false
  } finally {
    isPreloading.value = false
  }
}

// 图层淡入淡出过渡动画
const crossFadeLayers = (oldIndex, newIndex) => {
  if (isFading.value) {
    clearInterval(fadeTimer)
  }

  isFading.value = true
  const oldLayer = imageryLayers[oldIndex]
  const newLayer = imageryLayers[newIndex]

  if (!oldLayer || !newLayer) {
    console.error('Cannot perform fade: Layer not found.')
    isFading.value = false
    if (newLayer) {
      newLayer.show = true
      newLayer.alpha = 1.0
    }
    if (oldLayer) {
      oldLayer.show = false
      oldLayer.alpha = 0
    }
    return
  }

  newLayer.alpha = 0
  newLayer.show = true

  let currentStep = 0
  const alphaIncrement = 1.0 / fadeSteps
  const stepDuration = fadeDuration / fadeSteps

  fadeTimer = setInterval(() => {
    currentStep++
    const newAlpha = Math.min(1.0, currentStep * alphaIncrement)
    const oldAlpha = Math.max(0.0, 1.0 - newAlpha)

    newLayer.alpha = newAlpha
    if (oldLayer !== newLayer) {
      oldLayer.alpha = oldAlpha
    }

    if (currentStep >= fadeSteps) {
      clearInterval(fadeTimer)
      newLayer.alpha = 1.0
      if (oldLayer !== newLayer) {
        oldLayer.alpha = 0.0
        oldLayer.show = false
      }
      isFading.value = false
    }
  }, stepDuration)
}

// 切换到下一张图像
const nextImage = () => {
  if (props.images.length === 0 || !imagesLoaded.value) {
    return
  }

  // If currently fading, skip this transition
  if (isFading.value) {
    return
  }

  const oldIndex = currentIndex.value
  const newIndex = (oldIndex + 1) % props.images.length
  currentIndex.value = newIndex

  if (useSmooth) {
    crossFadeLayers(oldIndex, newIndex)
  } else {
    // Instant transition
    imageryLayers[oldIndex].show = false
    imageryLayers[oldIndex].alpha = 0.0
    imageryLayers[newIndex].show = true
    imageryLayers[newIndex].alpha = 1.0
  }
}

// 停止播放
const stopPlayback = () => {
  if (playbackTimer) {
    clearInterval(playbackTimer)
    playbackTimer = null
  }
  clearInterval(fadeTimer)
  fadeTimer = null
  isFading.value = false

  // Instantly show current image and hide others
  imageryLayers.forEach((layer, index) => {
    if (layer) {
      const isCurrent = index === currentIndex.value
      layer.show = isCurrent
      layer.alpha = isCurrent ? 1.0 : 0.0
    }
  })
}

// 开始播放
const startPlayback = () => {
  if (!imagesLoaded.value || !isPlaying.value || props.images.length === 0) {
    return
  }

  stopPlayback()

  // Ensure current image is visible
  if (imageryLayers.length > 0) {
    // Reset all layers first
    imageryLayers.forEach((layer) => {
      if (layer) {
        layer.show = false
        layer.alpha = 0.0
      }
    })

    // Show current layer
    if (imageryLayers[currentIndex.value]) {
      imageryLayers[currentIndex.value].show = true
      imageryLayers[currentIndex.value].alpha = 1.0
    }

    // Calculate interval and determine transition behavior
    const intervalMs = playbackInterval.value * 1000
    useSmooth = intervalMs < 3000 // Update global transition mode

    if (useSmooth) {
      // For faster playback, ensure smooth transitions with fade duration padding
      playbackTimer = setInterval(
        () => {
          if (!isFading.value) {
            nextImage()
          }
        },
        Math.max(fadeDuration + 100, intervalMs)
      )
    } else {
      // For slower playback, allow immediate transitions
      playbackTimer = setInterval(nextImage, intervalMs)
    }
  }
}

// 切换播放/暂停状态
const togglePlayback = () => {
  if (isPreloading.value || !imagesLoaded.value) return
  isPlaying.value = !isPlaying.value
}

// 监听播放状态变化
watch(isPlaying, (newValue) => {
  if (newValue) {
    startPlayback()
  } else {
    stopPlayback()
  }
})

// 监听播放间隔变化
watch(playbackInterval, () => {
  if (isPlaying.value) {
    startPlayback()
  }
})

// 监听输入图像数组变化
watch(
  () => props.images,
  () => {
    stopPlayback()
    currentIndex.value = 0
    imagesLoaded.value = false
    isPreloading.value = false
    isFading.value = false

    if (viewer) {
      createImageryLayers()
    }
  },
  { deep: true }
)

// 组件挂载时初始化
onMounted(async () => {
  // 加载 Cesium CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = '/seaice/Cesium/Widgets/widgets.css'
  document.head.appendChild(link)

  // 动态引入 Cesium
  const script = document.createElement('script')
  script.src = '/seaice/Cesium/Cesium.js'
  script.onload = () => {
    // 确保Cesium对象可用
    Cesium = window.Cesium
    if (Cesium) {
      initCesium()
      if (props.images && props.images.length > 0) {
        preloadImages(props.images)
      } else {
        imagesLoaded.value = true
        isPreloading.value = false
      }
    } else {
      console.error('Failed to load Cesium')
    }
  }
  document.head.appendChild(script)
})

// 组件卸载时清理资源
onUnmounted(() => {
  stopPlayback()
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
  imageryLayers = []
})
</script>

<style scoped>
.demo-viewer {
  height: 100%;
  width: 100%;
  position: relative;
}

#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.controls {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 12px;
  border-radius: 8px;
  color: white;
  text-align: center;
  z-index: 9999;
  min-width: 300px;
  pointer-events: auto;
  user-select: none;
  cursor: move;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.3s;
}

.controls:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.controls-header {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  cursor: move;
}

.drag-handle {
  color: #409eff;
  font-size: 20px;
  cursor: move;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.drag-handle:hover {
  background-color: rgba(64, 158, 255, 0.1);
  transform: scale(1.1);
}

.loading-indicator {
  font-size: 14px;
  margin-bottom: 8px;
  color: #ffcc00;
  min-height: 1.2em;
}

.date-display {
  font-size: 16px;
  margin-bottom: 10px;
  min-height: 1.2em;
}

.playback-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.playback-controls button {
  padding: 5px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    opacity 0.3s;
}

.playback-controls button:hover:not(:disabled) {
  background-color: #66b1ff;
}

.playback-controls button:disabled {
  background-color: #909399;
  cursor: not-allowed;
  opacity: 0.6;
}

.playback-controls input[type='range'] {
  cursor: pointer;
}

.playback-controls input[type='range']:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.playback-controls span {
  min-width: 60px;
  text-align: right;
}
</style>
