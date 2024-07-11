<template>
  <div class="flex flex-col items-center">
    <div class="flex justify-center items-center">
      <img
        :src="currentImage.path"
        alt="Arctic Sea Ice Prediction"
        class="cursor-pointer"
        @click="viewImage(currentImage)"
      />
    </div>
    <p class="mt-2 text-center">{{ currentImage.date }}</p>

    <div class="flex justify-center mt-4">
      <button
        @click="prevImage"
        class="px-4 py-2 mr-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        :disabled="currentImageIndex === 0"
      >
        Previous
      </button>
      <button
        @click="nextImage"
        class="px-4 py-2 ml-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        :disabled="currentImageIndex === props.images.length - 1"
      >
        Next
      </button>
    </div>

    <div
      v-if="selectedImage"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 image-zoom"
      @wheel="handleWheel"
    >
      <div
        class="relative flex flex-col items-center justify-center max-w-full max-h-full transform-transition"
        :style="transformStyle"
      >
        <img
          :src="selectedImage.path"
          alt="Large view"
          class="max-w-full max-h-full transition-transform duration-300"
        />
        <p class="absolute top-2 left-2 text-white bg-gray-900 px-2 rounded">
          {{ selectedImage.date }}
        </p>
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  images: Array
})

const selectedImage = ref(null)
const currentImageIndex = ref(0)
const currentImage = ref(props.images[currentImageIndex.value])
const scale = ref(1) // 新增状态变量来存储缩放级别
const transformStyle = ref('') // 用于动态绑定样式

const viewImage = (image) => {
  selectedImage.value = image
  scale.value = 1 // 重置缩放级别
}

const handleWheel = (event) => {
  const delta = Math.max(-1, Math.min(1, event.deltaY))
  scale.value -= delta * 0.1 // 根据滚轮滚动调整缩放级别

  // 更新 transform 样式
  transformStyle.value = `transform: scale(${scale.value})`
  event.preventDefault() // 阻止默认滚动行为
}

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length
  currentImage.value = props.images[currentImageIndex.value]
}

const prevImage = () => {
  currentImageIndex.value =
    (currentImageIndex.value - 1 + props.images.length) % props.images.length
  currentImage.value = props.images[currentImageIndex.value]
}

let intervalId

onMounted(() => {
  intervalId = setInterval(() => {
    nextImage()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})

watch(
  () => props.images,
  (newImages) => {
    currentImageIndex.value = 0
    currentImage.value = newImages[currentImageIndex.value]
  }
)
</script>

<style scoped>
.absolute {
  position: absolute;
}
.left-2 {
  left: 0.5rem;
}
.top-2 {
  top: 0.5rem;
}
.bg-gray-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(31, 41, 55, var(--tw-bg-opacity));
}
.hover\:bg-gray-700:hover {
  --tw-bg-opacity: 1;
  background-color: rgba(55, 65, 81, var(--tw-bg-opacity));
}
.focus\:bg-gray-700:focus {
  --tw-bg-opacity: 1;
  background-color: rgba(55, 65, 81, var(--tw-bg-opacity));
}

.image-zoom {
  overflow: hidden; /* 防止内容溢出 */
  touch-action: none; /* 防止触摸操作被浏览器默认行为干扰 */
}

.transform-transition {
  transform-origin: center center;
  transition: transform 0.1s ease;
}
</style>
