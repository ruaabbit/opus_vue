<template>
  <div class="flex flex-col items-center">
    <h2 v-if="currentImage" class="mt-2 text-center text-5xl">{{ currentImage.date }}</h2>

    <div v-if="currentImage" class="relative flex justify-center items-center">
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      <img
        :src="currentImage.path"
        alt="Arctic Sea Ice Prediction"
        class="cursor-pointer w-full max-w-xl h-auto"
        @click="viewImage(currentImage)"
        @mouseover="showTooltip = true"
        @mouseleave="showTooltip = false"
      />
      <div v-if="showTooltip" class="absolute bottom-0 mb-2 px-2 py-1 text-white bg-black rounded">
        点击图片可以放大查看
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mt-4">
      <button
        @click="prevImage"
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        :disabled="currentImageIndex === 0"
      >
        上一张
      </button>
      <button @click="togglePause" class="px-4 py-2 bg-blue-500 text-white rounded">
        {{ isPaused ? '点击继续' : '点击暂停' }}
      </button>
      <button
        @click="nextImage"
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        :disabled="!images?.length || currentImageIndex === images.length - 1"
      >
        下一张
      </button>
    </div>

    <div class="w-full px-4 mt-4">
      <input
        id="intervalRange"
        type="range"
        min="1"
        max="3"
        step="0.1"
        v-model="interval"
        class="w-full mt-2"
      />
      <label for="intervalRange" class="block text-center mt-2"
        >图片播放速度: {{ interval }}s</label
      >
    </div>

    <div
      v-if="selectedImage"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
      @wheel="handleWheel"
      @click.self="selectedImage = null"
    >
      <div
        class="relative flex flex-col items-center justify-center max-w-full max-h-full transform transition-transform duration-300"
        :style="{ transform: `scale(${scale})` }"
      >
        <img :src="selectedImage.path" alt="Large view" class="max-w-full max-h-full" />
        <p class="absolute top-2 left-2 text-white bg-gray-900 px-2 rounded">
          {{ selectedImage.date }}
        </p>
      </div>
      <button
        @click="selectedImage = null"
        class="absolute top-2 right-2 text-white bg-gray-900 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
      >
        <svg
          class="w-6 h-6"
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
    img.src = imagePath
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
