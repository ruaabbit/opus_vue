<template>
  <div class="w-[640px] h-[640px]">
    <v-chart :option="option" />
  </div>
</template>

<script setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GlobeComponent } from 'echarts-gl/components' // Import Globe from echarts-gl
import { Lines3DChart } from 'echarts-gl/charts' // For adding lines and other 3D features
import VChart, { THEME_KEY } from 'vue-echarts'
import { ref, provide } from 'vue'

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

use([CanvasRenderer, GlobeComponent, Lines3DChart]) // Use the Globe and 3D lines
provide(THEME_KEY, 'dark')

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
