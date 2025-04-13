<template>
  <el-row ref="viewerContainer" class="demo-viewer">
    <!-- Cesium地图查看器组件，监听初始化事件 -->
    <vc-viewer
      @cesiumReady="onCesiumReady"
      @ready="onViewerReady"
      :baseLayer="false"
      :showCredit="false"
    >
      <!-- 底图层 - 基础海冰背景图 -->
      <vc-layer-imagery :sortOrder="0">
        <vc-imagery-provider-singletile :url="'/seaice/picture/sea_ice_map.png'" />
      </vc-layer-imagery>

      <!-- 动态海冰图层 - 使用v-for渲染所有时序图层 -->
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
    <!-- 控制UI - 包含加载状态、日期显示和播放控制 -->
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

// 组件属性定义
const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
})

// 图层显示状态参数
const brightness = ref(1) // 图层亮度设置
const contrast = ref(1) // 图层对比度设置
let myViewer = null // Cesium查看器实例
let Cesium = null // Cesium API实例

// 播放状态管理
const currentIndex = ref(0) // 当前显示的图像索引
const isPlaying = ref(true) // 是否正在播放
const playbackInterval = ref(2) // 播放间隔，单位为秒
let playbackTimer = null // 播放定时器

// 图像预加载状态
const imagesLoaded = ref(false) // 图像是否已加载完成
const isPreloading = ref(false) // 是否正在预加载中

// 图层引用数组，用于保存所有图层实例引用
const layerRefs = ref([])

// 淡入淡出过渡动画状态
const isFading = ref(false) // 是否正在执行淡入淡出动画
let fadeTimer = null // 淡入淡出动画定时器
const fadeDuration = 300 // 动画持续时间(毫秒)
const fadeSteps = 15 // 动画步数

// Cesium初始化状态
const cesiumReady = ref(false) // Cesium是否已经初始化完成

// 存储图层引用的函数，确保按顺序存储
const setLayerRef = (el, index) => {
  if (el) {
    layerRefs.value[index] = el
  }
}

// 计算属性：获取当前日期显示文本
const currentDate = computed(() => {
  if (props.images.length > 0 && currentIndex.value < props.images.length) {
    return props.images[currentIndex.value].date
  }
  return 'N/A'
})

// Cesium库初始化完成回调函数
const onCesiumReady = (cesiumInstance) => {
  Cesium = cesiumInstance
  cesiumReady.value = true
  console.log('Cesium is ready!')
}

// Cesium查看器初始化完成回调函数
const onViewerReady = ({ viewer }) => {
  myViewer = viewer
  console.log('Viewer is ready')
  // 确保Cesium已初始化后，设置北极视角
  if (myViewer && cesiumReady.value) {
    myViewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0, 90, 10000000), // 北极点位置
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0), // 俯视视角
        roll: 0.0
      }
    })

    // 短暂延迟后尝试启动播放
    setTimeout(() => {
      if (isPlaying.value && imagesLoaded.value && layerRefs.value.length === props.images.length) {
        tryStartPlayback()
      }
    }, 500)
  }
}

// 预加载图像函数，确保所有图像加载完成
const preloadImages = async (imageList) => {
  if (!imageList || imageList.length === 0) {
    imagesLoaded.value = true
    isPreloading.value = false
    return
  }
  isPreloading.value = true
  imagesLoaded.value = false
  console.log('Starting image preloading...')
  // 创建所有图像加载的Promise数组
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
    // 等待所有图像加载完成
    await Promise.all(promises)
    console.log('All images preloaded (or attempted).')

    // 添加延迟确保Cesium图层已完全初始化
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

// 图层淡入淡出过渡动画函数
const crossFadeLayers = (oldIndex, newIndex) => {
  // 如果已有淡入淡出动画在进行，先取消
  if (isFading.value) {
    clearInterval(fadeTimer)
    console.log('Cancelling previous fade to start new one.')
  }

  isFading.value = true

  // 获取新旧图层实例
  const oldLayerInstance = layerRefs.value[oldIndex]
  const newLayerInstance = layerRefs.value[newIndex]
  const oldLayer = oldLayerInstance?.cesiumObject
  const newLayer = newLayerInstance?.cesiumObject

  // 检查图层实例是否存在
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

  // 准备新图层显示
  newLayer.alpha = 0
  newLayer.show = true

  // 执行淡入淡出动画
  let currentStep = 0
  const alphaIncrement = 1.0 / fadeSteps
  const stepDuration = fadeDuration / fadeSteps

  fadeTimer = setInterval(() => {
    currentStep++
    const newAlpha = Math.min(1.0, currentStep * alphaIncrement)
    const oldAlpha = Math.max(0.0, 1.0 - newAlpha)

    // 更新透明度值
    newLayer.alpha = newAlpha
    if (oldLayer !== newLayer) {
      oldLayer.alpha = oldAlpha
    }

    // 检查动画是否完成
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

// 切换到下一张图像的函数
const nextImage = () => {
  // 检查条件是否允许切换图像
  if (
    props.images.length === 0 ||
    !imagesLoaded.value ||
    layerRefs.value.length !== props.images.length ||
    isFading.value
  ) {
    return
  }

  // 计算新旧索引
  const oldIndex = currentIndex.value
  const newIndex = (oldIndex + 1) % props.images.length

  currentIndex.value = newIndex

  // 执行淡入淡出切换
  crossFadeLayers(oldIndex, newIndex)
}

// 停止播放的函数
const stopPlayback = () => {
  // 清除播放定时器
  if (playbackTimer) {
    clearInterval(playbackTimer)
    playbackTimer = null
    console.log('Playback stopped.')
  }
  // 如果有淡入淡出动画，也停止
  if (isFading.value) {
    clearInterval(fadeTimer)
    isFading.value = false
    console.log('Fade animation cancelled due to playback stop.')
    // 重置所有图层状态
    layerRefs.value.forEach((instance, index) => {
      const layer = instance?.cesiumObject
      if (layer) {
        layer.show = index === currentIndex.value
        layer.alpha = index === currentIndex.value ? 1.0 : 0.0
      }
    })
  }
}

// 开始播放的函数
const startPlayback = () => {
  // 检查所有条件是否满足播放要求
  if (
    !cesiumReady.value ||
    !myViewer ||
    !imagesLoaded.value ||
    !isPlaying.value ||
    layerRefs.value.length !== props.images.length
  ) {
    console.log('Conditions not met for starting playback.')
    return
  }
  // 先停止旧的播放
  stopPlayback()

  if (props.images.length > 0) {
    // 确保初始图层可见
    const initialLayerInstance = layerRefs.value[currentIndex.value]
    const initialLayer = initialLayerInstance?.cesiumObject
    if (initialLayer) {
      console.log(
        `Ensuring initial layer ${currentIndex.value} is visible before starting playback.`
      )
      // 设置所有图层状态
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

    // 开始定时器，执行图像切换
    console.log('Starting playback timer with interval (seconds):', playbackInterval.value)
    const intervalMs = Math.max(50, playbackInterval.value * 1000)
    playbackTimer = setInterval(nextImage, intervalMs)
  }
}

// 尝试启动播放的函数，包含条件检查和重试逻辑
const tryStartPlayback = () => {
  if (!cesiumReady.value || !isPlaying.value || props.images.length === 0) return

  // 检查图层引用是否准备完成
  if (layerRefs.value.length !== props.images.length) {
    console.log('Layer refs not ready yet, waiting...')
    // 短暂延迟后重试
    setTimeout(tryStartPlayback, 100)
    return
  }

  // 检查图像是否加载完成
  if (!imagesLoaded.value) {
    console.log('Images not loaded yet, waiting...')
    return
  }

  console.log('All conditions met, starting playback')
  startPlayback()
}

// 切换播放/暂停状态的函数
const togglePlayback = () => {
  if (isPreloading.value || !imagesLoaded.value) return
  isPlaying.value = !isPlaying.value
}

// 监听播放状态变化
watch(isPlaying, (newValue) => {
  if (newValue) {
    tryStartPlayback()
  } else {
    stopPlayback()
  }
})

// 监听播放间隔变化
watch(playbackInterval, () => {
  if (isPlaying.value) {
    startPlayback() // 重新启动播放器以应用新间隔
  }
})

// 监听图像加载状态和图层引用变化
watch(
  [imagesLoaded, layerRefs],
  ([loaded, refs]) => {
    if (loaded && props.images.length > 0 && refs.length === props.images.length) {
      console.log('Images loaded and layer refs ready. Setting initial layer state.')
      // 设置初始图层状态
      refs.forEach((layerInstance, index) => {
        const layer = layerInstance?.cesiumObject
        if (layer) {
          layer.alpha = index === currentIndex.value ? 1.0 : 0.0
          layer.show = index === currentIndex.value
        }
      })
      tryStartPlayback()
    } else if (!loaded) {
      // 如果图像未加载完成，隐藏所有图层
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

// 监听输入图像数组变化
watch(
  () => props.images,
  (newImages) => {
    console.log('Images prop changed. Clearing refs and stopping playback.')
    // 重置组件状态
    if (cesiumReady.value) {
      stopPlayback()
    }
    layerRefs.value = []
    currentIndex.value = 0
    imagesLoaded.value = false
    isPreloading.value = false
    isFading.value = false

    // 处理新图像数组
    if (newImages && newImages.length > 0) {
      preloadImages(newImages)
    } else {
      imagesLoaded.value = true
      isPreloading.value = false
    }
  },
  { deep: true }
)

// 组件挂载时执行
onMounted(() => {
  // 初始加载图像
  if (props.images && props.images.length > 0) {
    preloadImages(props.images)
  } else {
    imagesLoaded.value = true
    isPreloading.value = false
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  stopPlayback()
  layerRefs.value = []
  cesiumReady.value = false
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
