<template>
  <div class="dynamics-viewer">
    <!-- 标题区域 -->
    <h2 class="section-title">逐日模型可解释性分析结果热图</h2>

    <!-- 单张图片显示 -->
    <div v-if="props.images && props.images.length > 0" class="single-image-container">
      <div class="image-container">
        <img
          :src="getImageUrl(props.images[0])"
          alt="可解释性分析结果"
          class="analysis-image"
          @click="viewImage(getImageUrl(props.images[0]))"
        />
      </div>
    </div>

    <!-- 空状态显示 -->
    <div v-else class="empty-state">
      <el-empty description="暂无分析结果" />
    </div>

    <!-- 放大查看模态框 -->
    <div
      v-if="selectedImage"
      class="modal-overlay"
      @wheel="handleWheel"
      @click.self="selectedImage = null"
    >
      <div class="modal-content" :style="{ transform: `scale(${scale})` }">
        <img :src="getImageUrl(selectedImage)" alt="放大查看" class="modal-image" />
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
import { ElEmpty } from 'element-plus'

import { getImageUrl } from '@/common/util'

const props = defineProps({ images: { type: Array, required: true } })

const selectedImage = ref(null)
const scale = ref(1)

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
</script>

<style scoped>
.dynamics-viewer {
  width: 100%;
  max-width: 1200px; /* 增加最大宽度 */
  margin: 0 auto;
}

.section-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #303133;
}

/* 单张图片容器 */
.single-image-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
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

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 9999;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 90%;
  max-height: 90%;
  transform: scale(1);
  transition: transform 0.3s ease;
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

/* 响应式布局调整 */
@media (max-width: 768px) {
  .section-title {
    font-size: 1.25rem;
  }
}
</style>
