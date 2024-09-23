<template>
  <div class="container mx-auto flex flex-col items-center max-h-screen p-4 space-y-4">
    <!-- 返回按钮，预测结果展示时显示 -->
    <el-button v-if="showResults" class="self-start" type="default" @click="handleBack"
      >返回</el-button
    >

    <!-- 表单内容，未提交时显示 -->
    <div v-if="!showResults" class="space-y-4">
      <!-- 图片上传组件 -->
      <el-upload
        class="upload-demo"
        drag
        action=""
        :auto-upload="false"
        :on-change="handleUploadChange"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">拖拽文件到此处，或点击上传</div>
        <div class="el-upload__tip">仅支持PNG文件</div>
      </el-upload>

      <!-- 日历组件 -->
      <el-date-picker v-model="selectedDate" type="date" placeholder="选择日期" />

      <!-- 提交按钮 -->
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>

    <!-- 图片展示，提交后显示 -->
    <div v-if="showResults" class="flex items-center justify-center w-full">
      <div v-if="images.length">
        <ImageGallery :images="images" />
      </div>
      <div v-else class="text-center text-gray-500">请上传图片并选择日期以查看预测结果</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ImageGallery from '@/components/ImageGallery.vue'

import { useDayPrediction } from '@/common/api'

const selectedDate = ref(null)
const images = ref([])
const showResults = ref(false)

const handleUploadChange = (file) => {
  const allowedTypes = ['image/png']
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error('仅支持PNG文件')
    return
  }
  ElMessage.success('上传成功')
}

const handleSubmit = () => {
  if (selectedDate.value) {
    const startDate = selectedDate.value.toLocaleDateString().slice(0, 10)
    useDayPrediction(startDate).then((res) => {
      images.value = res
    })

    // images.value = useDayPrediction(startDate)
    showResults.value = true // 显示预测结果
  } else {
    ElMessage.error('请选择日期')
  }
}

const handleBack = () => {
  showResults.value = false
  images.value = []
  selectedDate.value = null
}
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
