<template>
  <ImageUploadPredictor
    :image-limit="12"
    :time-mode="'monthly'"
    v-model:selected-date="selectedDate"
    :get-prediction-result="getMonthPredictionResult"
    :submit-prediction-request="useMonthPrediction"
    class="predictor-container"
  >
    <template #date-picker>
      <el-date-picker
        v-model="selectedDate"
        type="month"
        placeholder="请选择月份"
        format="YYYY/MM/DD"
        value-format="YYYY/MM/DD"
        class="date-picker"
      />
    </template>
  </ImageUploadPredictor>
</template>

<script setup>
import { ref } from 'vue'
import ImageUploadPredictor from '@/components/ImageUploadPredictor.vue'
import { useMonthPrediction, getMonthPredictionResult } from '@/common/api'

const selectedDate = ref('')
</script>

<style scoped>
.predictor-container {
  width: 100%;
  max-width: 800px;
  margin-top: 10%;
  margin-bottom: 10%;
  margin-left: auto;
  margin-right: auto;
}

.date-picker {
  width: 100%;
  max-width: 300px;
}
</style>
