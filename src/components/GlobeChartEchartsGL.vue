<template>
  <div class="globe-chart-container" ref="chartContainer">
    <v-chart
      v-if="isEChartsReady"
      :option="option"
      autoresize
      :style="{ width: props.width, height: props.height }"
    />
    <div v-else class="loading-indicator">加载中，请稍后…</div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onBeforeUnmount, nextTick } from 'vue'
import VChart, { THEME_KEY } from 'vue-echarts'

const isEChartsReady = ref(false)
const chartContainer = ref(null)

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
    } else {
      throw new Error('Container dimensions not available')
    }
  } catch (error) {
    console.error('Failed to initialize ECharts:', error)
  }
}

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

  lightIntensity: {
    type: Number,
    default: 3
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
  }
})

const option = ref({
  globe: {
    baseTexture: props.baseTexture,
    shading: 'color', // Realistic shading for the 3D effect
    realisticMaterial: {
      roughness: 0.9
    },
    light: {
      main: {
        intensity: props.lightIntensity, // Light intensity for realism
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
