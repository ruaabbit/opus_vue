<template>
  <div class="loading-animation">
    <!-- 加载动画，可以使用 SVG 或者 CSS 动画 -->
    <svg
      class="animate-spin h-8 w-8 text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  </div>
</template>

<script setup>
// 如果需要添加脚本逻辑，可以在这里编写
</script>

<style scoped>
.loading-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  /* 根据需要添加样式 */
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
