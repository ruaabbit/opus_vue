<template>
  <ImageUploadPredictor
    :image-limit="14"
    v-model:selected-date="selectedDate"
    :get-prediction-result="getDayPredictionResult"
    :submit-prediction-request="useDayPrediction"
    class="full-width predictor-container"
  >
    <template #date-picker>
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        format="YYYY/MM/DD"
        value-format="YYYY/MM/DD"
        class="full-width date-picker"
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

<style scoped>
.full-width {
  width: 100%;
}

.predictor-container {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.date-picker {
  max-width: 300px;
}
</style>
