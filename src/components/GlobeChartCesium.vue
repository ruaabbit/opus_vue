<template>
  <el-row ref="viewerContainer" class="demo-viewer">
    <vc-viewer @cesiumReady="onCesiumReady" @ready="onViewerReady" :baseLayer="false">
      <!-- 底图层 -->
      <vc-layer-imagery :sortOrder="0">
        <vc-imagery-provider-singletile :url="'/seaice/picture/sea_ice_map.png'" />
      </vc-layer-imagery>

      <!-- 动态海冰图层 - 使用 v-for 创建所有图层 -->
      <vc-layer-imagery
        v-for="(imageData, index) in props.images"
        :key="imageData.path || index"
        :ref="(el) => setLayerRef(el, index)"
        :show="false"
        :brightness="brightness"
        :contrast="contrast"
        :sortOrder="10"
        :alpha="0"
      >
        <vc-imagery-provider-singletile :url="'https://seaice.52lxy.one:20443' + imageData.path" />
      </vc-layer-imagery>
    </vc-viewer>
    <!-- 控制UI -->
    <div class="controls">
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
})

// state - Removed global alpha
const brightness = ref(1)
const contrast = ref(1)
let myViewer = null
let Cesium = null

// Playback state
const currentIndex = ref(0)
const isPlaying = ref(true)
const playbackInterval = ref(2) // Default interval in seconds (e.g., 2 seconds per image)
let playbackTimer = null

// Preloading state
const imagesLoaded = ref(false)
const isPreloading = ref(false)

// Layer Refs
const layerRefs = ref([])

// Fading state
const isFading = ref(false)
let fadeTimer = null
const fadeDuration = 300 // ms for fade transition
const fadeSteps = 15 // Number of steps in the fade animation

// Function to store refs in an array, ensuring order
const setLayerRef = (el, index) => {
  if (el) {
    layerRefs.value[index] = el
  }
}

// Computed property for the current date display
const currentDate = computed(() => {
  if (props.images.length > 0 && currentIndex.value < props.images.length) {
    return props.images[currentIndex.value].date
  }
  return 'N/A'
})

const onCesiumReady = (cesiumInstance) => {
  Cesium = cesiumInstance
  console.log('Cesium is ready!')
}

// 优化 onViewerReady，确保在 viewer 准备好后主动尝试启动播放
const onViewerReady = ({ viewer }) => {
  myViewer = viewer
  console.log('Viewer is ready')
  // Set initial view
  if (myViewer) {
    myViewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0, 90, 10000000),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
        roll: 0.0
      }
    })
    
    // Viewer 初始化后，主动检查是否可以开始播放
    setTimeout(() => {
      if (isPlaying.value && imagesLoaded.value && layerRefs.value.length === props.images.length) {
        tryStartPlayback()
      }
    }, 500)
  }
}

// 修改 preloadImages 函数，添加延迟确保图层引用已准备好
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
    
    // 添加一个小延迟，确保 Cesium 图层已完全初始化
    setTimeout(() => {
      imagesLoaded.value = true
    }, 300)
  } catch (error) {
    console.error('Error during image preloading phase:', error)
    imagesLoaded.value = false
  } finally {
    isPreloading.value = false
  }
}

// --- Fade Animation Function ---
const crossFadeLayers = (oldIndex, newIndex) => {
  if (isFading.value) {
    clearInterval(fadeTimer)
    console.log('Cancelling previous fade to start new one.')
  }

  isFading.value = true

  const oldLayerInstance = layerRefs.value[oldIndex]
  const newLayerInstance = layerRefs.value[newIndex]
  const oldLayer = oldLayerInstance?.cesiumObject
  const newLayer = newLayerInstance?.cesiumObject

  if (!oldLayer || !newLayer) {
    console.error('Cannot perform fade: Layer instance not found.', {
      oldIndex,
      newIndex,
      oldLayer,
      newLayer
    })
    isFading.value = false
    if (newLayer) newLayer.show = true
    if (oldLayer) oldLayer.show = false
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

// Playback functions
const nextImage = () => {
  if (
    props.images.length === 0 ||
    !imagesLoaded.value ||
    layerRefs.value.length !== props.images.length ||
    isFading.value
  ) {
    return
  }

  const oldIndex = currentIndex.value
  const newIndex = (oldIndex + 1) % props.images.length

  currentIndex.value = newIndex

  crossFadeLayers(oldIndex, newIndex)
}

const stopPlayback = () => {
  if (playbackTimer) {
    clearInterval(playbackTimer)
    playbackTimer = null
    console.log('Playback stopped.')
  }
  if (isFading.value) {
    clearInterval(fadeTimer)
    isFading.value = false
    console.log('Fade animation cancelled due to playback stop.')
    layerRefs.value.forEach((instance, index) => {
      const layer = instance?.cesiumObject
      if (layer) {
        layer.show = index === currentIndex.value
        layer.alpha = index === currentIndex.value ? 1.0 : 0.0
      }
    })
  }
}

const startPlayback = () => {
  if (
    !myViewer ||
    !imagesLoaded.value ||
    !isPlaying.value ||
    layerRefs.value.length !== props.images.length
  ) {
    console.log('Conditions not met for starting playback.', {
      /* ... */
    })
    return
  }
  stopPlayback()

  if (props.images.length > 0) {
    const initialLayerInstance = layerRefs.value[currentIndex.value]
    const initialLayer = initialLayerInstance?.cesiumObject
    if (initialLayer) {
      console.log(
        `Ensuring initial layer ${currentIndex.value} is visible before starting playback.`
      )
      layerRefs.value.forEach((instance, index) => {
        const layer = instance?.cesiumObject
        if (layer) {
          layer.show = index === currentIndex.value
          layer.alpha = index === currentIndex.value ? 1.0 : 0.0
        }
      })
    } else {
      console.warn(`Initial layer instance ${currentIndex.value} not found.`)
      return
    }

    console.log('Starting playback timer with interval (seconds):', playbackInterval.value)
    const intervalMs = Math.max(50, playbackInterval.value * 1000)
    playbackTimer = setInterval(nextImage, intervalMs)
  }
}

// 优化 tryStartPlayback 确保能正确启动
const tryStartPlayback = () => {
  if (!isPlaying.value || props.images.length === 0) return
  
  // 检查是否所有图层引用都已准备好
  if (layerRefs.value.length !== props.images.length) {
    console.log('Layer refs not ready yet, waiting...')
    // 添加一个短暂延迟再次尝试
    setTimeout(tryStartPlayback, 100)
    return
  }
  
  // 检查是否所有图片已加载
  if (!imagesLoaded.value) {
    console.log('Images not loaded yet, waiting...')
    return
  }
  
  console.log('All conditions met, starting playback')
  startPlayback()
}

const togglePlayback = () => {
  if (isPreloading.value || !imagesLoaded.value) return
  isPlaying.value = !isPlaying.value
}

// Watchers
watch(isPlaying, (newValue) => {
  if (newValue) {
    tryStartPlayback()
  } else {
    stopPlayback()
  }
})

watch(playbackInterval, () => {
  if (isPlaying.value) {
    startPlayback()
  }
})

watch(
  [imagesLoaded, layerRefs],
  ([loaded, refs]) => {
    if (loaded && props.images.length > 0 && refs.length === props.images.length) {
      console.log('Images loaded and layer refs ready. Setting initial layer state.')
      refs.forEach((layerInstance, index) => {
        const layer = layerInstance?.cesiumObject
        if (layer) {
          layer.alpha = index === currentIndex.value ? 1.0 : 0.0
          layer.show = index === currentIndex.value
        }
      })
      tryStartPlayback()
    } else if (!loaded) {
      refs.forEach((layerInstance) => {
        const layer = layerInstance?.cesiumObject
        if (layer) {
          layer.show = false
          layer.alpha = 0.0
        }
      })
    }
  },
  { deep: true }
)

watch(
  () => props.images,
  (newImages) => {
    console.log('Images prop changed. Clearing refs and stopping playback.')
    stopPlayback()
    layerRefs.value = []
    currentIndex.value = 0
    imagesLoaded.value = false
    isPreloading.value = false
    isFading.value = false

    if (newImages && newImages.length > 0) {
      preloadImages(newImages)
    } else {
      imagesLoaded.value = true
      isPreloading.value = false
    }
  },
  { deep: true }
)

onMounted(() => {
  if (props.images && props.images.length > 0) {
    preloadImages(props.images)
  } else {
    imagesLoaded.value = true
    isPreloading.value = false
  }
})

onUnmounted(() => {
  stopPlayback()
  layerRefs.value = []
})
</script>

<style scoped>
.demo-viewer {
  height: 100%;
  width: 100%;
  position: relative;
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
  z-index: 10;
  min-width: 300px;
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
