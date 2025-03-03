<template>
  <div ref="globeContainer" class="globe-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Globe from 'globe.gl'

const props = defineProps({
  // Texture paths
  baseTexture: {
    type: String,
    default: 'picture/globe-texture/world.topo.bathy.200401.jpg'
  },
  heightTexture: {
    type: String,
    default: 'picture/globe-texture/bathymetry_bw_composite_4k.jpg'
  },
  // Globe view control parameters
  autoRotate: {
    type: Boolean,
    default: false
  },
  targetCoord: {
    type: Array,
    default: () => [0, 90]
  },
  cameraDistance: {
    type: Number,
    default: 2.5
  },
  // Series data for arcs, points, etc.
  series: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['globe-ready'])

const globeContainer = ref(null)
const globeInstance = ref(null)

onMounted(() => {
  if (globeContainer.value) {
    globeInstance.value = Globe()(globeContainer.value)
      .globeImageUrl(props.baseTexture)
      .bumpImageUrl(props.heightTexture)
      .backgroundColor('rgba(0,0,0,0)')

    // Setup initial view
    setupGlobeView()

    // Add series data
    addSeriesData()

    // Emit ready event
    emit('globe-ready', globeInstance.value)
  }
})

// Watch for changes in series and recreate data
watch(
  () => props.series,
  () => {
    if (globeInstance.value) {
      addSeriesData()
    }
  }
)

// Watch for autoRotate changes
watch(
  () => props.autoRotate,
  (newValue) => {
    if (globeInstance.value) {
      globeInstance.value.controls().autoRotate = newValue
    }
  }
)

function setupGlobeView() {
  if (!globeInstance.value) return

  const controls = globeInstance.value.controls()

  // Apply initial view settings
  controls.enableZoom = true
  controls.autoRotate = props.autoRotate
  controls.autoRotateSpeed = 0.5

  // Set initial camera position based on target coordinates
  const [lon, lat] = props.targetCoord
  globeInstance.value.pointOfView({
    lat,
    lng: lon,
    altitude: props.cameraDistance
  })
}

function addSeriesData() {
  if (!globeInstance.value) return

  // Clear existing data
  globeInstance.value.arcsData([]).pointsData([]).polygonsData([])

  // Add different types of series data
  props.series.forEach((seriesItem) => {
    switch (seriesItem.type) {
      case 'arc':
        globeInstance.value.arcsData(seriesItem.data || [])
        break
      case 'points':
        globeInstance.value.pointsData(seriesItem.data || [])
        break
      case 'polygons':
        globeInstance.value.polygonsData(seriesItem.data || [])
        break
    }
  })
}

onUnmounted(() => {
  // 清理 globe 实例
  if (globeInstance.value) {
    // Globe.gl 没有 destroy 方法，应该使用正确的方式清理
    if (globeContainer.value) {
      // 清空容器中的内容
      while (globeContainer.value.firstChild) {
        globeContainer.value.removeChild(globeContainer.value.firstChild)
      }
    }
    // 移除引用
    globeInstance.value = null
  }
})

// Expose methods to parent component if needed
defineExpose({
  globeInstance
})
</script>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
