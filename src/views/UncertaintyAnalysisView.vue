<template>
  <div class="container mx-auto flex max-h-screen">
    <div class="flex flex-col items-end w-full">
      <!-- 导航栏,使用flex布局将按钮放置在右上角 -->
      <div class="flex space-x-2">
        <button @click="selectedYear = '2019'" :class="getClass('2019')">2019</button>
        <button @click="selectedYear = '2020'" :class="getClass('2020')">2020</button>
      </div>
      <!-- 图片画廊根据选择的年份显示 -->
      <div class="flex items-center justify-center w-full">
        <div v-if="selectedYear === '2019'">
          <ImageGallery :images="images2019" />
        </div>
        <div v-else-if="selectedYear === '2020'">
          <ImageGallery :images="images2020" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import ImageGallery from '../components/ImageGallery.vue'

const selectedYear = ref('2019')

const generateImagePaths = (year, startDate, endDate) => {
  const images = []
  let currentDate = new Date(startDate)

  while (currentDate <= new Date(endDate)) {
    const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '')
    images.push({
      path: `picture/arctic-sea-ice/${year}0915-${year}0928/${dateStr}.png`,
      date: currentDate.toISOString().slice(0, 10)
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return images
}

const images2019 = generateImagePaths('2019', '2019-09-15', '2019-09-28')
const images2020 = generateImagePaths('2020', '2020-09-15', '2020-09-28')

const getClass = (year) => {
  return {
    'bg-blue-500 text-white': selectedYear.value === year,
    'bg-gray-200 text-gray-800': selectedYear.value !== year,
    'px-4 py-2 transition duration-150 ease-in-out': true
  }
}
</script>
