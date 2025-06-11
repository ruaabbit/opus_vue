<template>
  <div class="uncertainty-container">
    <div class="developing-message">{{ $t('common.developing') }}</div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

useI18n()
</script>

<style scoped>
.uncertainty-container {
  width: 100%;
  max-width: 1200px;
  margin: auto auto;
}

.developing-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 36px;
  color: #909399;
}
</style>
