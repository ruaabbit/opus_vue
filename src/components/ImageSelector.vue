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
      <img src="/picture/land_image.webp" alt="Selectable Image" draggable="false" />
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
    <div class="selection-info-container" v-if="lastSelection.isVisible">
      <div class="selection-info">
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
      <button class="clear-button" @click="clearSelection">清除选择</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

// 定义props和emits用于v-model双向绑定
const props = defineProps({
  topLeft: {
    type: Object,
    default: () => ({ x: null, y: null })
  },
  bottomRight: {
    type: Object,
    default: () => ({ x: null, y: null })
  },
  width: {
    type: Number,
    default: 432
  },
  height: {
    type: Number,
    default: 432
  }
})

const emit = defineEmits(['update:topLeft', 'update:bottomRight'])

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

    // 更新坐标到父组件
    emit('update:topLeft', {
      x: Math.round(lastSelection.left),
      y: Math.round(lastSelection.top)
    })

    emit('update:bottomRight', {
      x: Math.round(lastSelection.left + lastSelection.width),
      y: Math.round(lastSelection.top + lastSelection.height)
    })
  }
}

// 初始化时，如果props中有坐标，则显示选择框
watch(
  () => [props.topLeft, props.bottomRight],
  ([newTopLeft, newBottomRight]) => {
    if (
      newTopLeft?.x !== null &&
      newTopLeft?.y !== null &&
      newBottomRight?.x !== null &&
      newBottomRight?.y !== null
    ) {
      lastSelection.left = newTopLeft.x
      lastSelection.top = newTopLeft.y
      lastSelection.width = newBottomRight.x - newTopLeft.x
      lastSelection.height = newBottomRight.y - newTopLeft.y
      lastSelection.isVisible = true
    } else {
      // 如果有任何坐标为null，则不显示选择框
      lastSelection.isVisible = false
    }
  },
  { immediate: true }
)

const clearSelection = () => {
  lastSelection.left = 0
  lastSelection.top = 0
  lastSelection.width = 0
  lastSelection.height = 0
  lastSelection.isVisible = false

  // 重置selectionRect，防止下次选择时出现异常行为
  selectionRect.left = 0
  selectionRect.top = 0
  selectionRect.width = 0
  selectionRect.height = 0

  emit('update:topLeft', { x: null, y: null })
  emit('update:bottomRight', { x: null, y: null })
}
</script>

<style scoped>
.image-selector {
  display: flex;
  gap: 20px;
}

.image-container {
  position: relative;
  width: v-bind(width + 'px');
  height: v-bind(height + 'px');
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

.selection-info-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.selection-info {
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.clear-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #ff0000;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.clear-button:hover {
  background-color: #cc0000;
}
</style>
