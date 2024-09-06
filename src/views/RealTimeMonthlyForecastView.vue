<template>
  <div class="container mx-auto flex max-h-screen">
    <div class="flex flex-col items-end w-full">
      <div class="flex items-center justify-center w-full">
        <ImageGallery :images="imagesNext6Months" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMonthPrediction } from '@/common/date'
import ImageGallery from '../components/ImageGallery.vue'

const today = new Date()
const startMonth = today.getMonth()
const startYear = today.getFullYear()

const imagesNext6Months = useMonthPrediction(startYear, startMonth)
</script>
