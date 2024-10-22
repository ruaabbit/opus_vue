<template>
  <div class="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
    <a-form
      :model="formData"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      @submit.prevent="submitForm"
    >
      <!-- 预报提前期 -->
      <a-form-item label="预报提前期">
        <a-input-number
          v-model:value="formData.forecastLeadTime"
          :min="1"
          placeholder="请输入提前期（天）"
        />
      </a-form-item>
      <!-- 目标月份 -->
      <a-form-item label="目标月份">
        <a-date-picker
          v-model:value="formData.targetMonth"
          picker="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
        />
      </a-form-item>
      <!-- 数据范围 -->
      <a-form-item label="数据范围">
        <a-range-picker v-model:value="formData.dataRange" picker="month" value-format="YYYY-MM" />
      </a-form-item>
      <!-- 分析范围（经纬度） -->
      <a-form-item label="分析范围">
        <a-input
          v-model:value="formData.latLonRange"
          placeholder="请输入经纬度范围 (如 50N-70N, 140W-60W)"
        />
      </a-form-item>
      <!-- 选择分析目标 -->
      <a-form-item label="分析目标">
        <a-radio-group v-model:value="formData.analysisTarget">
          <a-radio value="sea_ice_area">海冰面积</a-radio>
          <a-radio value="sea_ice_change">海冰变化</a-radio>
        </a-radio-group>
      </a-form-item>
      <!-- 提交按钮 -->
      <a-form-item :wrapper-col="{ span: 14, offset: 6 }">
        <a-button type="primary" html-type="submit">提交分析</a-button>
      </a-form-item>
    </a-form>
    <!-- 热图展示 -->
    <div v-if="heatmapUrl" class="mt-6">
      <h3 class="text-lg font-semibold mb-2">分析结果热图</h3>
      <img :src="heatmapUrl" alt="分析结果热图" class="w-full" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  forecastLeadTime: null,
  targetMonth: null,
  dataRange: [],
  latLonRange: '',
  analysisTarget: 'sea_ice_area' // 默认选择海冰面积
})

const heatmapUrl = ref('')

const submitForm = () => {
  console.log('提交数据:', formData.value)
  // 模拟调用API返回热图URL
  heatmapUrl.value = 'picture/globe-texture/starfield.jpg' // 替换为实际API返回的热图路径
}
</script>
