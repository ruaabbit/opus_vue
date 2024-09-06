<template>
  <div class="container mx-auto flex max-h-screen">
    <div class="flex flex-col items-end w-full">
      <div class="flex items-center justify-center w-full">
        <ImageGallery :images="imagesNext7Days" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDayPrediction } from '@/common/date'
import ImageGallery from '../components/ImageGallery.vue'

const today = new Date().toLocaleDateString().slice(0, 10) // 获取今天的日期
const imagesNext7Days = useDayPrediction(today, 7) // 获取未来7天的预测结果
</script>
