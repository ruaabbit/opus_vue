<template>
  <div class="container mx-auto flex flex-col items-center max-h-screen p-4 space-y-4">
    <!-- 返回按钮 -->
    <el-button v-if="showResults" class="self-start" @click="handleBack"> 返回 </el-button>

    <!-- 表单内容 -->
    <div v-if="!showResults" class="space-y-4">
      <!-- 上传提示 -->
      <div class="text-center mb-4">
        <p class="text-gray-600">
          请上传正好{{ imageLimit }}张PNG图片 (已上传: {{ fileList.length }}/{{ imageLimit }})
        </p>
      </div>

      <!-- 图片上传组件 -->
      <el-upload
        v-model:file-list="fileList"
        class="upload-demo"
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
          <div v-if="fileList.length < imageLimit" class="upload-trigger">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">上传</div>
          </div>
          <div v-else class="upload-trigger">
            <el-icon class="upload-icon text-green-500"><Check /></el-icon>
            <div class="upload-text text-green-500">已完成</div>
          </div>
        </template>

        <template #file="{ file }">
          <div>
            <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
            <span class="el-upload-list__item-actions">
              <span class="el-upload-list__item-preview" @click="showPreview(file)">
                <el-icon><ZoomIn /></el-icon>
              </span>
              <span class="el-upload-list__item-delete" @click="handleRemove(file)">
                <el-icon><Delete /></el-icon>
              </span>
            </span>
          </div>
        </template>
      </el-upload>

      <!-- 日期选择器插槽 -->
      <slot name="date-picker"></slot>

      <!-- 提交按钮 -->
      <el-button
        type="primary"
        @click="submitPrediction"
        :loading="isLoading"
        :disabled="
          fileList.length !== imageLimit || !selectedDate || uploadedPaths.length !== imageLimit
        "
      >
        {{ isLoading ? '分析中...' : '提交分析' }}
      </el-button>
    </div>

    <!-- 加载动画 -->
    <div v-if="isLoading" class="flex justify-center my-6">
      <LoadingAnimation />
    </div>

    <!-- 预测结果展示 -->
    <div v-if="!isLoading && showResults" class="flex items-center justify-center w-full">
      <div v-if="images.length">
        <ArcticSeaIceViewer :images="images" />
      </div>
      <div v-else class="text-center text-gray-500">请上传图片并选择日期以查看预测结果</div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="dialogVisible" title="预览">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus, ZoomIn, Delete, Check } from '@element-plus/icons-vue'
import ArcticSeaIceViewer from '@/components/ArcticSeaIceViewer.vue'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
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
.upload-demo {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-text {
  color: #8c939d;
  font-size: 14px;
}

:deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 100px;
}

:deep(.el-upload-list--picture-card) {
  --el-upload-list-picture-card-size: 100px;
}

:deep(.el-upload-list__item-thumbnail) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
