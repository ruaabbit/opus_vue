<template>
  <div class="container-flex">
    <h2 v-if="currentImage" class="title">{{ currentImage.date }}</h2>

    <div v-if="currentImage" class="image-container">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
      <img
        :src="getImageUrl(currentImage.path)"
        :alt="$t('arcticSeaIceViewer.altText')"
        class="image"
        @click="viewImage(currentImage)"
        @mouseover="showTooltip = true"
        @mouseleave="showTooltip = false"
      />
      <div v-if="showTooltip" class="tooltip">{{ $t('arcticSeaIceViewer.tooltipText') }}</div>
    </div>

    <div class="button-grid">
      <button
        @click="prevImage"
        class="button"
        :class="{ 'button-disabled': currentImageIndex === 0 }"
        :disabled="currentImageIndex === 0"
      >
        {{ $t('arcticSeaIceViewer.prevImage') }}
      </button>
      <button @click="togglePause" class="button">
        {{ isPaused ? $t('arcticSeaIceViewer.resume') : $t('arcticSeaIceViewer.pause') }}
      </button>
      <button
        @click="nextImage"
        class="button"
        :class="{ 'button-disabled': !images?.length || currentImageIndex === images.length - 1 }"
        :disabled="!images?.length || currentImageIndex === images.length - 1"
      >
        {{ $t('arcticSeaIceViewer.nextImage') }}
      </button>
    </div>

    <div class="slider-container">
      <input
        id="intervalRange"
        type="range"
        min="1"
        max="3"
        step="0.1"
        v-model="interval"
        class="slider"
      />
      <label for="intervalRange" class="slider-label">{{
        $t('arcticSeaIceViewer.playbackSpeed', { interval: interval })
      }}</label>
    </div>

    <div
      v-if="selectedImage"
      class="modal-overlay"
      @wheel="handleWheel"
      @click.self="selectedImage = null"
    >
      <div class="modal-content" :style="{ transform: `scale(${scale})` }">
        <img :src="getImageUrl(selectedImage.path)" alt="Large view" class="modal-image" />
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
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { getImageUrl } from '@/common/util'

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
})

const selectedImage = ref(null)
const currentImageIndex = ref(0)
const currentImage = ref(null)
const scale = ref(1)
const interval = ref(2)
const isPaused = ref(false)
const showTooltip = ref(false)
const isLoading = ref(false)

// 预加载图片函数
const preloadImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = getImageUrl(imagePath)
  })
}

const viewImage = (image) => {
  if (image) {
    selectedImage.value = image
    scale.value = 1
  }
}

const handleWheel = (event) => {
  const delta = Math.sign(event.deltaY)
  const newScale = Math.max(1, Math.min(3, scale.value - delta * 0.2))
  scale.value = newScale
  event.preventDefault()
}

const nextImage = async () => {
  if (props.images && props.images.length > 0) {
    isLoading.value = true
    const nextIndex = (currentImageIndex.value + 1) % props.images.length

    try {
      // 预加载下一张图片
      await preloadImage(props.images[nextIndex].path)
      currentImageIndex.value = nextIndex
      currentImage.value = props.images[currentImageIndex.value]
    } catch (error) {
      console.error('Failed to load next image:', error)
    } finally {
      isLoading.value = false
    }
  }
}

const prevImage = async () => {
  if (props.images && props.images.length > 0) {
    isLoading.value = true
    const prevIndex = (currentImageIndex.value - 1 + props.images.length) % props.images.length

    try {
      // 预加载上一张图片
      await preloadImage(props.images[prevIndex].path)
      currentImageIndex.value = prevIndex
      currentImage.value = props.images[currentImageIndex.value]
    } catch (error) {
      console.error('Failed to load previous image:', error)
    } finally {
      isLoading.value = false
    }
  }
}

let intervalId

const startInterval = () => {
  clearInterval(intervalId)
  if (!isPaused.value) {
    intervalId = setInterval(async () => {
      // 如果正在加载，跳过这次切换
      if (!isLoading.value) {
        await nextImage()
      }
    }, interval.value * 1000)
  }
}

const togglePause = () => {
  isPaused.value = !isPaused.value
  startInterval()
}

onMounted(() => {
  startInterval()
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})

watch(
  () => props.images,
  (newImages) => {
    if (newImages?.length > 0) {
      currentImageIndex.value = 0
      currentImage.value = newImages[0]
    } else {
      currentImage.value = null
    }
  },
  { immediate: true } // 确保在组件挂载时立即触发
)

watch(interval, () => {
  startInterval()
})
</script>

<style>
.container-flex {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 3rem;
}

.image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
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

.image {
  cursor: pointer;
  width: 100%;
  max-width: 36rem;
  height: auto;
}

.tooltip {
  position: absolute;
  bottom: 0;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  color: white;
  background-color: black;
  border-radius: 0.25rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.25rem;
}

.button-disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.slider-container {
  width: 100%;
  padding: 0 1rem;
  margin-top: 1rem;
}

.slider {
  width: 100%;
  margin-top: 0.5rem;
}

.slider-label {
  display: block;
  text-align: center;
  margin-top: 0.5rem;
}

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
  max-width: 100%;
  max-height: 100%;
  transform: scale(1);
  transition: transform 0.3s ease;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
}

.image-date {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  color: white;
  background-color: #111827;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
}

.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: white;
  background-color: #111827;
  padding: 0.5rem;
  border-radius: 9999px;
}

.close-button:hover {
  background-color: #374151;
}

.close-button:focus {
  outline: none;
  background-color: #374151;
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
