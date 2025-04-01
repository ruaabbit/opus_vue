<template>
  <div class="dynamics-viewer">
    <!-- 标题区域 -->
    <h2 class="section-title">动力学分析结果热图</h2>

    <!-- 图片网格容器 -->
    <div class="image-grid" :style="{ '--images-per-row': imagesPerRow }">
      <div v-for="(image, index) in images" :key="index" class="image-card">
        <div class="image-container">
          <div v-if="loadingImages[index]" class="loading-overlay">
            <div class="loading-spinner"></div>
          </div>
          <img
            :src="getImageUrl(image.path)"
            :alt="`${image.date} - 动力学分析结果`"
            class="analysis-image"
            @click="viewImage(image)"
            @load="handleImageLoaded(index)"
          />
        </div>
        <div class="image-date-label">{{ image.date }}</div>
      </div>
    </div>

    <!-- 空状态显示 -->
    <div v-if="!images || images.length === 0" class="empty-state">
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
        <img :src="getImageUrl(selectedImage.path)" alt="放大查看" class="modal-image" />
        <p class="image-date">
          {{ selectedImage.date }}
        </p>
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
import { ref, onMounted, watch, computed } from 'vue'
import { ElEmpty } from 'element-plus'

import { getImageUrl } from '@/common/util'

const props = defineProps({ images: { type: Array, required: true } })

const selectedImage = ref(null)
const scale = ref(1)
const loadingImages = ref([])

// 计算每行应显示的图片数量
const imagesPerRow = computed(() => {
  if (!props.images || props.images.length === 0) return 1
  return Math.ceil(props.images.length / 2) // 向上取整，确保两行能显示所有图片
})

// 预加载单张图片
const preloadImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = imagePath
  })
}

// 预加载所有图片 - 将函数定义移到这里，在watch使用之前
const preloadAllImages = () => {
  if (!props.images || props.images.length === 0) return

  props.images.forEach((image, index) => {
    preloadImage(getImageUrl(image.path))
      .then(() => {
        loadingImages.value[index] = false
      })
      .catch((error) => {
        console.error(`Failed to load image: ${image.path}`, error)
        loadingImages.value[index] = false
      })
  })
}

// 初始化加载状态
watch(
  () => props.images,
  (newImages) => {
    if (newImages && newImages.length > 0) {
      loadingImages.value = new Array(newImages.length).fill(true)
      preloadAllImages()
    }
  },
  { immediate: true }
)

// 处理图片加载完成
const handleImageLoaded = (index) => {
  loadingImages.value[index] = false
}

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
  const newScale = Math.max(1, Math.min(3, scale.value - delta * 0.2))
  scale.value = newScale
  event.preventDefault()
}

onMounted(() => {
  preloadAllImages()
})
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

.image-grid {
  display: grid;
  grid-template-columns: repeat(var(--images-per-row), 1fr); /* 使用计算出的每行图片数量 */
  grid-template-rows: repeat(2, auto); /* 明确指定两行 */
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.image-card {
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  height: 100%; /* 确保所有卡片高度一致 */
}

.image-container {
  position: relative;
  aspect-ratio: 1.5 / 1; /* 修改为横向长方形比例，使图片更小 */
  overflow: hidden;
}

.analysis-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.image-date-label {
  width: 100%;
  background-color: #f0f2f5;
  color: #303133;
  padding: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
  border-top: 1px solid #e4e7ed;
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

.image-date {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  color: white;
  background-color: #111827;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 500;
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
  .image-grid {
    grid-template-columns: repeat(2, 1fr); /* 在小屏幕上强制两列 */
    grid-template-rows: auto; /* 在小屏幕上允许行数自适应 */
    gap: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
  }
}
</style>
