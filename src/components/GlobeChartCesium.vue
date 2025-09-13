<template>
  <el-row ref="viewerContainer" class="demo-viewer">
    <div id="cesiumContainer"></div>
    <!-- 控制UI - 包含加载状态、日期显示和播放控制 -->
    <div class="controls" ref="controlsRef" @mousedown="startDrag" :style="controlsStyle">
      <div class="controls-header">
        <div class="drag-handle">☰</div>
      </div>
      <div class="loading-indicator">
        <span v-if="isPreloading || isFading" class="loading-text">
          {{ isPreloading ? $t('globe.loading') : isFading ? $t('globe.switching') : '' }}
        </span>
      </div>
      <div class="date-display">{{ currentDate }}</div>
      <div class="playback-controls">
        <button @click="togglePlayback" :disabled="isPreloading || !imagesLoaded">
          {{ isPlaying ? $t('globe.pause') : $t('globe.play') }}
        </button>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          v-model.number="playbackInterval"
          :disabled="isPreloading || !imagesLoaded"
        />
        <span
          >{{ $t('globe.interval') }}: {{ playbackInterval.toFixed(1) }}
          {{ $t('globe.seconds') }}</span
        >
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
  },
  backgroundImage: {
    type: String,
    default: '/picture/sea_ice_map.webp'
  }
})

// 状态管理
let viewer = null
// 使用 Cesium.Texture 管理图层
const activeTextures = ref({}) // 用于存储当前激活的 Cesium.Texture 实例 { index: Texture }
const activeCesiumLayers = ref({}) // 用于存储当前激活的 Cesium 图层实例 { index: CesiumLayer }
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
    imageryProvider: false,
    // requestRenderMode: true, // 开启按需渲染
    // maximumRenderTimeChange: Infinity, // 配合 requestRenderMode
    // targetFrameRate: 30 // 可以尝试设置目标帧率
    // resolutionScale: 0.5, // 降低渲染分辨率，会影响清晰度，谨慎使用
  }

  viewer = new Cesium.Viewer('cesiumContainer', options)
  // viewer.scene.fxaa = false // 禁用FXAA抗锯齿
  // viewer.scene.postProcessStages.fxaa.enabled = false // 确保后处理FXAA也禁用
  // viewer.scene.logarithmicDepthBuffer = false // 在某些情况下可以关闭以提高性能，但可能导致深度问题
  // viewer.scene.globe.depthTestAgainstTerrain = false // 如果不需要精确的地形遮挡测试，可以关闭

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
      url: props.backgroundImage
    })
  )

  // 创建时序图层
  createImageryLayers()
  requestRender() // 初始化后请求一次渲染
}

// 创建图层 - 此函数现在主要负责清理旧的 activeCesiumLayers
const createImageryLayers = () => {
  // 清除所有当前激活的 Cesium 图层
  Object.keys(activeCesiumLayers.value).forEach((key) => {
    removeLayerFromViewer(parseInt(key, 10))
  })
  activeCesiumLayers.value = {} // 重置

  // 预加载图像（如果 props.images 有数据）
  if (props.images && props.images.length > 0) {
    preloadImages(props.images)
  } else {
    imagesLoaded.value = true
    isPreloading.value = false
    requestRender()
  }
}

// 辅助函数：请求Cesium场景重新渲染
const requestRender = () => {
  if (viewer && viewer.scene.requestRenderMode) {
    viewer.scene.requestRender()
  }
}

// 辅助函数：确保纹理已加载
const ensureTextureIsLoaded = async (index) => {
  if (!viewer || !props.images[index]) return null
  
  if (!activeTextures.value[index]) {
    const imageData = props.images[index]
    try {
      const imageUrl = 'https://seaice.52lxy.one:20443' + imageData.path
      
      // 使用HTML Image对象加载图像
      const image = await new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous' // 允许跨域
        img.onload = () => resolve(img)
        img.onerror = (error) => reject(error)
        img.src = imageUrl
      })
      
      // 创建纹理
      const texture = new Cesium.Texture({
        context: viewer.scene.context,
        source: image
      })
      
      activeTextures.value[index] = texture
      return texture
    } catch (error) {
      console.error(`Error loading texture for index ${index}:`, error)
      return null
    }
  }
  return activeTextures.value[index]
}

// 辅助函数：确保图层已添加到viewer
const ensureLayerIsAdded = async (index) => {
  if (!viewer || !props.images[index]) return null
  
  if (!activeCesiumLayers.value[index]) {
    const imageData = props.images[index]
    try {
      // 确保纹理已加载
      const texture = await ensureTextureIsLoaded(index)
      if (!texture) return null

      // 创建使用纹理的ImageryProvider
      const provider = new Cesium.SingleTileImageryProvider({
        url: 'https://seaice.52lxy.one:20443' + imageData.path
      })
      
      const layer = viewer.imageryLayers.addImageryProvider(provider)
      layer.alpha = 0 // 初始透明，用于淡入
      layer.show = false // 初始隐藏，由淡入逻辑控制显示
      activeCesiumLayers.value[index] = layer
      return layer
    } catch (error) {
      console.error(`Error creating imagery provider for index ${index}:`, error)
      return null
    }
  }
  return activeCesiumLayers.value[index]
}

// 辅助函数：从viewer移除图层和纹理
const removeLayerFromViewer = (index) => {
  if (activeCesiumLayers.value[index]) {
    viewer.imageryLayers.remove(activeCesiumLayers.value[index], true) // true to destroy
    delete activeCesiumLayers.value[index]
  }
  
  // 清理纹理资源
  if (activeTextures.value[index]) {
    if (activeTextures.value[index].destroy && typeof activeTextures.value[index].destroy === 'function') {
      activeTextures.value[index].destroy()
    }
    delete activeTextures.value[index]
  }
}

// 预加载图像 - 使用 Cesium.Texture
const preloadImages = async (imageList) => {
  if (!imageList || imageList.length === 0) {
    imagesLoaded.value = true
    isPreloading.value = false
    return
  }

  isPreloading.value = true
  imagesLoaded.value = false
  console.log('Starting texture preloading...')

  const promises = imageList.map(async (imgData, index) => {
    if (!imgData || !imgData.path) {
      console.warn('Image data or path missing:', imgData)
      return null
    }
    
    try {
      const imageUrl = 'https://seaice.52lxy.one:20443' + imgData.path
      console.log(`Loading texture ${index}: ${imageUrl}`)
      
      // 使用HTML Image对象加载图像
      const image = await new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous' // 允许跨域
        img.onload = () => resolve(img)
        img.onerror = (error) => reject(error)
        img.src = imageUrl
      })
      
      // 创建纹理
      const texture = new Cesium.Texture({
        context: viewer.scene.context,
        source: image
      })
      
      activeTextures.value[index] = texture
      return texture
    } catch (error) {
      console.error(`Failed to load texture ${index}:`, error)
      return null
    }
  })

  try {
    const textures = await Promise.all(promises)
    const loadedCount = textures.filter(t => t !== null).length
    console.log(`Textures preloaded: ${loadedCount}/${imageList.length}`)
    imagesLoaded.value = loadedCount > 0

    // 预加载完成后，仅加载并显示当前索引的图层
    if (props.images.length > 0 && imagesLoaded.value) {
      const currentLayer = await ensureLayerIsAdded(currentIndex.value)
      if (currentLayer) {
        currentLayer.show = true
        currentLayer.alpha = 1.0
        requestRender() // 初始图层显示后请求渲染
      }
      if (isPlaying.value) {
        startPlayback()
      }
    }
  } catch (error) {
    console.error('Error during texture preloading:', error)
    imagesLoaded.value = false
  } finally {
    isPreloading.value = false
  }
}

// 图层淡入淡出过渡动画 - 使用纹理优化
const crossFadeLayers = async (oldIndex, newIndex) => {
  // 如果正在进行动画，先完成当前动画
  if (isFading.value && fadeTimer) {
    clearInterval(fadeTimer)
    fadeTimer = null

    // 立即完成当前动画状态
    Object.keys(activeCesiumLayers.value).forEach((key) => {
      const index = parseInt(key, 10)
      const layer = activeCesiumLayers.value[index]
      if (layer && index !== currentIndex.value) {
        layer.alpha = 0.0
        layer.show = false
        removeLayerFromViewer(index)
      }
    })

    // 确保当前图层完全可见
    const currentLayer = activeCesiumLayers.value[currentIndex.value]
    if (currentLayer) {
      currentLayer.alpha = 1.0
      currentLayer.show = true
    }
  }

  isFading.value = true

  const oldLayer = activeCesiumLayers.value[oldIndex]
  
  // 确保新纹理已加载
  const newTexture = await ensureTextureIsLoaded(newIndex)
  if (!newTexture) {
    console.error(`Cannot perform fade: Texture at index ${newIndex} could not be loaded.`)
    if (oldLayer) {
      oldLayer.show = true
      oldLayer.alpha = 1.0
    }
    isFading.value = false
    return
  }

  // 确保新图层已创建并添加到viewer
  const newLayer = await ensureLayerIsAdded(newIndex)
  if (!newLayer) {
    console.error(`Cannot perform fade: New layer at index ${newIndex} could not be created or found.`)
    if (oldLayer) {
      oldLayer.show = true
      oldLayer.alpha = 1.0
    }
    isFading.value = false
    return
  }

  // 如果旧图层和新图层是同一个（例如，只有一个图像时），则直接设置为完全可见
  if (oldLayer === newLayer) {
    newLayer.show = true
    newLayer.alpha = 1.0
    isFading.value = false
    requestRender()
    return
  }

  newLayer.alpha = 0 // 确保新图层开始时透明
  newLayer.show = true // 使新图层可见以进行淡入
  requestRender() // 新图层准备好后，请求渲染开始淡入过程

  let currentStep = 0
  const alphaIncrement = 1.0 / fadeSteps
  const stepDuration = fadeDuration / fadeSteps

  fadeTimer = setInterval(() => {
    currentStep++
    const newAlpha = Math.min(1.0, currentStep * alphaIncrement)
    const oldAlpha = oldLayer ? Math.max(0.0, 1.0 - newAlpha) : 0 // oldLayer可能不存在

    newLayer.alpha = newAlpha
    if (oldLayer) {
      oldLayer.alpha = oldAlpha
    }
    requestRender() // 动画的每一步都请求渲染

    if (currentStep >= fadeSteps) {
      clearInterval(fadeTimer)
      fadeTimer = null
      newLayer.alpha = 1.0
      if (oldLayer) {
        oldLayer.alpha = 0.0
        oldLayer.show = false
        // 从 viewer 中移除旧图层
        removeLayerFromViewer(oldIndex) // 移除图层后也会触发Cesium内部更新，但显式请求确保
      }
      isFading.value = false
      requestRender() // 淡入淡出结束后请求渲染
    }
  }, stepDuration)
}

// 切换到下一张图像
const nextImage = async () => {
  if (props.images.length === 0 || !imagesLoaded.value) {
    return
  }

  const oldIndex = currentIndex.value
  const newIndex = (oldIndex + 1) % props.images.length
  currentIndex.value = newIndex

  if (useSmooth) {
    await crossFadeLayers(oldIndex, newIndex)
  } else {
    // 移除旧图层（如果存在且不同于新图层）
    if (oldIndex !== newIndex && activeCesiumLayers.value[oldIndex]) {
      removeLayerFromViewer(oldIndex)
    }
    // 确保新纹理已加载
    await ensureTextureIsLoaded(newIndex)
    // 添加并显示新图层
    const newLayer = await ensureLayerIsAdded(newIndex)
    if (newLayer) {
      newLayer.show = true
      newLayer.alpha = 1.0
      requestRender() // 非平滑切换后请求渲染
    }
  }
}

// 停止播放
const stopPlayback = () => {
  if (playbackTimer) {
    clearInterval(playbackTimer)
    playbackTimer = null
  }
  clearInterval(fadeTimer) // 停止任何正在进行的淡入淡出
  fadeTimer = null
  isFading.value = false

  // 确保只有当前索引的图层是可见的，并移除其他图层
  Object.keys(activeCesiumLayers.value).forEach((keyStr) => {
    const index = parseInt(keyStr, 10)
    const layer = activeCesiumLayers.value[index]
    if (layer) {
      if (index === currentIndex.value) {
        layer.show = true
        layer.alpha = 1.0
      } else {
        // 从 viewer 中移除不活动的图层
        removeLayerFromViewer(index)
      }
    }
  })
  requestRender() // 停止播放并整理图层后请求渲染
}

// 开始播放
const startPlayback = async () => {
  if (!imagesLoaded.value || !isPlaying.value || props.images.length === 0) {
    return
  }

  stopPlayback() // 清理之前的状态，确保只有一个图层（当前图层）开始

  // 确保当前纹理和图层已加载并可见
  await ensureTextureIsLoaded(currentIndex.value)
  const currentLayer = await ensureLayerIsAdded(currentIndex.value)
  if (currentLayer) {
    currentLayer.show = true
    currentLayer.alpha = 1.0
    requestRender() // 确保当前图层显示后请求渲染
  } else if (props.images.length > 0) {
    // 如果当前图层因某种原因无法加载，则尝试停止播放以避免错误
    console.error(`Cannot start playback: Layer ${currentIndex.value} failed to load.`)
    isPlaying.value = false // 停止播放
    return
  }

  // Calculate interval and determine transition behavior
  const intervalMs = playbackInterval.value * 1000
  // 调整平滑过渡的阈值，当间隔太短时禁用平滑过渡以避免动画冲突
  useSmooth = intervalMs >= fadeDuration + 200 // 确保有足够时间完成动画

  if (props.images.length > 1) {
    // 仅当有多张图片时才设置定时器
    if (useSmooth) {
      // 使用实际的用户设置间隔，不再强制最小值
      playbackTimer = setInterval(nextImage, intervalMs)
    } else {
      playbackTimer = setInterval(nextImage, intervalMs)
    }
  } else if (currentLayer) {
    // 只有一张图片，确保它显示
    currentLayer.show = true
    currentLayer.alpha = 1.0
    requestRender() // 只有一张图片时，确保其显示并请求渲染
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
  (newImages) => {
    stopPlayback() // 停止当前播放并清理图层
    currentIndex.value = 0
    imagesLoaded.value = false
    isPreloading.value = true // 准备预加载新图像
    isFading.value = false

    // 清理所有旧的纹理和图层
    Object.keys(activeCesiumLayers.value).forEach((key) => {
      removeLayerFromViewer(parseInt(key, 10))
    })
    activeCesiumLayers.value = {}
    activeTextures.value = {}

    if (viewer && newImages && newImages.length > 0) {
      // createImageryLayers 将会调用 preloadImages
      createImageryLayers()
    } else if (viewer) {
      // 如果没有新图像，确保清理
      Object.keys(activeCesiumLayers.value).forEach((key) =>
        removeLayerFromViewer(parseInt(key, 10))
      )
      activeCesiumLayers.value = {}
      activeTextures.value = {}
      imagesLoaded.value = true // 没有图像可加载
      isPreloading.value = false
    }
  },
  { deep: true }
)

// 组件挂载时初始化
onMounted(async () => {
  // Cesium 现在通过 CDN 加载，直接可用
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
    console.error('Cesium not available - please check CDN loading')
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  stopPlayback()
  
  // 清理所有纹理资源
  Object.keys(activeTextures.value).forEach((key) => {
    const texture = activeTextures.value[key]
    if (texture && texture.destroy && typeof texture.destroy === 'function') {
      texture.destroy()
    }
    delete activeTextures.value[key]
  })
  activeTextures.value = {}
  
  // 清理 activeCesiumLayers 中的所有 Cesium 实例
  Object.keys(activeCesiumLayers.value).forEach((key) => {
    // viewer 可能已经销毁，所以这里不需要 viewer.imageryLayers.remove
    // Cesium 的 destroy 会处理它包含的图层
    // 但我们仍需清空 activeCesiumLayers 引用
    delete activeCesiumLayers.value[key]
  })
  activeCesiumLayers.value = {}
  
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
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
  height: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.loading-text {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
  position: absolute;
  white-space: nowrap;
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
