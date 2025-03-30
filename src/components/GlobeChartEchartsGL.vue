<template>
  <div class="globe-chart-container" ref="chartContainer">
    <v-chart
      v-if="isEChartsReady"
      :option="option"
      autoresize
      :style="{ width: props.width, height: props.height }"
    ></v-chart>
    <div v-else class="loading-indicator">加载中，请稍后...</div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'
import VChart, { THEME_KEY } from 'vue-echarts'

const isEChartsReady = ref(false)
const chartContainer = ref(null)
const currentImageIndex = ref(0)
const preloadedTextures = ref(new Map())
// const isTextureLoading = ref(false)

// 新增props接收images数组
const props = defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  },
  baseTexture: {
    type: String,
    default: 'picture/globe-texture/world.topo.bathy.200401.jpg'
  },
  images: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  autoRotate: {
    type: Boolean,
    default: false
  },
  targetCoord: {
    type: Array,
    default: () => [0, 90]
  },
  alpha: {
    type: Number,
    default: 60
  },
  beta: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 150
  },
  minAlpha: {
    type: Number,
    default: 90
  },
  maxAlpha: {
    type: Number,
    default: 90
  },
  minDistance: {
    type: Number,
    default: 80
  },
  maxDistance: {
    type: Number,
    default: 300
  },
  lightIntensity: {
    type: Number,
    default: 3
  }
})

// 发射事件
// const emit = defineEmits(['update:currentIndex'])

// 当前显示的纹理
const currentTexture = computed(() => {
  if (props.images && props.images.length > 0) {
    const url = 'https://seaice.52lxy.one:20443' + props.images[props.currentIndex].path
    return preloadedTextures.value.get(url) || url
  } else {
    return props.baseTexture
  }
})

// 预加载图片的工具函数
const preloadTexture = (url) => {
  if (preloadedTextures.value.has(url)) {
    return Promise.resolve(url)
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      preloadedTextures.value.set(url, url)
      resolve(url)
    }
    img.onerror = () => reject(url)
    img.src = url
  })
}

// 预加载所有纹理
const preloadAllTextures = async () => {
  if (!props.images || props.images.length === 0) return
  
  const preloadPromises = props.images.map(img => 
    preloadTexture('https://seaice.52lxy.one:20443' + img.path)
  )
  
  try {
    await Promise.all(preloadPromises)
  } catch (error) {
    console.warn('Failed to preload some textures:', error)
  }
}

const option = ref({
  globe: {
    baseTexture: currentTexture,
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
      autoRotate: props.autoRotate,
      targetCoord: props.targetCoord,
      alpha: props.alpha,
      beta: props.beta,
      distance: props.distance,
      minAlpha: props.minAlpha,
      maxAlpha: props.maxAlpha,
      minDistance: props.minDistance,
      maxDistance: props.maxDistance
    }
  }
})

// 监听currentTexture的变化并平滑更新echarts配置
watch(currentTexture, (newTexture) => {
  if (window.echarts && chartContainer.value) {
    option.value.globe.baseTexture = newTexture
    const chart = window.echarts.getInstanceByDom(chartContainer.value)
    if (chart) {
      // 平滑更新配置，保留当前视图状态
      chart.setOption({
        globe: {
          baseTexture: newTexture
        }
      }, false, true)
    }
  }
})

// Dynamic imports for ECharts components
const initECharts = async () => {
  try {
    // 确保容器已经渲染完成
    await nextTick()

    // 检查容器尺寸
    if (!chartContainer.value?.offsetWidth || !chartContainer.value?.offsetHeight) {
      console.warn('Chart container has no dimensions, retrying...')
      // 如果容器没有尺寸，等待100ms后重试
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const { use } = await import('echarts/core')
    const { CanvasRenderer } = await import('echarts/renderers')
    const { GlobeComponent } = await import('echarts-gl/components')
    const { Lines3DChart } = await import('echarts-gl/charts')

    use([CanvasRenderer, GlobeComponent, Lines3DChart])

    // 再次确认容器尺寸
    if (chartContainer.value?.offsetWidth && chartContainer.value?.offsetHeight) {
      isEChartsReady.value = true
      
      // 初始化完成后预加载所有图片
      await preloadAllTextures()
    } else {
      throw new Error('Container dimensions not available')
    }
  } catch (error) {
    console.error('Failed to initialize ECharts:', error)
  }
}

// 监听currentIndex变化
watch(() => props.currentIndex, (newIndex) => {
  if (props.images && props.images.length > 0) {
    currentImageIndex.value = newIndex
  }
})

// 处理窗口调整
let resizeHandler = null
const handleResize = () => {
  if (window.echarts && chartContainer.value) {
    const chart = window.echarts.getInstanceByDom(chartContainer.value)
    chart?.resize()
  }
}

provide(THEME_KEY, 'dark')

onMounted(async () => {
  await initECharts()
  resizeHandler = handleResize
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
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

:deep(.echarts) {
  width: 100% !important;
  height: 100% !important;
}
</style>
