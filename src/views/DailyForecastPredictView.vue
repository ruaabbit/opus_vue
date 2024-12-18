<template>
  <div class="container mx-auto flex flex-col items-center max-h-screen p-4 space-y-4">
    <!-- 返回按钮 -->
    <el-button v-if="showResults" class="self-start" @click="handleBack"> 返回 </el-button>

    <!-- 表单内容 -->
    <div v-if="!showResults" class="space-y-4">
      <!-- 上传提示 -->
      <div class="text-center mb-4">
        <p class="text-gray-600">请上传正好14张PNG图片 (已上传: {{ fileList.length }}/14)</p>
      </div>

      <!-- 图片上传组件 -->
      <el-upload
        v-model:file-list="fileList"
        class="upload-demo"
        action="https://seaice.52lxy.one:20443/seaice/png-upload"
        accept=".png"
        list-type="picture-card"
        :multiple="true"
        :limit="14"
        :before-upload="validateBeforeUpload"
        :on-preview="showPreview"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :on-remove="handleRemove"
        :auto-upload="true"
      >
        <template #default>
          <div v-if="fileList.length < 14" class="upload-trigger">
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

      <!-- 日期选择器 -->
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        format="YYYY/MM/DD"
        style="width: 100%; max-width: 300px"
        value-format="YYYY/MM/DD"
      />

      <!-- 提交按钮 -->
      <el-button
        type="primary"
        @click="submitPredictionRequest"
        :loading="isLoading"
        :disabled="fileList.length !== 14 || !selectedDate || uploadedPaths.length !== 14"
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
import { useDayPrediction, getDayPredictionResult } from '@/common/api'
import { ElMessage } from 'element-plus'

// 状态管理
const selectedDate = ref(null)
const images = ref([]) // 存储预测结果图片
const showResults = ref(false) // 控制预测结果显示
const fileList = ref([]) // 上传的文件列表
const dialogImageUrl = ref('') // 预览图像的URL
const dialogVisible = ref(false) // 控制预览对话框显示
const uploadedPaths = ref([]) // 存储上传成功后的图片路径
const isLoading = ref(false) // 添加加载状态
const taskId = ref(null)
const pollingInterval = ref(null)

// 监听文件列表变化
watch(fileList, (newFiles) => {
  if (newFiles.length === 14) {
    ElMessage.success('已成功选择14张图片')
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

  if (fileList.value.length >= 14) {
    ElMessage.error('已达到14张图片上限')
    return false
  }

  return true
}

// 处理单个文件上传成功
const handleUploadSuccess = (response, uploadFile) => {
  // 假设接口返回的数据中包含图片路径，根据实际接口返回格式调整
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
  // 同时移除对应的路径
  const index = fileList.value.findIndex((file) => file.uid === uploadFile.uid)
  if (index !== -1) {
    uploadedPaths.value.splice(index, 1)
  }
  ElMessage.warning(`还需上传${14 - fileList.value.length}张图片`)
}

// 轮询获取预测结果
const pollPredictionResult = async () => {
  if (!taskId.value) return

  try {
    const result = await getDayPredictionResult(taskId.value)
    if (result.length != 0) {
      images.value = result
      showResults.value = true
      clearInterval(pollingInterval.value)
      isLoading.value = false
    } else {
      clearInterval(pollingInterval.value)
      isLoading.value = false
      ElMessage.error('预测失败，请稍后重试')
    }
  } catch (error) {
    clearInterval(pollingInterval.value)
    isLoading.value = false
    ElMessage.error('获取预测结果失败，请稍后重试')
    console.error(error)
  }
}

// 提交预测请求
const submitPredictionRequest = async () => {
  if (!selectedDate.value) {
    ElMessage.error('请选择日期')
    return
  }

  if (fileList.value.length !== 14) {
    ElMessage.error(`请上传正好14张图片, 当前已上传${fileList.value.length}张`)
    return
  }

  if (uploadedPaths.value.length !== 14) {
    ElMessage.error('部分图片上传未完成，请等待所有图片上传完成后重试')
    return
  }

  try {
    isLoading.value = true
    const res = await useDayPrediction(selectedDate.value, uploadedPaths.value)
    taskId.value = res.task_id

    // 开始轮询结果
    pollingInterval.value = setInterval(pollPredictionResult, 2000) // 每2秒轮询一次
  } catch (error) {
    showResults.value = false
    ElMessage.error('提交预测请求失败，请稍后重试')
    console.error(error)
    isLoading.value = false
  }
}

// 返回并重置表单
const handleBack = () => {
  showResults.value = false
  images.value = []
  taskId.value = null
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
  fileList.value = []
  uploadedPaths.value = []
  selectedDate.value = null
}
</script>

<style scoped>
.upload-demo {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.el-upload {
  width: 100%;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-text {
  margin-top: 8px;
  color: #8c939d;
  font-size: 14px;
}

.el-upload-list__item-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.el-date-picker {
  width: 100%;
  max-width: 300px;
}

.el-upload-list__item-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.el-upload-list__item-actions:hover {
  opacity: 1;
}

.el-upload-list__item-preview,
.el-upload-list__item-delete {
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  margin: 0 7px;
}
</style>
