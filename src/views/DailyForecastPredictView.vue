<template>
  <ImageUploadPredictor
    :imageLimit="14"
    :time-mode="'daily'"
    v-model:selected-date="selectedDate"
    :get-prediction-result="getDayPredictionResult"
    :submit-prediction-request="useDayPrediction"
    class="predictor-container"
  >
    <template #date-picker>
      <el-date-picker
        v-model="selectedDate"
        type="date"
        :placeholder="$t('date.selectDate')"
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
import { useDayPrediction, getDayPredictionResult } from '@/common/api'

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
