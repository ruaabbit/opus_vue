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

use([CanvasRenderer, GlobeComponent, Lines3DChart]) // Use the Globe and 3D lines

provide(THEME_KEY, 'dark')

const option = ref({
  globe: {
    baseTexture: 'picture/globe-texture/world.topo.bathy.200401.jpg', // Earth texture
    heightTexture: 'picture/globe-texture/bathymetry_bw_composite_4k.jpg', // Heightmap texture for terrain
    shading: 'color', // Realistic shading for the 3D effect
    environment: 'picture/globe-texture/starfield.jpg', // Space background
    realisticMaterial: {
      roughness: 0.9
    },
    light: {
      main: {
        intensity: 3, // Light intensity for realism
        shadow: true
      }
    },
    viewControl: {
      autoRotate: false, // Disable auto-rotation
      targetCoord: [0, 90], // Lock view on the North Pole (latitude 90)
      alpha: 60, // Control the tilt angle to look down at the pole
      beta: 0, // Rotation around the y-axis
      distance: 150, // Distance of the camera from the globe
      minAlpha: 90, // Limit the minimum tilt angle to prevent looking from too low
      maxAlpha: 90, // Limit the maximum tilt to ensure always looking from above
      // minBeta: -180, // Allow full rotation around the North Pole
      // maxBeta: 180, // Allow full rotation around the North Pole
      minDistance: 80, // Limit zoom to avoid getting too close
      maxDistance: 300 // Limit zoom to avoid zooming out too far
    }
  },
  series: [
    // {
    //   type: 'lines3D', // Example of adding 3D lines on the globe
    //   blendMode: 'lighter',
    //   coordinateSystem: 'globe',
    //   effect: {
    //     show: true,
    //     trailWidth: 4,
    //     trailOpacity: 0.5,
    //     trailLength: 0.2,
    //     constantSpeed: 5
    //   },
    //   lineStyle: {
    //     width: 2.0,
    //     color: 'green',
    //     opacity: 0.8
    //   },
    //   data: [
    //     {
    //       coords: [
    //         [116.46, 39.92], // Beijing coordinates
    //         [-74.0, 40.71] // New York coordinates
    //       ]
    //     }
    //   ]
    // }
  ]
})
</script>
