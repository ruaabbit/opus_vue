<template>
  <div class="upload-container">
    <!-- 返回按钮 -->
    <el-button v-if="showResults" class="back-button" @click="handleBack">
      <el-icon>
        <ArrowLeft />
      </el-icon>
      返回
    </el-button>

    <!-- 表单内容 -->
    <div v-if="!showResults" class="form-content">
      <!-- 上传提示 -->
      <div class="upload-header">
        <h3>图片上传</h3>
        <div class="upload-progress">
          <div class="progress-text">
            <span>已上传: </span>
            <span :class="{ complete: fileList.length === props.imageLimit }">
              {{ fileList.length }}/{{ props.imageLimit }}
            </span>
          </div>
          <el-progress
            :percentage="(fileList.length / props.imageLimit) * 100"
            :stroke-width="8"
            :show-text="false"
            :status="fileList.length === props.imageLimit ? 'success' : ''"
          />
        </div>
        <p class="hint-text">请上传{{ props.imageLimit }}张PNG格式图片</p>
      </div>

      <!-- 日期选择器插槽 -->
      <div class="date-picker-section">
        <slot name="date-picker"></slot>
        <p class="date-hint">选择的日期将作为第一张图片的日期</p>
      </div>

      <!-- 图片上传区域 -->
      <div class="upload-area">
        <el-upload
          v-model:file-list="fileList"
          class="image-uploader"
          action="https://seaice.52lxy.one:20443/seaice/png-upload"
          accept=".png"
          list-type="picture-card"
          :multiple="true"
          :limit="imageLimit"
          :before-upload="validateBeforeUpload"
          :on-preview="showPreview"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-remove="handleRemove"
          :auto-upload="true"
        >
          <template #default>
            <div v-if="fileList.length < props.imageLimit" class="upload-trigger">
              <el-icon class="upload-icon">
                <Plus />
              </el-icon>
              <div class="upload-text">点击上传</div>
              <div class="upload-hint">仅支持PNG格式</div>
            </div>
            <div v-else class="upload-complete">
              <el-icon class="complete-icon">
                <Check />
              </el-icon>
              <div class="complete-text">上传完成</div>
            </div>
          </template>

          <template #file="{ file, index }">
            <div class="custom-upload-item">
              <img class="upload-thumbnail" :src="file.url" alt="" />
              <div class="upload-item-overlay">
                <div class="upload-item-actions">
                  <el-button circle type="primary" @click.stop="showPreview(file)">
                    <el-icon>
                      <ZoomIn />
                    </el-icon>
                  </el-button>
                  <el-button circle type="danger" @click.stop="handleRemove(file)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </div>
              <div class="image-date-label">
                <span>{{ getImageDate(index) }}</span>
              </div>
            </div>
          </template>
        </el-upload>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <el-button
          type="primary"
          size="large"
          @click="submitPrediction"
          :loading="isLoading"
          :disabled="
            fileList.length !== props.imageLimit ||
            !selectedDate ||
            uploadedPaths.length !== props.imageLimit
          "
          class="submit-button"
        >
          <el-icon v-if="!isLoading">
            <DataAnalysis />
          </el-icon>
          <span>{{ isLoading ? '分析中...' : '提交分析' }}</span>
        </el-button>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="isLoading" class="loading-container">
      <LoadingAnimation />
      <p class="loading-text">正在分析您的图片，请稍候...</p>
    </div>

    <!-- 预测结果展示 -->
    <div v-if="!isLoading && showResults" class="results-container">
      <div v-if="images.length">
        <ArcticSeaIceViewer :images="images" />
      </div>
      <div v-else class="empty-results">
        <el-empty description="暂无预测结果" />
        <p>请上传图片并选择日期以查看预测结果</p>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="dialogVisible" title="图片预览" width="50%" center destroy-on-close>
      <div class="preview-container">
        <img class="preview-image" :src="dialogImageUrl" alt="Preview Image" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus, ZoomIn, Delete, Check, ArrowLeft, DataAnalysis } from '@element-plus/icons-vue'
import ArcticSeaIceViewer from '@/components/ArcticSeaIceViewer.vue'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  timeMode: {
    type: String,
    required: true
  },
  imageLimit: {
    type: Number,
    required: true
  },
  selectedDate: {
    type: [Date, String],
    required: true
  },
  getPredictionResult: {
    type: Function,
    required: true
  },
  submitPredictionRequest: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:selectedDate'])

// 状态管理
const images = ref([])
const showResults = ref(false)
const fileList = ref([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const uploadedPaths = ref([])
const isLoading = ref(false)
const taskId = ref(null)
const pollingInterval = ref(null)
const localSelectedDate = ref(null)
const imageDates = ref([])

// 监听selectedDate变化
watch(
  () => props.selectedDate,
  (newDate) => {
    localSelectedDate.value = newDate
    updateImageDates()
  }
)

// 监听文件列表变化
watch(fileList, () => {
  updateImageDates()
})

// 更新图片日期
const updateImageDates = () => {
  if (!localSelectedDate.value) return

  const dates = []
  const baseDate = new Date(localSelectedDate.value)

  for (let i = 0; i < props.imageLimit; i++) {
    const date = new Date(baseDate)

    if (props.timeMode === 'daily') {
      date.setDate(date.getDate() + i)
    } else if (props.timeMode === 'monthly') {
      date.setMonth(date.getMonth() + i)
    } else {
      console.log('Unhandled timeMode:', props.timeMode)
      // 可以添加默认行为或错误处理
    }

    dates.push(formatDate(date))
  }

  imageDates.value = dates
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取指定索引图片的日期
const getImageDate = (index) => {
  if (!imageDates.value.length || index >= imageDates.value.length) {
    return '未设置日期'
  }
  return imageDates.value[index]
}

// 监听文件列表变化
watch(fileList, (newFiles) => {
  if (newFiles.length === props.imageLimit) {
    ElMessage.success(`已成功选择${props.imageLimit}张图片`)
  }
})

// 将文件转换为Base64格式
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// 文件上传前的验证逻辑
const validateBeforeUpload = (file) => {
  const isPNG = file.type === 'image/png'
  if (!isPNG) {
    ElMessage.error('仅支持PNG文件')
    return false
  }

  if (fileList.value.length >= props.imageLimit) {
    ElMessage.error(`已达到${props.imageLimit}张图片上限`)
    return false
  }

  return true
}

// 处理单个文件上传成功
const handleUploadSuccess = (response, uploadFile) => {
  const imagePath = response.image_url
  if (imagePath) {
    uploadedPaths.value.push(imagePath)
  }
  ElMessage.success(`${uploadFile.name} 上传成功`)
}

// 处理文件上传失败
const handleUploadError = (error, uploadFile) => {
  ElMessage.error(`${uploadFile.name} 上传失败`)
  console.error('Upload error:', error)
}

// 显示文件预览
const showPreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = await convertToBase64(file.raw)
  }
  dialogImageUrl.value = file.url || file.preview
  dialogVisible.value = true
}

// 移除文件
const handleRemove = (uploadFile) => {
  fileList.value = fileList.value.filter((file) => file.uid !== uploadFile.uid)
  const index = fileList.value.findIndex((file) => file.uid === uploadFile.uid)
  if (index !== -1) {
    uploadedPaths.value.splice(index, 1)
  }
  ElMessage.warning(`还需上传${props.imageLimit - fileList.value.length}张图片`)
}

// 轮询获取预测结果
const pollPredictionResult = async () => {
  if (!taskId.value) return

  try {
    const result = await props.getPredictionResult(taskId.value)
    if (result.length != 0) {
      images.value = result
      showResults.value = true
      clearInterval(pollingInterval.value)
      isLoading.value = false
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('Task not completed yet, continuing polling...')
      return
    }
    clearInterval(pollingInterval.value)
    isLoading.value = false
    ElMessage.error('获取预测结果失败')
    console.error('Error:', error)
  }
}

// 提交预测
const submitPrediction = async () => {
  try {
    isLoading.value = true
    const response = await props.submitPredictionRequest(props.selectedDate, uploadedPaths.value)
    taskId.value = response.task_id
    pollingInterval.value = setInterval(pollPredictionResult, 2000)
  } catch (error) {
    isLoading.value = false
    ElMessage.error('提交预测请求失败')
    console.error('Error:', error)
  }
}

// 返回并重置表单
const handleBack = () => {
  showResults.value = false
  images.value = []
  fileList.value = []
  uploadedPaths.value = []
  taskId.value = null
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
  emit('update:selectedDate', null)
}
</script>

<style scoped>
.upload-container {
  margin: 0 auto;
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
}

.upload-header {
  margin-bottom: 24px;
  text-align: center;
}

.upload-header h3 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #303133;
}

.upload-progress {
  margin: 16px auto;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  cursor: pointer;
}

.upload-icon {
  font-size: 28px;
  color: #409eff;
  margin-bottom: 8px;
}

.upload-text {
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}

.custom-upload-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 6px;
}

.upload-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.date-picker-section {
  margin: 24px 0;
}

.upload-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-bottom: 20px;
}

.upload-progress {
  margin: 16px auto;
  max-width: 400px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-text .complete {
  color: #67c23a;
  font-weight: bold;
}

.hint-text {
  color: #909399;
  font-size: 14px;
  margin-top: 8px;
}

.mode-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.mode-label {
  margin-right: 12px;
  font-weight: 500;
}

.date-picker-section {
  margin: 24px 0;
  text-align: center;
}

.date-hint {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.upload-area {
  margin: 24px 0;
}

.image-uploader {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.upload-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

.upload-complete {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.complete-icon {
  font-size: 28px;
  color: #67c23a;
  margin-bottom: 8px;
}

.complete-text {
  color: #67c23a;
  font-size: 14px;
  font-weight: 500;
}

.custom-upload-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.upload-thumbnail {
  width: 100%;
  height: calc(100% - 24px);
  object-fit: cover;
}

.image-date-label {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 0;
  text-align: center;
  font-size: 12px;
}

.upload-item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 24px);
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.custom-upload-item:hover .upload-item-overlay {
  opacity: 1;
}

.upload-item-actions {
  display: flex;
  gap: 8px;
}

.submit-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.submit-button {
  min-width: 180px;
  font-size: 16px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.loading-text {
  margin-top: 16px;
  color: #606266;
  font-size: 16px;
}

.empty-results {
  text-align: center;
  padding: 48px 0;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .upload-container {
    padding: 16px;
  }

  .image-uploader {
    gap: 8px;
  }

  .submit-button {
    width: 100%;
  }
}
</style>
