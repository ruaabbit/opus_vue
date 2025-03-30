<template>
  <div class="container-layout">
    <!-- 移除或注释掉外层的sidebar，因为目前没有使用 -->
    <!-- <div class="sidebar">
        <!- <ImageSelector /> ->
      </div> -->

    <div class="main-content">
      <!-- 移除或注释掉内层的sidebar，因为目前没有使用 -->
      <!-- <div class="sidebar">
          <!- <ImageSelector /> ->
        </div> -->

      <el-card class="box-card">
        <el-form :model="formData" @submit.prevent="submitForm" class="analysis-form">
          <el-form-item label="数据范围">
            <el-date-picker
              v-model="formData.dataRange[0]"
              type="date"
              placeholder="选择开始日期"
              format="YYYY-MM-DD"
              value-format="YYYYMMDD"
            />
            <span style="margin: 0 8px">至</span>
            <el-date-picker
              v-model="formData.dataRange[1]"
              type="date"
              placeholder="结束日期 (自动设置为开始日期+13天)"
              format="YYYY-MM-DD"
              value-format="YYYYMMDD"
              disabled
            />
          </el-form-item>

          <el-form-item label="目标日期">
            <el-input v-model="formData.grad_day" placeholder="请输入目标日期" />
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
              <el-radio value="sum">海冰面积</el-radio>
              <el-radio value="l2">L2范数</el-radio>
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
          <ModelInterpreterViewer :images="images" class="full-width" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useModelInterpreter, getModelInterpreter } from '@/common/api'
import ModelInterpreterViewer from '@/components/ModelInterpreterViewer.vue'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
// import ImageSelector from '@/components/ImageSelector.vue'

const formData = ref({
  dataRange: [],
  grad_day: '',
  grad_lat_lon: '',
  grad_type: 'sum'
})

const images = ref([])
const isOK = ref(false)
const isLoading = ref(false)
const currentTaskId = ref(null)

// 添加新的 watch，确保结束日期始终为开始日期+13天
watch(
  () => formData.value.dataRange[0],
  (startDate) => {
    if (startDate) {
      // 将开始日期字符串转换为 Date 对象
      const start = new Date(
        startDate.substring(0, 4),
        parseInt(startDate.substring(4, 6)) - 1,
        parseInt(startDate.substring(6, 8))
      )

      // 计算结束日期（开始日期 + 13天）
      const end = new Date(start)
      end.setDate(start.getDate() + 13)

      // 格式化结束日期为 YYYYMMDD 格式
      const endFormatted =
        end.getFullYear() +
        String(end.getMonth() + 1).padStart(2, '0') +
        String(end.getDate()).padStart(2, '0')

      // 更新 dataRange 数组
      formData.value.dataRange = [startDate, endFormatted]
    }
  }
)

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
    !formData.value.grad_day
  ) {
    ElMessage.error('请填写完整的分析参数')
    return
  }

  try {
    isLoading.value = true
    isOK.value = false

    const res = await useModelInterpreter(
      formData.value.dataRange[0],
      formData.value.dataRange[1],
      formData.value.grad_type,
      formData.value.grad_day
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

.container-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

/* 移除未使用的sidebar样式或保留但设置宽度为0 */
.sidebar {
  display: none; /* 完全隐藏sidebar */
}

.main-content {
  width: 100%;
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

  /* 以下两个样式可以移除，因为我们已经隐藏了sidebar */
  /*
    .sidebar {
      width: 0;
    }
    */
}
</style>
