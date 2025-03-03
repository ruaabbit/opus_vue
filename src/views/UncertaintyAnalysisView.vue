<template>
  <div class="globe-container">
    <GlobeChartGlobeGL
      :auto-rotate="true"
      :target-coord="[0, 90]"
      :camera-distance="2.0"
      :series="linesData"
    />
  </div>
</template>

<script setup>
import GlobeChartGlobeGL from '../components/GlobeChartGlobeGL.vue'

const linesData = [
  {
    type: 'lines3D',
    blendMode: 'lighter',
    coordinateSystem: 'globe',
    effect: {
      show: true,
      trailWidth: 4,
      trailOpacity: 0.5,
      trailLength: 0.2,
      constantSpeed: 5
    },
    lineStyle: {
      width: 2.0,
      color: 'green',
      opacity: 0.8
    },
    data: [
      {
        coords: [
          [116.46, 39.92], // Beijing coordinates
          [-74.0, 40.71] // New York coordinates
        ]
      }
    ]
  }
]
</script>

<style>
.globe-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background-color: black;
  height: 85vh;
}
</style>
