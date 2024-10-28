<template>
  <div class="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
    <el-form :model="formData" label-width="120px" @submit.prevent="submitForm">
      <!-- 预报提前期 -->
      <el-form-item label="预报提前期">
        <el-input-number
          v-model="formData.forecastLeadTime"
          :min="1"
          placeholder="请输入提前期（天）"
        />
      </el-form-item>

      <!-- 目标月份 -->
      <el-form-item label="目标月份">
        <el-date-picker
          v-model="formData.targetMonth"
          type="month"
          placeholder="选择月份"
          format="YYYY-MM"
          value-format="YYYY-MM"
        />
      </el-form-item>

      <!-- 数据范围 -->
      <el-form-item label="数据范围">
        <el-date-picker
          v-model="formData.dataRange"
          type="monthrange"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          format="YYYY-MM"
          value-format="YYYY-MM"
        />
      </el-form-item>

      <!-- 分析范围（经纬度） -->
      <el-form-item label="分析范围">
        <el-input
          v-model="formData.latLonRange"
          placeholder="请输入经纬度范围 (如 50N-70N, 140W-60W)"
        />
      </el-form-item>

      <!-- 选择分析目标 -->
      <el-form-item label="分析目标">
        <el-radio-group v-model="formData.analysisTarget">
          <el-radio label="sea_ice_area">海冰面积</el-radio>
          <el-radio label="sea_ice_change">海冰变化</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交分析</el-button>
      </el-form-item>
    </el-form>

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
