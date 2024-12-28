<template>
  <ImageUploadPredictor
    :image-limit="12"
    v-model:selected-date="selectedDate"
    :get-prediction-result="getMonthPredictionResult"
    :submit-prediction-request="useMonthPrediction"
    class="w-full max-w-[800px] mx-auto"
  >
    <template #date-picker>
      <el-date-picker
        v-model="selectedDate"
        type="month"
        placeholder="请选择月份"
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
import { useMonthPrediction, getMonthPredictionResult } from '@/common/api'

const selectedDate = ref(null)
</script>
