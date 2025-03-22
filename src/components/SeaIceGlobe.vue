<template>
  <div ref="globeContainer" class="globe-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import Globe from 'globe.gl'
import * as THREE from 'three'

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
})

const globeContainer = ref(null)
const globeInstance = ref(null)
const textures = ref([])
const intervalId = ref(null)
let currentImageIndex = 0

onMounted(() => {
  // 创建Globe实例
  globeInstance.value = Globe()(globeContainer.value)
    .globeImageUrl('/seaice/picture/globe-texture/world.topo.bathy.200401-2.jpg')
    .bumpImageUrl('/seaice/picture/globe-texture/bathymetry_bw_composite_4k.jpg')
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .showGraticules(true)
    .polygonsData([])

  // 设置初始视角 - 北极视角
  globeInstance.value.pointOfView({
    lat: 90,
    lng: 0,
    altitude: 2.5
  })

  // 允许相机控制
  const controls = globeInstance.value.controls()
  controls.enableZoom = true
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.5

  watch(
    () => props.images,
    (newImages) => {
      if (newImages && newImages.length > 0) {
        preloadImages(newImages).then(() => {
          if (newImages.length > 1) {
            startImageRotation(newImages)
          } else {
            updateSeaIceLayer(newImages[0])
          }
        })
      }
    },
    { immediate: true }
  )
})

// 预加载所有图像
const preloadImages = async (images) => {
  // 清除旧的纹理
  textures.value.forEach((texture) => texture.dispose())
  textures.value = []

  const loader = new THREE.TextureLoader()

  // 预加载所有图像纹理
  const loadPromises = images.map(
    (image) =>
      new Promise((resolve) => {
        const texture = loader.load(image.path, () => {
          texture.userData = { path: image.path, date: image.date }
          textures.value.push(texture)
          resolve()
        })
      })
  )

  await Promise.all(loadPromises)
  return textures.value
}

// 启动图像轮播
const startImageRotation = (images) => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }

  // 每5秒切换一次图像
  intervalId.value = setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % images.length
    updateSeaIceLayer(images[currentImageIndex])
  }, 5000)

  // 立即显示第一张
  updateSeaIceLayer(images[0])
}

// 更新海冰图层
const updateSeaIceLayer = (image) => {
  if (!globeInstance.value) return

  // 找出对应的预加载纹理
  const texture = textures.value.find((t) => t.userData.path === image.path)
  if (!texture) return

  // 创建极地海冰的多边形数据
  // 这个例子中，我们创建一个覆盖北极的圆形区域
  const polygonData = [
    {
      coordinates: createPolarPolygon(90, 30), // 北纬90度，半径30度
      texture: texture,
      date: image.date
    }
  ]

  // 更新地球的多边形数据
  globeInstance.value
    .polygonsData(polygonData)
    .polygonSideColor(() => 'rgba(0,0,0,0)') // 边缘透明
    .polygonCapColor(() => 'rgba(200,200,200,0.7)') // 透明度设置
    .polygonCapMaterial((d) => {
      const material = new THREE.MeshBasicMaterial({
        map: d.texture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      })
      return material
    })
    .polygonLabel(
      (d) =>
        `<div style="color:white;background-color:black;padding:5px;border-radius:5px;">预测日期: ${d.date}</div>`
    )
}

// 创建极地多边形坐标
const createPolarPolygon = (centerLat, radius, segments = 36) => {
  const coordinates = []
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI
    const lat = centerLat - radius * Math.sin(angle)
    const lng = 180 * Math.cos(angle)
    coordinates.push([lng, lat])
  }
  return [coordinates] // 注意多边形格式为[[coordinates]]
}

onBeforeUnmount(() => {
  // 清理定时器
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }

  // 清理纹理
  if (textures.value.length) {
    textures.value.forEach((texture) => texture.dispose())
    textures.value = []
  }

  // 清理Globe实例
  if (globeInstance.value && globeContainer.value) {
    // 移除DOM元素中的内容
    while (globeContainer.value.firstChild) {
      globeContainer.value.removeChild(globeContainer.value.firstChild)
    }
    globeInstance.value = null
  }
})
</script>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
}
</style>
