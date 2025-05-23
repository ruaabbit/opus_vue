<template>
  <div class="container-layout">
    <el-card class="box-card">
      <el-form :model="formData" @submit.prevent="submitForm" class="analysis-form">
        <el-form-item label="开始月份">
          <el-date-picker
            v-model="formData.startMonth"
            type="month"
            placeholder="选择开始月份"
            format="YYYY-MM"
            value-format="YYYYMM"
          />
        </el-form-item>
        <el-form-item label="结束月份">
          <el-date-picker
            v-model="formData.endMonth"
            type="month"
            placeholder="选择结束月份"
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
          <ImageSelector v-model:topLeft="topLeftCoord" v-model:bottomRight="bottomRightCoord" />
        </el-form-item>

        <el-form-item label="分析目标">
          <el-radio-group v-model="formData.grad_type">
            <el-radio value="sum">海冰面积</el-radio>
            <el-radio value="variation">海冰变化</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="isLoading" @click="submitForm">
            {{ isLoading ? '分析中...' : '提交分析' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="isLoading" class="loading-container">
        <LoadingAnimation />
      </div>

      <div v-if="!isLoading && isOK" class="result-section">
        <!-- 使用新的DynamicsAnalysisViewer组件替换ArcticSeaIceViewer -->
        <DynamicsAnalysisViewer :images="images" class="full-width" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useDynamicsAnalysis, getDynamicsAnalysisResult } from '@/common/api'
import DynamicsAnalysisViewer from '@/components/DynamicsAnalysisViewer.vue'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
import ImageSelector from '@/components/ImageSelector.vue'

const formData = ref({
  startMonth: '',
  endMonth: '',
  grad_forecast_month: 1,
  grad_month: '',
  grad_lat_lon: '',
  grad_type: 'sum',
  x1: null,
  y1: null,
  x2: null,
  y2: null
})

const images = ref([])
const isOK = ref(false)
const isLoading = ref(false)
const currentTaskId = ref(null)

const topLeftCoord = ref({ x: null, y: null })
const bottomRightCoord = ref({ x: null, y: null })

// 监听坐标变化并更新formData中的属性
watch(
  [topLeftCoord, bottomRightCoord],
  ([newTopLeft, newBottomRight]) => {
    formData.value.x1 = newTopLeft.y
    formData.value.y1 = newTopLeft.x
    formData.value.x2 = newBottomRight.y
    formData.value.y2 = newBottomRight.x
  },
  { immediate: true, deep: true }
)

// 原有的watch保持不变
watch(
  [() => formData.value.endMonth, () => formData.value.grad_forecast_month],
  ([newEndMonth, newForecastMonth]) => {
    if (newEndMonth && newForecastMonth) {
      const endDate = new Date(newEndMonth.substring(0, 4), parseInt(newEndMonth.substring(4)) - 1)
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

    if (result.success && result.status === 'COMPLETED') {
      images.value = result.data.images
      isOK.value = true
      ElMessage.success(result.message || '分析完成')
      isLoading.value = false
      currentTaskId.value = null
    } else if (result.status === 'IN_PROGRESS') {
      console.log('Task not completed yet, continuing polling...')
    } else if (result.status === 'FAILED') {
      console.error('分析任务失败:', result.message)
      isLoading.value = false
      isOK.value = false
      ElMessage.error(result.message || '分析任务失败')
      currentTaskId.value = null
    }
  } catch (error) {
    console.error('轮询分析结果出错:', error)
    isLoading.value = false
    isOK.value = false
    ElMessage.error('获取分析结果失败')
    currentTaskId.value = null
  }
}

const submitForm = async () => {
  if (
    !formData.value.startMonth ||
    !formData.value.endMonth ||
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
      formData.value.startMonth,
      formData.value.endMonth,
      formData.value.grad_type,
      formData.value.grad_month,
      formData.value.x1,
      formData.value.y1,
      formData.value.x2,
      formData.value.y2
    )
    if (!res.success) {
      isLoading.value = false
      ElMessage.error(res.message || '提交分析请求失败')
      return
    } else {
      currentTaskId.value = res.data.task_id
    }

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

.container-layout {
  display: flex;
  flex-direction: column;
}

.box-card {
  width: 100%;
  max-width: 1600px; /* 增加卡片最大宽度 */
  margin: 0 auto;
}

.analysis-form {
  max-width: 800px; /* 限制表单宽度，但让结果区域可以更宽 */
  margin: 0 auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.result-section {
  margin-top: 2rem;
  width: 100%;
  overflow-x: auto; /* 如果内容太宽，允许水平滚动 */
}

.result-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.full-width {
  width: 100%;
  max-width: 100%; /* 确保结果区域可以使用全部可用宽度 */
}

/* 响应式布局调整 */
@media (min-width: 768px) {
  .container-layout {
    flex-direction: row;
  }

  .main-content {
    width: 100%; /* 全宽显示 */
    max-width: none; /* 移除最大宽度限制 */
  }
}
</style>
