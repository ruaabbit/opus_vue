<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-center">Arctic Sea Ice Prediction Results</h1>
    <nav class="mb-4 text-center">
      <button @click="selectedYear = '2019'" :class="buttonClass('2019')">2019</button>
      <button @click="selectedYear = '2020'" :class="buttonClass('2020')">2020</button>
    </nav>
    <div v-if="selectedYear === '2019'">
      <ImageGallery :images="images2019" />
    </div>
    <div v-else>
      <ImageGallery :images="images2020" />
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
      path: `/picture/arctic-sea-ice/${year}0915-${year}0928/${dateStr}.png`,
      date: currentDate.toISOString().slice(0, 10)
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return images
}

const images2019 = generateImagePaths('2019', '2019-09-15', '2019-09-28')
const images2020 = generateImagePaths('2020', '2020-09-15', '2020-09-28')

const buttonClass = (year) => {
  return selectedYear.value === year
    ? 'bg-blue-500 dark:bg-blue-200 text-white px-4 py-2 mr-2'
    : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-4 py-2 mr-2'
}
</script>
