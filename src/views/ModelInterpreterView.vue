<template>
  <div class="container-layout">
    <el-card class="box-card">
      <el-form :model="formData" @submit.prevent="submitForm" class="analysis-form">
        <el-form-item label="数据范围" required>
          <el-date-picker
            v-model="formData.dataRange[0]"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYYMMDD"
            @change="validateDateRange"
          />
          <span style="margin: 0 8px">至</span>
          <el-date-picker
            v-model="formData.dataRange[1]"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYYMMDD"
            :disabled-date="disabledEndDate"
            @change="validateDateRange"
          />
          <div v-if="dateError" class="date-error-tip">
            <span style="color: #f56c6c; font-size: 12px">{{ dateError }}</span>
          </div>
        </el-form-item>

        <el-form-item label="预测间隔(天)" required>
          <el-input-number
            v-model="formData.pred_gap"
            :min="1"
            :max="7"
            placeholder="预测间隔天数"
          />
        </el-form-item>

        <el-form-item label="分析目标" required>
          <el-radio-group v-model="formData.grad_type">
            <el-radio value="sum">均值</el-radio>
            <el-radio value="l2">分布</el-radio>
          </el-radio-group>
        </el-form-item>

          <el-form-item label="选定位置">
            <ImageSelector
              v-model:topLeft="topLeftCoord"
              v-model:bottomRight="bottomRightCoord"
              @update:topLeft="updatePosition"
              @update:bottomRight="updatePosition"
              :width="304"
              :height="448"
              :imageSrc="'/seaice/picture/arctic_mask.webp'"
            />
          </el-form-item>

        <el-form-item label="选定变量">
          <el-radio-group v-model="formData.variable">
            <el-radio label="1">海冰密集度(SIC)</el-radio>
            <el-radio label="2">海冰U分量(SI_U)</el-radio>
            <el-radio label="3">海冰V分量(SI_V)</el-radio>
            <el-radio label="4">2米温度(T2M)</el-radio>
            <el-radio label="5">10米U风(U10M)</el-radio>
            <el-radio label="6">10米V风(V10M)</el-radio>
          </el-radio-group>
          <div v-if="formData.variable" style="margin-top: 8px">
            <el-button @click="formData.variable = ''" size="small">取消选择</el-button>
          </div>
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
        <ModelInterpreterViewer :images="images" class="full-width" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useModelInterpreter, getModelInterpreter } from '@/common/api'
import ModelInterpreterViewer from '@/components/ModelInterpreterViewer.vue'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
import ImageSelector from '@/components/ImageSelector.vue'

const formData = ref({
  dataRange: [], // [start_time, end_time]
  pred_gap: 1, // 默认为1天
  grad_type: 'sum',
  position: '', // 选定位置
  variable: '' // 选定变量
})

const topLeftCoord = ref({ x: null, y: null })
const bottomRightCoord = ref({ x: null, y: null })

const updatePosition = () => {
  if (topLeftCoord.value.x !== null && bottomRightCoord.value.x !== null) {
    // 由于图片坐标系原点在左上角，y轴向下，需要用448(图片高度)减去y坐标来修正
    const height = 448 // 图片高度
    const topY = height - topLeftCoord.value.y
    const bottomY = height - bottomRightCoord.value.y
    formData.value.position = `${topY},${topLeftCoord.value.x};${bottomY},${topLeftCoord.value.x};${topY},${bottomRightCoord.value.x};${bottomY},${bottomRightCoord.value.x}`
  } else {
    formData.value.position = ''
  }
}

const images = ref([])
const isOK = ref(false)
const isLoading = ref(false)
const currentTaskId = ref(null)
const dateError = ref('')

// 禁用不符合条件的日期（必须在1979-2023范围内，且结束日期至少比开始日期晚13天）
const disabledEndDate = (date) => {
  const minYear = 1979
  const maxYear = 2023
  const year = date.getFullYear()

  if (year < minYear || year > maxYear) return true

  if (!formData.value.dataRange[0]) return false

  const startDate = new Date(
    formData.value.dataRange[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
  )
  const minEndDate = new Date(startDate)
  minEndDate.setDate(startDate.getDate() + 12)

  return date.getTime() < minEndDate.getTime()
}

// 验证日期范围
const validateDateRange = () => {
  const { dataRange } = formData.value
  dateError.value = ''

  if (dataRange[0]) {
    const startDate = new Date(dataRange[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
    const startYear = startDate.getFullYear()

    if (startYear < 1979 || startYear > 2023) {
      dateError.value = '开始日期必须在1979-2023范围内'
      formData.value.dataRange[0] = '' // 清空不合规的开始日期
      return false
    }
  }

  if (dataRange[0] && dataRange[1]) {
    const startDate = new Date(dataRange[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
    const endDate = new Date(dataRange[1].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
    const endYear = endDate.getFullYear()
    const daysDiff = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000))

    if (endYear < 1979 || endYear > 2023) {
      dateError.value = '结束日期必须在1979-2023范围内'
      formData.value.dataRange[1] = '' // 清空不合规的结束日期
      return false
    }

    if (daysDiff < 13) {
      dateError.value = '结束日期至少需要比开始日期晚13天'
      formData.value.dataRange[1] = '' // 清空不合规的结束日期
      return false
    }
  }

  return true
}

const pollAnalysisResult = async () => {
  if (!currentTaskId.value) return

  try {
    const response = await getModelInterpreter(currentTaskId.value)

    // 根据API响应的标准格式处理结果
    if (response.success && response.status === 'COMPLETED') {
      // 任务完成，处理结果
      if (response.data && response.data.images) {
        images.value = response.data.images
        isOK.value = true
        ElMessage.success(response.message || '分析完成')
        isLoading.value = false
        currentTaskId.value = null
      } else {
        throw new Error('返回数据格式不正确')
      }
    } else if (response.status === 'IN_PROGRESS') {
      // 任务仍在进行中，继续轮询
      console.log('任务处理中，继续轮询...')
    } else if (response.status === 'FAILED') {
      // 任务失败
      throw new Error(response.message || '任务处理失败')
    }
  } catch (error) {
    console.error('轮询分析结果出错:', error)
    isLoading.value = false
    isOK.value = false
    ElMessage.error(error.message || '获取分析结果失败')
  }
}

const submitForm = async () => {
  if (
    !formData.value.dataRange ||
    !formData.value.dataRange[0] ||
    !formData.value.dataRange[1] ||
    !formData.value.pred_gap ||
    !formData.value.grad_type
  ) {
    ElMessage.error('请填写必填的分析参数')
    return
  }

  // 提交前再次验证日期范围
  if (!validateDateRange()) {
    ElMessage.error(dateError.value || '日期范围不符合要求')
    return
  }

  try {
    isLoading.value = true
    isOK.value = false

    const res = await useModelInterpreter(
      formData.value.dataRange[0],
      formData.value.dataRange[1],
      formData.value.pred_gap,
      formData.value.grad_type,
      formData.value.position,
      formData.value.variable
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

.date-error-tip {
  margin-top: 4px;
}

/* 响应式布局调整 */
@media (min-width: 768px) {
  .container-layout {
    flex-direction: row;
  }
}
</style>
