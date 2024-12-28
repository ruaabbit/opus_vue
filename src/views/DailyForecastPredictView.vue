<template>
  <ImageUploadPredictor
    :image-limit="14"
    v-model:selected-date="selectedDate"
    :get-prediction-result="getDayPredictionResult"
    :submit-prediction-request="useDayPrediction"
    class="w-full max-w-[800px] mx-auto"
  >
    <template #date-picker>
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        format="YYYY/MM/DD"
        value-format="YYYY/MM/DD"
        class="w-full max-w-[300px]"
      />
    </template>
  </ImageUploadPredictor>
</template>

<script setup>
import { ref } from 'vue'
import ImageUploadPredictor from '@/components/ImageUploadPredictor.vue'
import { useDayPrediction, getDayPredictionResult } from '@/common/api'

const selectedDate = ref(null)
</script>
