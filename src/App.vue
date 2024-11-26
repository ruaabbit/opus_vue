<template>
  <el-config-provider :locale="zhCn">
    <el-container class="min-h-screen">
      <!-- Sider with dark theme -->
      <el-aside
        :width="isCollapse ? '64px' : '200px'"
        class="transition-all bg-[#001529] overflow-hidden"
      >
        <div class="h-full flex flex-col">
          <div class="flex justify-center items-center h-16 my-4 flex-shrink-0">
            <img src="@/assets/logo_01.svg" class="max-h-full object-contain" alt="OUC AI GROUP" />
            <strong v-show="!isCollapse" class="text-white ml-2">OUC AI GROUP</strong>
          </div>

          <el-menu
            :collapse="isCollapse"
            class="flex-1 border-none !h-auto rounded-menu"
            :default-active="activeRoute"
            @select="handleSelect"
            background-color="#001529"
            text-color="#ffffff"
            active-text-color="#409EFF"
          >
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <template #title>实时逐日预报</template>
            </el-menu-item>

            <el-menu-item index="/real-time-monthly-forecast">
              <el-icon><Calendar /></el-icon>
              <template #title>实时逐月预报</template>
            </el-menu-item>

            <el-menu-item index="/daily-forecast-predict">
              <el-icon><TrendCharts /></el-icon>
              <template #title>逐日预报测试</template>
            </el-menu-item>

            <el-menu-item index="/monthly-forecast-predict">
              <el-icon><Histogram /></el-icon>
              <template #title>逐月预报测试</template>
            </el-menu-item>

            <el-menu-item index="/uncertainty-analysis">
              <el-icon><Share /></el-icon>
              <template #title>不确定性分析</template>
            </el-menu-item>

            <el-menu-item index="/dynamics-analysis">
              <el-icon><Lightning /></el-icon>
              <template #title>动力学分析</template>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>

      <el-container>
        <!-- Header -->
        <el-header class="bg-gradient-to-r from-[#001529] to-[#003192] p-0 shadow-md">
          <div class="flex justify-between items-center px-6 h-full">
            <el-button
              aria-label="Collapse Menu"
              @click="toggleCollapse"
              class="collapse-btn !p-2 rounded-full hover:bg-opacity-90 transition-all duration-300"
              :class="{ 'rotate-180': !isCollapse }"
            >
              <el-icon :size="20" class="text-white">
                <component :is="isCollapse ? Expand : Fold" />
              </el-icon>
            </el-button>

            <div class="text-center flex-1">
              <h1 class="text-white text-2xl font-bold mb-1">
                北极海冰时空多尺度预报基础模型 MetaICE
              </h1>
              <p class="text-gray-200 text-base m-0">
                MetaICE: Foundation Model for Arctic Sea Ice Spatio-Temporal Multi-Scale Forecasting
              </p>
            </div>
            <a
              href="https://kmrvyozrlx.k.topthink.com/@oucaigroup/readme.html"
              target="_blank"
              class="text-white hover:text-blue-300 text-lg font-medium no-underline"
            >
              关于我们
            </a>
          </div>
        </el-header>

        <!-- Content -->
        <el-main class="p-6 bg-[#f0f2f5]">
          <div class="bg-white p-6 min-h-[360px] rounded-lg shadow-sm">
            <router-view></router-view>
          </div>
        </el-main>

        <!-- Footer -->
        <el-footer class="text-center text-gray-600 py-4">
          OUC AI GROUP 2024 Copyright by 中国海洋大学人工智能研究院
        </el-footer>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  House,
  Calendar,
  TrendCharts,
  Histogram,
  Share,
  Lightning,
  Expand,
  Fold
} from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const route = useRoute()
const router = useRouter()
const activeRoute = ref(route.path)
const isCollapse = ref(false)

watch(
  () => route.path,
  (newPath) => {
    activeRoute.value = newPath
  }
)

const handleSelect = (key) => {
  router.push(key)
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style>
/* 深色主题菜单样式 */
.el-menu {
  border-right: none;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 8px; /* 添加间距 */
  border-radius: 8px; /* 添加圆角 */
}

/* 悬停状态 */
.el-menu-item:hover {
  background-color: #1890ff !important;
  border-radius: 8px; /* 保持圆角 */
}

/* 激活状态 */
.el-menu-item.is-active {
  background-color: #1890ff !important;
  color: #ffffff !important;
  border-radius: 8px; /* 保持圆角 */
}

/* 折叠状态下的样式调整 */
.el-menu--collapse .el-menu-item {
  margin: 4px 2px; /* 折叠时减小间距 */
}

/* 去除侧边栏滚动条 */
.el-aside {
  transition: width 0.3s ease;
}

/* 调整菜单容器高度 */
.el-menu--collapse {
  width: 64px;
}

/* 调整内容区域的过渡效果 */
.el-main {
  transition: all 0.3s ease;
}

/* 确保图标垂直居中 */
.el-menu-item .el-icon {
  vertical-align: middle;
  margin-right: 5px;
}

/* 优化标题栏阴影效果 */
.el-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 圆角菜单容器 */
.rounded-menu {
  padding: 4px; /* 为菜单项留出空间 */
}

/* 折叠按钮样式 */
.collapse-btn {
  background-color: rgba(255, 255, 255, 0.9) !important;
  transform-origin: center;
  transition: all 0.3s ease-in-out !important;
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.25) !important;
}

.collapse-btn.rotate-180 {
  transform: rotate(180deg);
}
</style>
