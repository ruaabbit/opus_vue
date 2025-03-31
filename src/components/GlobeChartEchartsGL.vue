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
  </div>
</template>

<script setup>
import { ref, provide, onMounted, nextTick, watch, computed } from 'vue'
import VChart, { THEME_KEY } from 'vue-echarts'

const isEChartsReady = ref(false)
const chartContainer = ref(null)

// 定义props
const props = defineProps({
  baseTexture: {
    type: String,
    default: 'picture/sea_ice_map.png'
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

// 当前显示的纹理
const currentTexture = computed(() => {
  if (props.images && props.images.length > 0) {
    return 'https://seaice.52lxy.one:20443' + props.images[props.currentIndex].path
  } else {
    return null
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
      autoRotate: props.autoRotate,
      targetCoord: props.targetCoord,
      alpha: props.alpha,
      beta: props.beta,
      distance: props.distance,
      minAlpha: props.minAlpha,
      maxAlpha: props.maxAlpha,
      minDistance: props.minDistance,
      maxDistance: props.maxDistance
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
    option.value.globe.layers[0].texture = newTexture
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
        resolve(null) // 即使加载失败也继续，不阻止整体流程
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
