<template>
  <div class="image-selector">
    <div
      class="image-container"
      ref="imageContainer"
      @mousedown="startSelection"
      @mousemove="updateSelection"
      @mouseup="endSelection"
      @mouseleave="endSelection"
    >
      <img src="/src/assets/placeholder.svg" alt="Selectable Image" draggable="false" />
      <div
        v-if="isSelecting"
        class="selection"
        :style="{
          left: `${selectionRect.left}px`,
          top: `${selectionRect.top}px`,
          width: `${selectionRect.width}px`,
          height: `${selectionRect.height}px`
        }"
      ></div>
      <div
        v-if="lastSelection.isVisible"
        class="last-selection"
        :style="{
          left: `${lastSelection.left}px`,
          top: `${lastSelection.top}px`,
          width: `${lastSelection.width}px`,
          height: `${lastSelection.height}px`
        }"
      ></div>
    </div>
    <div class="selection-info" v-if="lastSelection.isVisible">
      <p>最后选择区域尺寸:</p>
      <p>宽度: {{ Math.round(lastSelection.width) }}px</p>
      <p>高度: {{ Math.round(lastSelection.height) }}px</p>
      <p>角坐标:</p>
      <p>左上: ({{ Math.round(lastSelection.left) }}, {{ Math.round(lastSelection.top) }})</p>
      <p>
        右上: ({{ Math.round(lastSelection.left + lastSelection.width) }},
        {{ Math.round(lastSelection.top) }})
      </p>
      <p>
        左下: ({{ Math.round(lastSelection.left) }},
        {{ Math.round(lastSelection.top + lastSelection.height) }})
      </p>
      <p>
        右下: ({{ Math.round(lastSelection.left + lastSelection.width) }},
        {{ Math.round(lastSelection.top + lastSelection.height) }})
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const imageContainer = ref(null)
const isSelecting = ref(false)
const selectionStart = reactive({ x: 0, y: 0 })
const selectionRect = reactive({ left: 0, top: 0, width: 0, height: 0 })
const lastSelection = reactive({
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  isVisible: false
})

const startSelection = (event) => {
  event.preventDefault()
  isSelecting.value = true
  const rect = imageContainer.value.getBoundingClientRect()
  selectionStart.x = event.clientX - rect.left
  selectionStart.y = event.clientY - rect.top
  selectionRect.left = selectionStart.x
  selectionRect.top = selectionStart.y
  selectionRect.width = 0
  selectionRect.height = 0
}

const updateSelection = (event) => {
  if (!isSelecting.value) return

  const rect = imageContainer.value.getBoundingClientRect()
  const currentX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width)
  const currentY = Math.min(Math.max(event.clientY - rect.top, 0), rect.height)

  selectionRect.left = Math.min(currentX, selectionStart.x)
  selectionRect.top = Math.min(currentY, selectionStart.y)
  selectionRect.width = Math.abs(currentX - selectionStart.x)
  selectionRect.height = Math.abs(currentY - selectionStart.y)
}

const endSelection = () => {
  isSelecting.value = false
  if (selectionRect.width > 0 && selectionRect.height > 0) {
    lastSelection.left = selectionRect.left
    lastSelection.top = selectionRect.top
    lastSelection.width = selectionRect.width
    lastSelection.height = selectionRect.height
    lastSelection.isVisible = true
  }
}
</script>

<style scoped>
.image-selector {
  display: flex;
  gap: 20px;
}

.image-container {
  position: relative;
  width: 432px;
  height: 432px;
  user-select: none;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.selection {
  position: absolute;
  border: 2px solid #00ff00;
  background-color: rgba(0, 255, 0, 0.2);
  pointer-events: none;
}

.last-selection {
  position: absolute;
  border: 2px dashed #ff0000;
  background-color: rgba(255, 0, 0, 0.1);
  pointer-events: none;
}

.selection-info {
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}
</style>
