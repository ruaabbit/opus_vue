<template>
  <div class="flex flex-col md:flex-row gap-4 p-4">
    <div class="md:w-1/3 w-full">
      <!-- <ImageSelector /> -->
    </div>
    <div class="md:w-1/3 w-full">
      <div class="md:w-1/3 w-full">
        <!-- <ImageSelector /> -->
      </div>
      <el-card class="box-card">
        <el-form :model="formData" @submit.prevent="submitForm">
          <el-form-item label="数据范围">
            <el-date-picker
              v-model="formData.dataRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              format="YYYY-MM"
              value-format="YYYYMM"
            />
          </el-form-item>

          <el-form-item label="预报提前期">
            <el-input-number
              v-model="formData.grad_forecast_month"
              :min="1"
              placeholder="请输入提前期（月）"
            />
          </el-form-item>

          <el-form-item label="目标月份">
            <el-date-picker
              v-model="formData.grad_month"
              type="month"
              placeholder="目标月份由数据范围和预报提前期决定"
              format="MM"
              value-format="MM"
              disabled
            />
          </el-form-item>

          <el-form-item label="分析范围">
            <el-input
              v-model="formData.grad_lat_lon"
              disabled
              placeholder="请输入经纬度范围（目前只支持全范围）"
            />
          </el-form-item>

          <el-form-item label="分析目标">
            <el-radio-group v-model="formData.grad_type">
              <el-radio label="sum">海冰面积</el-radio>
              <el-radio label="variation">海冰变化</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="isLoading" @click="submitForm">
              {{ isLoading ? '分析中...' : '提交分析' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="isLoading" class="flex justify-center my-6">
          <LoadingAnimation />
        </div>

        <div v-if="!isLoading && isOK" class="mt-6">
          <h3 class="text-lg font-semibold mb-2">分析结果热图</h3>
          <ArcticSeaIceViewer :images="images" alt="分析结果热图" class="w-full" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useDynamicsAnalysis, getDynamicsAnalysisResult } from '@/common/api'
import ArcticSeaIceViewer from '@/components/ArcticSeaIceViewer.vue'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
// import ImageSelector from '@/components/ImageSelector.vue'

const formData = ref({
  dataRange: [],
  grad_forecast_month: 1,
  grad_month: '',
  grad_lat_lon: '',
  grad_type: 'sum'
})

const images = ref([])
const isOK = ref(false)
const isLoading = ref(false)
const currentTaskId = ref(null)

watch(
  [() => formData.value.dataRange, () => formData.value.grad_forecast_month],
  ([newDataRange, newForecastMonth]) => {
    if (newDataRange && newDataRange[1] && newForecastMonth) {
      const endDate = new Date(
        newDataRange[1].substring(0, 4),
        parseInt(newDataRange[1].substring(4)) - 1
      )
      endDate.setMonth(endDate.getMonth() + newForecastMonth)
      formData.value.grad_month = String(endDate.getMonth() + 1).padStart(2, '0')
    } else {
      formData.value.grad_month = ''
    }
  }
)

const pollAnalysisResult = async () => {
  if (!currentTaskId.value) return

  try {
    const result = await getDynamicsAnalysisResult(currentTaskId.value)

    if (result.length !== 0) {
      images.value = result
      isOK.value = true
      ElMessage.success('分析完成')
      isLoading.value = false
      currentTaskId.value = null
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('Task not completed yet, continuing polling...')
      return
    }
    console.error('轮询分析结果出错:', error)
    isLoading.value = false
    isOK.value = false
    ElMessage.error('获取分析结果失败')
  }
}

const submitForm = async () => {
  if (
    !formData.value.dataRange ||
    !formData.value.dataRange[0] ||
    !formData.value.dataRange[1] ||
    !formData.value.grad_month ||
    !formData.value.grad_forecast_month
  ) {
    ElMessage.error('请填写完整的分析参数')
    return
  }

  try {
    isLoading.value = true
    isOK.value = false

    const res = await useDynamicsAnalysis(
      formData.value.dataRange[0],
      formData.value.dataRange[1],
      formData.value.grad_type,
      formData.value.grad_month
    )

    currentTaskId.value = res.task_id

    const pollingInterval = setInterval(async () => {
      await pollAnalysisResult()
      if (!isLoading.value) {
        clearInterval(pollingInterval)
      }
    }, 2000)
  } catch (error) {
    isOK.value = false
    isLoading.value = false
    ElMessage.error('提交分析请求失败，请重试')
    console.error('Analysis error:', error)
  }
}

onUnmounted(() => {
  if (currentTaskId.value) {
    currentTaskId.value = null
  }
})
</script>

<style scoped>
.el-form-item {
  margin-bottom: 20px;
}
</style>
