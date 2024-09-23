<template>
  <div class="flex flex-wrap justify-center bg-black h-[85vh]">
    <GlobeChart
      :baseTexture="'picture/globe-texture/world.topo.bathy.200401.jpg'"
      :heightTexture="'picture/globe-texture/bathymetry_bw_composite_4k.jpg'"
      :environment="'picture/globe-texture/starfield.jpg'"
      :lightIntensity="5"
      :autoRotate="true"
      :targetCoord="[30, 60]"
      :alpha="45"
      :beta="10"
      :distance="200"
      :series="linesData"
    />
  </div>
</template>

<script setup>
import GlobeChart from '../components/GlobeChart.vue'

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
