<template>
  <div class="container mx-auto flex flex-col items-center max-h-screen p-4 space-y-4">
    <!-- 返回按钮，预测结果展示时显示 -->
    <a-button v-if="showResults" class="self-start" @click="handleBack"> 返回 </a-button>

    <!-- 表单内容，未提交时显示 -->
    <div v-if="!showResults" class="space-y-4">
      <!-- 图片上传组件 -->
      <a-upload
        v-model:file-list="fileList"
        :accept="'.png'"
        action="https://seaice.52lxy.one:20443/seaice/png-upload"
        list-type="picture-card"
        :multiple="true"
        :max-count="14"
        :beforeUpload="handleBeforeUpload"
        @preview="handlePreview"
        @change="handleUploadChange"
      >
        <div v-if="fileList.length < 14">
          <plus-outlined />
          <div style="margin-top: 8px">Upload</div>
        </div>
      </a-upload>

      <!-- 月份选择组件 -->
      <a-date-picker v-model:value="selectedMonth" picker="month" placeholder="选择月份" />

      <!-- 提交按钮 -->
      <a-button type="primary" @click="handleSubmit">提交</a-button>
    </div>

    <!-- 图片展示，提交后显示 -->
    <div v-if="showResults" class="flex items-center justify-center w-full">
      <div v-if="images.length">
        <ArcticSeaIceViewer :images="images" />
      </div>
      <div v-else class="text-center text-gray-500">请上传图片并选择月份以查看预测结果</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import ArcticSeaIceViewer from '../components/ArcticSeaIceViewer.vue'
import { useMonthPrediction } from '@/common/api'

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

const selectedMonth = ref(null)
const images = ref([])
const showResults = ref(false)
const fileList = ref([]) // Store multiple image files

const handleBeforeUpload = (file) => {
  const isPNG = file.type === 'image/png'
  if (!isPNG) {
    message.error('仅支持PNG文件')
  }
  return isPNG
}

const handleUploadChange = (info) => {
  const { status } = info.file
  if (status === 'done') {
    message.success(`${info.file.name} 文件上传成功`)
  } else if (status === 'error') {
    message.error(`${info.file.name} 文件上传失败`)
  }
}

const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj)
  }
  images.value.push(file.url || file.preview)
}

const handleSubmit = () => {
  if (selectedMonth.value && fileList.value.length === 14) {
    const startYear = selectedMonth.value.year()
    const startMonth = selectedMonth.value.month()

    useMonthPrediction(startYear, startMonth).then((res) => {
      images.value = res
      showResults.value = true // 显示预测结果
    })
  } else {
    message.error(fileList.value.length !== 14 ? '请上传14张图片' : '请选择月份')
  }
}

const handleBack = () => {
  showResults.value = false
  images.value = []
  selectedMonth.value = null
}
</script>
