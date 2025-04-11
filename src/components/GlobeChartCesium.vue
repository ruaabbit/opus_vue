<template>
  <el-row ref="viewerContainer" class="demo-viewer">
    <div ref="sliderRef" class="slider"></div>
    <vc-viewer @ready="onViewerReady">
      <vc-layer-imagery
        @ready="onImageryLayerReady"
        ref="layer"
        :alpha="alpha"
        :brightness="brightness"
        :contrast="contrast"
      >
        <vc-imagery-provider-singletile
          :url="'/seaice/picture/sea_ice_map.png'"
        ></vc-imagery-provider-singletile>
      </vc-layer-imagery>
    </vc-viewer>
    <div class="demo-toolbar">
      <el-row>
        <el-button type="danger" round @click="unload">销毁</el-button>
        <el-button type="danger" round @click="load">加载</el-button>
        <el-button type="danger" round @click="reload">重载</el-button>
      </el-row>
      <el-row>
        <el-col>
          <div class="block">
            <span class="demonstration">透明度</span>
            <el-slider v-model="alpha" :min="0" :max="1" :step="0.01"></el-slider>
            <span class="demonstration">亮度</span>
            <el-slider v-model="brightness" :min="0" :max="3" :step="0.01"></el-slider>
            <span class="demonstration">对比度</span>
            <el-slider v-model="contrast" :min="0" :max="3" :step="0.01"></el-slider>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-row>
</template>

<script setup>
import { ref } from 'vue'

// state
const layer = ref(null)
const alpha = ref(1)
const brightness = ref(1)
const contrast = ref(1)
const sliderRef = ref(null)
let moveActive = false
let myViewer = null
let handler = null
let Cesium = null // 添加全局 Cesium 变量

// methods
const onViewerReady = ({ Cesium: cesiumInstance, viewer }) => {
  Cesium = cesiumInstance // 保存 Cesium 引用以供其他函数使用
  myViewer = viewer
  const slider = sliderRef.value
  handler = new Cesium.ScreenSpaceEventHandler(slider)
  handler.setInputAction(function () {
    moveActive = true
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
  handler.setInputAction(function () {
    moveActive = true
  }, Cesium.ScreenSpaceEventType.PINCH_START)
  handler.setInputAction(onMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  handler.setInputAction(onMove, Cesium.ScreenSpaceEventType.PINCH_MOVE)
  handler.setInputAction(function () {
    moveActive = false
  }, Cesium.ScreenSpaceEventType.LEFT_UP)
  handler.setInputAction(function () {
    moveActive = false
  }, Cesium.ScreenSpaceEventType.PINCH_END)
}

const onImageryLayerReady = (readyObj) => {
  const { cesiumObject: imageryLayer, viewer } = readyObj
  imageryLayer.splitDirection = Cesium.SplitDirection.LEFT
  const slider = sliderRef.value
  viewer.scene.splitPosition = slider.offsetLeft / slider.parentElement.offsetWidth
}

const onMove = (movement) => {
  if (!moveActive) {
    return
  }
  const slider = sliderRef.value
  const relativeOffset = movement.endPosition.x
  const splitPosition = (slider.offsetLeft + relativeOffset) / slider.parentElement.offsetWidth
  slider.style.left = 100.0 * splitPosition + '%'
  myViewer.scene.splitPosition = splitPosition
}

const unload = () => {
  layer.value.unload()
}

const reload = () => {
  layer.value.reload()
}

const load = () => {
  layer.value.load()
}
</script>

<style>
.slider {
  position: absolute;
  left: 50%;
  top: 0px;
  background-color: #d3d3d3;
  width: 5px;
  height: 100%;
  z-index: 9999;
}

.slider:hover {
  cursor: ew-resize;
}
</style>
