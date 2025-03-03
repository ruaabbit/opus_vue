<template>
  <div class="loading-animation">
    <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle
        class="spinner-circle"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  </div>
</template>

<style scoped>
.loading-animation {
  display: flex;
  justify-content: center;
  align-items: center;
}
.spinner {
  animation: spin 1s linear infinite;
  height: 2rem; /* 相当于 h-8 */
  width: 2rem; /* 相当于 w-8 */
  color: #3b82f6; /* 相当于 text-blue-500 */
}
.spinner-circle {
  opacity: 0.25;
}
.spinner-path {
  opacity: 0.75;
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
