<template>
  <div class="dynamics-viewer">
    <div class="viewer-header">
      <h2 class="section-title">{{ $t('modelInterpreterViewer.title') }}</h2>
      <div class="viewer-controls" v-if="props.images && props.images.length > 0"></div>
    </div>

    <!-- 多张图片网格显示 -->
    <div v-if="props.images && props.images.length > 0" class="images-grid">
      <div
        v-for="(image, index) in props.images"
        :key="index"
        class="image-container"
        v-loading="isLoading"
      >
        <img
          :src="getImageUrl(image)"
          :alt="$t('modelInterpreterViewer.imageAlt', { index: index + 1 })"
          class="analysis-image"
          :style="{ transform: 'scale(1)' }"
          @click="viewImage(getImageUrl(image))"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>
    </div>

    <!-- 空状态显示 -->
    <div v-else class="empty-state">
      <el-empty :description="$t('modelInterpreterViewer.noResults')" />
    </div>

    <!-- 放大查看模态框 -->
    <div
      v-if="selectedImage"
      class="modal-overlay"
      @wheel="handleWheel"
      @click.self="selectedImage = null"
    >
      <div class="modal-content" :style="{ transform: `scale(${scale})` }">
        <img
          :src="getImageUrl(selectedImage)"
          :alt="$t('modelInterpreterViewer.modalImageAlt')"
          class="modal-image"
        />
      </div>
      <button @click="selectedImage = null" class="close-button">
        <svg
          class="close-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElEmpty, ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

import { getImageUrl } from '@/common/util'

const { t } = useI18n()

const props = defineProps({ images: { type: Array, required: true } })

const selectedImage = ref(null)
const scale = ref(1)
const isLoading = ref(true)

// 查看放大图片
const viewImage = (image) => {
  if (image) {
    selectedImage.value = image
    scale.value = 1
  }
}

// 处理滚轮缩放
const handleWheel = (event) => {
  const delta = Math.sign(event.deltaY)
  const newScale = Math.max(0.5, Math.min(5, scale.value - delta * 0.2))
  scale.value = newScale
  event.preventDefault()
}

// 处理图片加载完成
const handleImageLoad = () => {
  isLoading.value = false
}

// 处理图片加载失败
const handleImageError = () => {
  isLoading.value = false
  ElMessage.error(t('modelInterpreterViewer.imageLoadError'))
}
</script>

<style scoped>
.dynamics-viewer {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f7fa;
  padding: 2rem;
  border-radius: 8px;
}

.viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.viewer-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #303133;
}

.images-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  width: 100%;
  align-items: center;
}

.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.image-container:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.analysis-image {
  width: 100%;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.3s ease;
  max-height: 600px;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  border-radius: 9999px;
  height: 2rem;
  width: 2rem;
  border-top: 2px solid #3b82f6;
  border-bottom: 2px solid #3b82f6;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 3rem 0;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 95%;
  max-height: 95%;
  transform: scale(1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: white;
  background-color: #111827;
  padding: 0.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
}

.close-button:hover {
  background-color: #374151;
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.25rem;
  }
}
</style>
