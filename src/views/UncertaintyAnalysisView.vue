<template>
  <div class="uncertainty-container">
    <el-card class="analysis-card">
      <div class="developing-message">
        正在开发中
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.uncertainty-container {
  max-width: 1200px;
  margin: 0 auto;
}

.analysis-card {
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.developing-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 24px;
  color: #909399;
}
</style>
