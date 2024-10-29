<template>
  <div class="container mx-auto flex flex-col items-center max-h-screen p-4 space-y-4">
    <!-- 返回按钮，预测结果展示时显示 -->
    <el-button v-if="showResults" @click="handleBack"> 返回 </el-button>

    <!-- 表单内容，未提交时显示 -->
    <div v-if="!showResults" class="space-y-4">
      <!-- 图片上传组件 -->
      <el-upload
        v-model:file-list="fileList"
        class="upload-demo"
        action="https://seaice.52lxy.one:20443/seaice/png-upload"
        :accept="'.png'"
        :multiple="true"
        :limit="14"
        list-type="picture-card"
        :before-upload="handleBeforeUpload"
        :on-preview="handlePreview"
        :on-change="handleUploadChange"
        :on-exceed="handleExceed"
      >
        <template #default>
          <div v-if="fileList.length < 14" class="upload-trigger">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">Upload</div>
          </div>
        </template>

        <template #file="{ file }">
          <div>
            <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
            <span class="el-upload-list__item-actions">
              <span class="el-upload-list__item-preview" @click="handlePreview(file)">
                <el-icon><ZoomIn /></el-icon>
              </span>
              <span class="el-upload-list__item-delete" @click="handleRemove(file)">
                <el-icon><Delete /></el-icon>
              </span>
            </span>
          </div>
        </template>
      </el-upload>

      <!-- 月份选择组件 -->
      <el-date-picker
        v-model="selectedMonth"
        type="month"
        placeholder="选择月份"
        format="YYYY/MM"
        value-format="YYYY-MM"
      />

      <!-- 提交按钮 -->
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>

    <!-- 图片展示，提交后显示 -->
    <div v-if="showResults" class="flex items-center justify-center w-full">
      <div v-if="images.length">
        <ArcticSeaIceViewer :images="images" />
      </div>
      <div v-else class="text-center text-gray-500">请上传图片并选择月份以查看预测结果</div>
    </div>

    <!-- 预览图片的对话框 -->
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'
import ArcticSeaIceViewer from '../components/ArcticSeaIceViewer.vue'
import { useMonthPrediction } from '@/common/api'

// 状态管理
const selectedMonth = ref(null)
const images = ref([])
const showResults = ref(false)
const fileList = ref([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 文件上传前的验证
const handleBeforeUpload = (file) => {
  const isPNG = file.type === 'image/png'
  if (!isPNG) {
    ElMessage.error('仅支持PNG文件')
    return false
  }
  return true
}

// 处理文件上传状态变化
const handleUploadChange = (uploadFile) => {
  if (uploadFile.status === 'ready') {
    // 文件准备上传
  } else if (uploadFile.status === 'success') {
    ElMessage.success(`${uploadFile.name} 文件上传成功`)
  } else if (uploadFile.status === 'error') {
    ElMessage.error(`${uploadFile.name} 文件上传失败`)
  }
}

// 处理超出文件数量限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传14张图片')
}

// 处理预览图片
const handlePreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url
  dialogVisible.value = true
}

// 处理移除文件
const handleRemove = (uploadFile) => {
  fileList.value = fileList.value.filter((file) => file.uid !== uploadFile.uid)
}

// 处理表单提交
const handleSubmit = () => {
  if (!selectedMonth.value) {
    ElMessage.error('请选择月份')
    return
  }

  if (fileList.value.length !== 14) {
    ElMessage.error('请上传14张图片')
    return
  }

  const [year, month] = selectedMonth.value.split('-')

  useMonthPrediction(parseInt(year), parseInt(month) - 1)
    .then((res) => {
      images.value = res
      showResults.value = true
    })
    .catch((error) => {
      ElMessage.error('预测失败，请稍后重试')
      console.error(error)
    })
}

// 处理返回
const handleBack = () => {
  showResults.value = false
  images.value = []
  selectedMonth.value = null
}
</script>

<style scoped>
.upload-demo {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.upload-demo .el-upload {
  width: 100%;
}

/* 新增的上传按钮样式 */
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

/* 添加预览图片的操作样式 */
.el-upload-list__item-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
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
