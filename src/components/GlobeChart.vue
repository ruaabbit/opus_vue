<template>
  <div class="globe-container">
    <v-chart v-if="isEChartsReady" :option="option" />
    <div v-else class="loading-container">
      <LoadingAnimation />
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import VChart, { THEME_KEY } from 'vue-echarts'
import LoadingAnimation from './LoadingAnimation.vue'

const isEChartsReady = ref(false)

// Dynamic imports for ECharts components
const initECharts = async () => {
  const { use } = await import('echarts/core')
  const { CanvasRenderer } = await import('echarts/renderers')
  const { GlobeComponent } = await import('echarts-gl/components')
  const { Lines3DChart } = await import('echarts-gl/charts')

  use([CanvasRenderer, GlobeComponent, Lines3DChart])
  isEChartsReady.value = true
}

provide(THEME_KEY, 'dark')

// Initialize ECharts components in onMounted
onMounted(async () => {
  await initECharts()
})

const props = defineProps({
  baseTexture: {
    type: String,
    default: 'picture/globe-texture/world.topo.bathy.200401.jpg'
  },
  heightTexture: {
    type: String,
    default: 'picture/globe-texture/bathymetry_bw_composite_4k.jpg'
  },
  environment: {
    type: String,
    default: 'picture/globe-texture/starfield.jpg'
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
  },
  series: {
    type: Array,
    default: () => []
  }
})

const option = ref({
  globe: {
    baseTexture: props.baseTexture,
    heightTexture: props.heightTexture,
    shading: 'color', // Realistic shading for the 3D effect
    environment: props.environment,
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
  },
  series: props.series
})
</script>

<style scoped>
.globe-container {
  width: 640px;
  height: 640px;
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
