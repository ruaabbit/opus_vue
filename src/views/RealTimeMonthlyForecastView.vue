<template>
  <div class="main-container">
    <div class="content-wrapper">
      <div class="viewer-container">
        <div v-if="isLoading">
          <!-- 显示加载动画 -->
          <LoadingAnimation />
        </div>
        <div v-else>
          <ArcticSeaIceViewer :images="images" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRealtimeMonthPrediction } from '@/common/api'
import ArcticSeaIceViewer from '../components/ArcticSeaIceViewer.vue'
import LoadingAnimation from '../components/LoadingAnimation.vue'

const images = ref([])
const isLoading = ref(true)

onMounted(() => {
  useRealtimeMonthPrediction().then((data) => {
    images.value = data
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
}
</style>
