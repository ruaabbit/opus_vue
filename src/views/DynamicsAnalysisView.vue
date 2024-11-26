<template>
  <div class="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
    <el-form :model="formData" label-width="120px" @submit.prevent="submitForm">
      <!-- 预报提前期 -->
      <el-form-item label="预报提前期">
        <el-input-number
          v-model="formData.grad_forecast_month"
          :min="1"
          style="width: 240px"
          placeholder="请输入提前期（月）"
        />
      </el-form-item>

      <!-- 目标月份 -->
      <el-form-item label="目标月份">
        <el-date-picker
          v-model="formData.grad_month"
          type="month"
          placeholder="选择月份"
          format="MM"
          value-format="MM"
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
          format="YYYYMM"
          value-format="YYYYMM"
        />
      </el-form-item>

      <!-- 分析范围（经纬度） -->
      <el-form-item label="分析范围">
        <el-input
          v-model="formData.grad_lat_lon"
          disabled
          placeholder="请输入经纬度范围（目前只支持全范围）"
        />
      </el-form-item>

      <!-- 选择分析目标 -->
      <el-form-item label="分析目标">
        <el-radio-group v-model="formData.grad_type">
          <el-radio value="sum">海冰面积</el-radio>
          <el-radio value="variation">海冰变化</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" :loading="isLoading" @click="submitForm">
          {{ isLoading ? '分析中...' : '提交分析' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 加载动画 -->
    <div v-if="isLoading" class="flex justify-center my-6">
      <LoadingAnimation />
    </div>

    <!-- 热图展示 -->
    <div v-if="!isLoading && isOK" class="mt-6">
      <h3 class="text-lg font-semibold mb-2">分析结果热图</h3>
      <ArcticSeaIceViewer :images="images" alt="分析结果热图" class="w-full" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDynamicsAnalysis } from '@/common/api'
import ArcticSeaIceViewer from '../components/ArcticSeaIceViewer.vue'
import LoadingAnimation from '../components/LoadingAnimation.vue'
import { ElMessage } from 'element-plus'

const formData = ref({
  grad_forecast_month: null,
  grad_month: null,
  dataRange: [],
  start_time: '',
  end_time: '',
  grad_lat_lon: '',
  grad_type: 'sum' // 默认选择海冰面积
})

const images = ref([])
const isOK = ref(false)
const isLoading = ref(false)

const submitForm = async () => {
  if (
    !formData.value.dataRange ||
    !formData.value.grad_month ||
    !formData.value.grad_forecast_month
  ) {
    ElMessage.error('请填写完整的分析参数')
    return
  }

  try {
    isLoading.value = true
    isOK.value = false

    formData.value.start_time = formData.value.dataRange[0]
    formData.value.end_time = formData.value.dataRange[1]

    const data = await useDynamicsAnalysis(
      formData.value.start_time,
      formData.value.end_time,
      formData.value.grad_type,
      formData.value.grad_month
    )

    images.value = data
    isOK.value = true
    ElMessage.success('分析完成')
  } catch (error) {
    ElMessage.error('分析失败，请重试')
    console.error('Analysis error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
