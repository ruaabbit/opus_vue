<template>
  <div class="main-container">
    <div class="content-wrapper">
      <div class="viewer-container">
        <div v-if="isLoading">
          <!-- 显示加载动画 -->
          <LoadingAnimation />
        </div>
        <div v-else>
          <GlobeChartEchartsGL
            class="globe-chart"
            :baseTexture="baseTexture"
            :auto-rotate="true"
            :target-coord="[0, 90]"
            :alpha="60"
            :distance="200"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRealtimeMonthPrediction } from '@/common/api'
import LoadingAnimation from '../components/LoadingAnimation.vue'
import GlobeChartEchartsGL from '../components/GlobeChartEchartsGL.vue'

const images = ref([])
const isLoading = ref(true)

// 设置地球基础纹理，也可以根据返回的数据动态设置
const baseTexture = ref('')

onMounted(() => {
  useRealtimeMonthPrediction().then((data) => {
    images.value = data.images

    // 如果API返回的数据中包含海冰覆盖图像URL，可以设置为地球纹理
    if (data.images && data.images.length > 0 && data.images[0].path) {
      // 设置第一个图像为地球纹理，如果需要的话
      baseTexture.value = 'https://seaice.52lxy.one:20443' + data.images[0].path
    }

    isLoading.value = false
  })
})
</script>

<style scoped>
.main-container {
  margin: 0 auto;
  display: flex;
  max-height: 100vh;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
}

.viewer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80vh; /* 调整高度以适应地球 */
}

.globe-chart {
  width: 80vw;
  height: 80vh;
}
</style>
